"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";

export interface PortDay {
  day: number;
  title: string;
  hasLesson: boolean;
}

/** The Day navigator, styled as a switch faceplate: one RJ-45 "port" per Day with a link LED. */
export default function PortPanel({ days }: { days: PortDay[] }) {
  const { visited, lastDay, ready } = useProgress();
  const visitedCount = days.filter((d) => visited.has(d.day)).length;

  return (
    <section aria-labelledby="ports-heading" className="faceplate rounded-xl p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="ports-heading" className="text-lg font-semibold text-deep">
            Course Days
          </h2>
          <p className="text-sm text-muted">Each port is a Day. The link LED turns green once you've opened it.</p>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="port-led" data-state="visited" /> visited
          </span>
          <span className="flex items-center gap-1.5">
            <span className="port-led" data-state="current" /> last opened
          </span>
          <span className="rounded bg-white/70 px-2 py-1 text-deep">
            {ready ? visitedCount : "–"}/{days.length} up
          </span>
        </div>
      </div>

      <ol className="grid grid-cols-[repeat(auto-fill,minmax(5.25rem,1fr))] gap-x-2 gap-y-4">
        {days.map((d) => {
          const state = lastDay === d.day ? "current" : visited.has(d.day) ? "visited" : "off";
          return (
            <li key={d.day}>
              <Link
                href={`/day/${d.day}`}
                className="port tip-wrap group rounded-md outline-none"
                data-pending={!d.hasLesson}
                aria-label={`Day ${d.day}: ${d.title}${d.hasLesson ? "" : " (lesson not written yet)"}${
                  state !== "off" ? ", visited" : ""
                }`}
              >
                <span className="port-led" data-state={state} />
                <span className="port-jack">{String(d.day).padStart(2, "0")}</span>
                <span className="mt-0.5 line-clamp-2 min-h-[2.4em] text-center text-[0.68rem] leading-tight text-muted group-hover:text-deep">
                  {d.title}
                </span>
                <span
                  role="tooltip"
                  className="tip absolute bottom-full left-1/2 z-20 mb-1 w-max max-w-[14rem] rounded-md bg-deep px-2.5 py-1.5 text-xs text-white shadow-lg"
                >
                  <span className="font-mono text-cisco">Day {d.day}</span> · {d.title}
                  {!d.hasLesson && <span className="block text-[0.65rem] text-slate-300">Lesson coming soon</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
