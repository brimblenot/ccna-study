"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";

export default function ContinueButton({ titles }: { titles: Record<number, string> }) {
  const { lastDay, ready } = useProgress();
  const day = lastDay && titles[lastDay] ? lastDay : null;

  return (
    <Link
      href={`/day/${day ?? 1}`}
      className={`inline-flex items-center gap-3 rounded-lg bg-cisco px-5 py-3 font-semibold text-white shadow-md shadow-cisco/30 transition hover:bg-cisco-dark ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="font-mono text-sm text-white/80">{day ? "▶ resume" : "▶ start"}</span>
      <span>{day ? `Continue with Day ${day}: ${titles[day]}` : "Start with Day 1"}</span>
    </Link>
  );
}
