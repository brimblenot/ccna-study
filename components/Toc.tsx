"use client";

import { useEffect, useState } from "react";

export interface TocGroup {
  heading?: string;
  items: { id: string; label: string }[];
}

/** Sidebar table of contents that highlights the section currently being read. */
export default function Toc({ groups }: { groups: TocGroup[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const ids = groups.flatMap((g) => g.items.map((i) => i.id));
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    // The active section is the last one whose top has scrolled above a line ~30% down the viewport.
    const update = () => {
      const line = window.innerHeight * 0.3;
      let current = els[0].id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [groups]);

  return (
    <nav aria-label="Lesson contents" className="text-sm">
      <div className="mb-3 font-mono text-[0.7rem] font-semibold uppercase tracking-wider text-muted">On this page</div>
      <div className="space-y-4">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.heading && <div className="mb-1.5 text-xs font-semibold text-deep">{group.heading}</div>}
            <ul className="space-y-0.5 border-l border-line">
              {group.items.map((item) => {
                const isActive = active === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={isActive ? "location" : undefined}
                      className={`-ml-px block border-l-2 py-1 pl-3 leading-snug transition-colors ${
                        isActive
                          ? "border-cisco font-medium text-cisco-dark"
                          : "border-transparent text-muted hover:border-line hover:text-deep"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
