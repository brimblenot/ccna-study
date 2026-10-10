/**
 * Ingest the raw course notes:
 *  - parse Day number / part letter / title from each filename
 *  - extract every image URL in reading order
 *  - download images to public/notes/day-NN/<part><index>.<ext>
 *  - write content/manifest.json
 *
 * Usage: npm run ingest
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const NOTES_DIR = path.join(ROOT, "content", "raw", "Course_Notes");
const PUBLIC_DIR = path.join(ROOT, "public");
const MANIFEST_PATH = path.join(ROOT, "content", "manifest.json");

const CONCURRENCY = 4;
const RETRIES = 2;

// Multi-file Days get a combined title instead of the first part's title.
const COMBINED_TITLES: Record<number, string> = {
  11: "Routing Fundamentals and Static Routing",
  54: "Virtualization and Cloud",
};

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};
const KNOWN_EXTS = [...new Set(Object.values(EXT_BY_TYPE))];

export interface ManifestImage {
  url: string;
  /** Path relative to /public, usable directly as an <img src>, e.g. "/notes/day-01/03.png". */
  localPath: string;
}
export interface ManifestPart {
  part: string; // "" for single-file Days, otherwise "a", "b", "c"
  title: string;
  file: string; // filename inside content/raw/Course_Notes
  images: ManifestImage[];
}
export interface ManifestDay {
  day: number;
  title: string;
  parts: ManifestPart[];
}

interface PendingDownload {
  url: string;
  dir: string;
  baseName: string;
  image: ManifestImage;
}

const FILENAME_RE = /^Day (\d{2})([a-z]?) - (.+)\.md$/;
// Matches ![alt](url "optional title") and <img ... src="url" ...> in document order.
const IMAGE_RE = /!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)|<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;

function extractImageUrls(markdown: string): string[] {
  const urls: string[] = [];
  for (const m of markdown.matchAll(IMAGE_RE)) {
    const url = (m[1] ?? m[2]).trim();
    if (url) urls.push(url);
  }
  return urls;
}

async function findExisting(dir: string, baseName: string): Promise<string | null> {
  for (const ext of KNOWN_EXTS) {
    const candidate = path.join(dir, `${baseName}.${ext}`);
    try {
      const stat = await fs.stat(candidate);
      if (stat.size > 0) return `${baseName}.${ext}`;
    } catch {
      // not there
    }
  }
  return null;
}

function extFromResponse(contentType: string | null, url: string): string {
  const type = (contentType ?? "").split(";")[0].trim().toLowerCase();
  if (EXT_BY_TYPE[type]) return EXT_BY_TYPE[type];
  const fromUrl = path.extname(new URL(url).pathname).slice(1).toLowerCase();
  if (KNOWN_EXTS.includes(fromUrl)) return fromUrl;
  if (fromUrl === "jpeg") return "jpg";
  return "png";
}

async function downloadOnce(item: PendingDownload): Promise<string> {
  const res = await fetch(item.url, { redirect: "follow", headers: { "User-Agent": "ccna-study-ingest" } });
  if (res.status === 429) {
    // Rate limited: honour Retry-After (default 30s) before the next attempt.
    const retryAfter = Number(res.headers.get("retry-after")) || 30;
    await new Promise((r) => setTimeout(r, Math.min(retryAfter, 120) * 1000));
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const contentType = res.headers.get("content-type");
  if (contentType && !contentType.startsWith("image/") && !contentType.startsWith("application/octet-stream")) {
    throw new Error(`unexpected content-type ${contentType}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length === 0) throw new Error("empty response");
  const fileName = `${item.baseName}.${extFromResponse(contentType, res.url || item.url)}`;
  await fs.writeFile(path.join(item.dir, fileName), buffer);
  return fileName;
}

async function download(item: PendingDownload): Promise<{ ok: boolean; error?: string }> {
  let lastError = "";
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const fileName = await downloadOnce(item);
      item.image.localPath = toWebPath(item.dir, fileName);
      return { ok: true };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt < RETRIES) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  return { ok: false, error: lastError };
}

function toWebPath(dir: string, fileName: string): string {
  return "/" + path.relative(PUBLIC_DIR, path.join(dir, fileName)).split(path.sep).join("/");
}

async function runPool<T>(items: T[], worker: (item: T) => Promise<void>, size: number) {
  let next = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      await worker(item);
    }
  });
  await Promise.all(runners);
}

async function main() {
  const files = (await fs.readdir(NOTES_DIR)).filter((f) => f.endsWith(".md")).sort();
  const days = new Map<number, ManifestDay>();
  const pending: PendingDownload[] = [];
  let skipped = 0;

  for (const file of files) {
    const match = FILENAME_RE.exec(file);
    if (!match) {
      console.warn(`! Skipping unrecognised filename: ${file}`);
      continue;
    }
    const day = Number(match[1]);
    const part = match[2];
    // Filenames can't contain "/", so restore it where the notes' titles need it.
    const title = match[3].trim().replace(/TCP-IP/g, "TCP/IP");
    const markdown = await fs.readFile(path.join(NOTES_DIR, file), "utf8");
    const urls = extractImageUrls(markdown);

    const dayDir = path.join(PUBLIC_DIR, "notes", `day-${String(day).padStart(2, "0")}`);
    await fs.mkdir(dayDir, { recursive: true });

    const images: ManifestImage[] = [];
    for (const [i, url] of urls.entries()) {
      const baseName = `${part}${String(i + 1).padStart(2, "0")}`;
      const image: ManifestImage = { url, localPath: "" };
      images.push(image);
      const existing = await findExisting(dayDir, baseName);
      if (existing) {
        image.localPath = toWebPath(dayDir, existing);
        skipped++;
      } else {
        pending.push({ url, dir: dayDir, baseName, image });
      }
    }

    const entry = days.get(day) ?? { day, title, parts: [] };
    entry.parts.push({ part, title, file, images });
    days.set(day, entry);
  }

  for (const [day, entry] of days) {
    if (entry.parts.length > 1) entry.title = COMBINED_TITLES[day] ?? entry.parts.map((p) => p.title).join(" / ");
  }

  const total = pending.length + skipped;
  console.log(`Found ${total} images across ${files.length} files (${skipped} already downloaded, ${pending.length} to fetch).`);

  const failures: { url: string; target: string; error: string }[] = [];
  let done = 0;
  await runPool(
    pending,
    async (item) => {
      const result = await download(item);
      done++;
      if (!result.ok) {
        failures.push({ url: item.url, target: path.join(path.relative(ROOT, item.dir), item.baseName), error: result.error ?? "" });
      }
      if (done % 25 === 0 || done === pending.length) console.log(`  ${done}/${pending.length} fetched`);
    },
    CONCURRENCY,
  );

  const manifest = [...days.values()].sort((a, b) => a.day - b.day);
  for (const d of manifest) d.parts.sort((a, b) => a.part.localeCompare(b.part));
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

  console.log(`\nDownloaded ${pending.length - failures.length}, skipped ${skipped} existing, failed ${failures.length}.`);
  console.log(`Manifest: ${manifest.length} Days -> ${path.relative(ROOT, MANIFEST_PATH)}`);
  if (failures.length) {
    console.log("\nFailures:");
    for (const f of failures) console.log(`  ${f.target}  ${f.url}  (${f.error})`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
