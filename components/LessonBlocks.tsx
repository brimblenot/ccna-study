import type { Block } from "@/lib/lesson-schema";
import Markdown from "./Markdown";
import Terminal from "./Terminal";
import ZoomImage from "./ZoomImage";

const CALLOUTS = {
  tip: { label: "Tip", icon: "i", box: "border-cisco/40 bg-[#eef8fd]", badge: "bg-cisco text-white", text: "text-cisco-dark" },
  examTrap: {
    label: "Exam trap",
    icon: "!",
    box: "border-[#fbab18]/60 bg-[#fff8ea]",
    badge: "bg-[#fbab18] text-deep",
    text: "text-[#9a6400]",
  },
  analogy: { label: "Analogy", icon: "≈", box: "border-navy/30 bg-soft", badge: "bg-navy text-white", text: "text-navy" },
  remember: {
    label: "Remember",
    icon: "✓",
    box: "border-ok/50 bg-[#f2faee]",
    badge: "bg-ok text-white",
    text: "text-ok-dark",
  },
} as const;

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "text":
      return <Markdown>{block.markdown}</Markdown>;
    case "image":
      return <ZoomImage src={block.src} alt={block.alt} explanation={block.explanation} />;
    case "cli":
      return <Terminal prompt={block.prompt} command={block.command} output={block.output} explanation={block.explanation} />;
    case "callout": {
      const c = CALLOUTS[block.variant];
      return (
        <aside className={`my-6 rounded-xl border px-4 py-3.5 sm:px-5 ${c.box}`}>
          <div className={`mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${c.text}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[0.7rem] ${c.badge}`}>
              {c.icon}
            </span>
            {c.label}
          </div>
          <Markdown tight>{block.markdown}</Markdown>
        </aside>
      );
    }
    case "workedExample":
      return (
        <div className="my-6 rounded-xl border border-line bg-white">
          <div className="flex items-center gap-2 rounded-t-xl border-b border-line bg-soft px-4 py-2.5 sm:px-5">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-cisco-dark">Worked example</span>
            <span className="font-semibold text-deep">{block.title}</span>
          </div>
          <ol className="space-y-3 px-4 py-4 sm:px-5">
            {block.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-deep font-mono text-xs text-white">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Markdown tight>{step}</Markdown>
                </div>
              </li>
            ))}
          </ol>
        </div>
      );
  }
}

export default function LessonBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}
