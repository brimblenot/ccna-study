/**
 * Validate every content/lessons/day-NN.json:
 *  - matches the Zod lesson schema
 *  - every manifest image for that Day appears exactly once
 *  - every image src exists on disk under /public
 *
 * Usage: npm run validate
 */
import { promises as fs, existsSync } from "node:fs";
import path from "node:path";
import { Lesson, type Block } from "../lib/lesson-schema";

const ROOT = process.cwd();
const LESSONS_DIR = path.join(ROOT, "content", "lessons");
const MANIFEST_PATH = path.join(ROOT, "content", "manifest.json");

interface ManifestDay {
  day: number;
  title: string;
  parts: { part: string; images: { url: string; localPath: string }[] }[];
}

async function main() {
  const manifest: ManifestDay[] = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8"));
  const byDay = new Map(manifest.map((d) => [d.day, d]));

  let files: string[] = [];
  try {
    files = (await fs.readdir(LESSONS_DIR)).filter((f) => /^day-\d{2}\.json$/.test(f)).sort();
  } catch {
    // no lessons yet
  }
  if (files.length === 0) {
    console.log("No lessons found in content/lessons.");
    return;
  }

  let errorCount = 0;
  const report = (file: string, msg: string) => {
    errorCount++;
    console.log(`  ✗ ${file}: ${msg}`);
  };

  for (const file of files) {
    const errorsBefore = errorCount;
    const raw = await fs.readFile(path.join(LESSONS_DIR, file), "utf8");
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch (err) {
      report(file, `invalid JSON (${(err as Error).message})`);
      continue;
    }

    const parsed = Lesson.safeParse(json);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) report(file, `${issue.path.join(".") || "(root)"}: ${issue.message}`);
      continue;
    }
    const lesson = parsed.data;

    const expectedDay = Number(file.slice(4, 6));
    if (lesson.day !== expectedDay) report(file, `day field is ${lesson.day}, expected ${expectedDay}`);

    const imageBlocks: Extract<Block, { type: "image" }>[] = lesson.parts.flatMap((p) =>
      p.sections.flatMap((s) => s.blocks.filter((b): b is Extract<Block, { type: "image" }> => b.type === "image")),
    );

    const counts = new Map<string, number>();
    for (const b of imageBlocks) {
      counts.set(b.src, (counts.get(b.src) ?? 0) + 1);
      if (!existsSync(path.join(ROOT, "public", b.src))) report(file, `image file missing on disk: ${b.src}`);
    }

    const manifestDay = byDay.get(lesson.day);
    const expected = manifestDay ? manifestDay.parts.flatMap((p) => p.images.map((i) => i.localPath)) : [];
    for (const src of expected) {
      const n = counts.get(src) ?? 0;
      if (n !== 1) report(file, `manifest image ${src} appears ${n} times (expected exactly 1)`);
    }
    const expectedSet = new Set(expected);
    for (const src of counts.keys()) {
      if (!expectedSet.has(src)) report(file, `image ${src} is not in the manifest for Day ${lesson.day}`);
    }

    if (manifestDay && manifestDay.parts.length > 1 && lesson.parts.length !== manifestDay.parts.length) {
      report(file, `has ${lesson.parts.length} parts, notes have ${manifestDay.parts.length}`);
    }

    const ok = errorCount === errorsBefore;
    console.log(
      `${ok ? "✓" : "•"} ${file}  ${imageBlocks.length}/${expected.length} images, ${lesson.quiz.length} quiz questions`,
    );
  }

  console.log(`\n${files.length} lesson(s) checked, ${errorCount} error(s).`);
  if (errorCount > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
