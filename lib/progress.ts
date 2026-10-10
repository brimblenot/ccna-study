"use client";

import { useEffect, useState } from "react";

/** Per-browser study progress kept in localStorage. Every access is guarded: storage can be unavailable. */
const VISITED_KEY = "ccna:visited";
const LAST_KEY = "ccna:lastDay";
const EVENT = "ccna:progress";

function readVisited(): number[] {
  try {
    const raw = localStorage.getItem(VISITED_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === "number") : [];
  } catch {
    return [];
  }
}

function readLastDay(): number | null {
  try {
    const n = Number(localStorage.getItem(LAST_KEY));
    return Number.isInteger(n) && n >= 1 ? n : null;
  } catch {
    return null;
  }
}

export function markVisited(day: number) {
  try {
    const visited = new Set(readVisited());
    visited.add(day);
    localStorage.setItem(VISITED_KEY, JSON.stringify([...visited].sort((a, b) => a - b)));
    localStorage.setItem(LAST_KEY, String(day));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // storage unavailable: progress just isn't remembered
  }
}

export function useProgress() {
  const [state, setState] = useState<{ visited: Set<number>; lastDay: number | null; ready: boolean }>({
    visited: new Set(),
    lastDay: null,
    ready: false,
  });

  useEffect(() => {
    const sync = () => setState({ visited: new Set(readVisited()), lastDay: readLastDay(), ready: true });
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return state;
}
