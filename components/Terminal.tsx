"use client";

import { useState } from "react";
import Markdown from "./Markdown";

/** A CLI block styled like a device console, with a copy button for the command(s). */
export default function Terminal({
  prompt,
  command,
  output,
  explanation,
}: {
  prompt: string;
  command: string;
  output?: string;
  explanation: string;
}) {
  const [copied, setCopied] = useState(false);
  const device = prompt.match(/^[A-Za-z0-9_-]+/)?.[0] ?? "console";
  const lines = command.split("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked; nothing to do
    }
  };

  return (
    <div className="my-6">
      <div className="terminal overflow-hidden rounded-xl border border-[#1d3557] shadow-sm">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#102544] px-4 py-1.5 text-xs">
          <span className="flex items-center gap-2 text-[#8fb3cf]">
            <span className="inline-block h-2 w-2 rounded-full bg-ok" />
            {device}
          </span>
          <button
            type="button"
            onClick={copy}
            className="rounded px-2 py-0.5 text-[#8fb3cf] hover:bg-white/10 hover:text-white"
            aria-label="Copy command"
          >
            {copied ? "copied ✓" : "copy"}
          </button>
        </div>
        <pre className="overflow-x-auto px-4 py-3 text-[0.86rem] leading-relaxed">
          {lines.map((line, i) => (
            <div key={i}>
              <span className="prompt select-none">{prompt}</span>
              <span className="text-white">{line}</span>
            </div>
          ))}
          {output && <div className="output mt-1 whitespace-pre">{output}</div>}
        </pre>
      </div>
      <div className="mt-3 border-l-2 border-cisco/50 pl-4">
        <Markdown tight>{explanation}</Markdown>
      </div>
    </div>
  );
}
