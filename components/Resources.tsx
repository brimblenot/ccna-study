import type { DayResources, DriveFile } from "@/lib/content";

function FileButton({ file, kind }: { file: DriveFile; kind: "lab" | "flashcards" }) {
  const isLab = kind === "lab";
  return (
    <div className="flex flex-col rounded-xl border border-line bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`rounded px-1.5 py-0.5 font-mono text-[0.68rem] font-semibold ${
            isLab ? "bg-deep text-white" : "bg-ok text-white"
          }`}
        >
          {isLab ? ".pkt" : ".apkg"}
        </span>
        <span className="text-sm font-medium text-deep">{file.title}</span>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-3">
        <a
          href={file.viewUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-cisco px-4 py-2 text-sm font-semibold text-white hover:bg-cisco-dark"
        >
          Open on Google Drive ↗
        </a>
        <a href={file.downloadUrl} className="text-xs font-medium text-navy underline underline-offset-2 hover:text-cisco-dark">
          download
        </a>
      </div>
    </div>
  );
}

export default function Resources({ files, courseFolderUrl }: { files: DayResources; courseFolderUrl: string }) {
  const hasAny = files.labs.length + files.flashcards.length > 0;
  return (
    <div>
      {hasAny ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {files.labs.map((f) => (
            <FileButton key={f.viewUrl} file={f} kind="lab" />
          ))}
          {files.flashcards.map((f) => (
            <FileButton key={f.viewUrl} file={f} kind="flashcards" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="mb-3 text-sm text-muted">This Day has no lab or flashcard files of its own.</p>
          <a
            href={courseFolderUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded-lg bg-cisco px-4 py-2 text-sm font-semibold text-white hover:bg-cisco-dark"
          >
            Open the course folder ↗
          </a>
        </div>
      )}
      <p className="mt-3 text-xs text-muted">
        <span className="font-mono">.pkt</span> files open in Cisco Packet Tracer.{" "}
        <span className="font-mono">.apkg</span> files open in Anki.
      </p>
    </div>
  );
}
