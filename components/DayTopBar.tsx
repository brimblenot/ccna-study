"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { markVisited } from "@/lib/progress";
import { quizHasKeyboard } from "@/lib/quiz-focus";

interface Neighbor {
  day: number;
  title: string;
}

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

export default function DayTopBar({
  day,
  title,
  prev,
  next,
}: {
  day: number;
  title: string;
  prev: Neighbor | null;
  next: Neighbor | null;
}) {
  const router = useRouter();

  useEffect(() => {
    markVisited(day);
  }, [day]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (isTypingTarget(e.target) || quizHasKeyboard()) return;
      if (document.querySelector('[role="dialog"]')) return;
      if (e.key === "ArrowLeft" && prev) router.push(`/day/${prev.day}`);
      if (e.key === "ArrowRight" && next) router.push(`/day/${next.day}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, prev, next]);

  const navBtn =
    "flex h-9 items-center gap-1.5 rounded-md border border-white/20 px-2.5 font-mono text-xs text-white/90 transition hover:border-cisco hover:bg-white/10 sm:px-3";

  return (
    <header className="sticky top-0 z-40 border-b border-[#0a2140] bg-deep/95 text-white shadow-md backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="shrink-0 font-mono text-xs text-cisco hover:text-white" aria-label="All Days">
          ⌂ <span className="hidden sm:inline">all days</span>
        </Link>
        <span className="h-5 w-px bg-white/20" aria-hidden />
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className="shrink-0 rounded bg-cisco px-1.5 py-0.5 font-mono text-xs font-semibold">
            DAY {String(day).padStart(2, "0")}
          </span>
          <span className="truncate text-sm font-semibold sm:text-base">{title}</span>
        </div>
        <nav aria-label="Day navigation" className="flex shrink-0 gap-2">
          {prev ? (
            <Link href={`/day/${prev.day}`} className={navBtn} title={`Day ${prev.day}: ${prev.title}  (←)`}>
              ← <span className="hidden md:inline">Day {prev.day}</span>
            </Link>
          ) : (
            <span className={`${navBtn} pointer-events-none opacity-30`}>←</span>
          )}
          {next ? (
            <Link href={`/day/${next.day}`} className={navBtn} title={`Day ${next.day}: ${next.title}  (→)`}>
              <span className="hidden md:inline">Day {next.day}</span> →
            </Link>
          ) : (
            <span className={`${navBtn} pointer-events-none opacity-30`}>→</span>
          )}
        </nav>
      </div>
    </header>
  );
}
