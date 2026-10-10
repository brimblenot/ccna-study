"use client";

import { useEffect, useState } from "react";
import Markdown from "./Markdown";

/** Lesson figure: click to open full-size in an overlay. The explanation is always shown as the caption. */
export default function ZoomImage({ src, alt, explanation }: { src: string; alt: string; explanation: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-line bg-white">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full cursor-zoom-in bg-softer p-2"
        aria-label={`Enlarge image: ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="mx-auto max-h-[480px] w-auto rounded-md" />
        <span className="absolute right-3 top-3 rounded bg-deep/80 px-2 py-0.5 font-mono text-[0.7rem] text-white opacity-0 transition group-hover:opacity-100">
          click to zoom
        </span>
      </button>
      <figcaption className="border-t border-line bg-white px-4 py-3 sm:px-5">
        <div className="mb-1 font-mono text-[0.7rem] font-semibold uppercase tracking-wider text-cisco-dark">
          What this shows
        </div>
        <Markdown tight>{explanation}</Markdown>
      </figcaption>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-50 flex flex-col bg-deep/90 p-3 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md bg-white/10 px-3 py-1.5 font-mono text-sm text-white hover:bg-white/20"
            >
              close [esc]
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col items-center gap-3 overflow-auto lg:flex-row lg:items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-[80vh] w-auto max-w-full rounded-lg bg-white lg:max-w-[70%]"
              onClick={(e) => e.stopPropagation()}
            />
            <div
              className="w-full max-w-xl rounded-lg bg-white p-4 text-ink lg:max-h-[80vh] lg:overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Markdown tight>{explanation}</Markdown>
            </div>
          </div>
        </div>
      )}
    </figure>
  );
}
