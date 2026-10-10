"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { QuizQuestion } from "@/lib/lesson-schema";
import { QUIZ_ROOT_ID, quizHasKeyboard } from "@/lib/quiz-focus";
import Markdown from "./Markdown";

const LETTERS = ["1", "2", "3", "4"];

export default function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const q = questions[index];
  const answered = selected !== null;
  const score = results.filter(Boolean).length;

  const choose = useCallback(
    (i: number) => {
      if (answered || finished) return;
      setSelected(i);
      setResults((r) => [...r, i === q.answerIndex]);
    },
    [answered, finished, q],
  );

  const advance = useCallback(() => {
    if (!answered) return;
    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex(index + 1);
      setSelected(null);
    }
  }, [answered, index, questions.length]);

  const retry = useCallback(() => {
    setIndex(0);
    setSelected(null);
    setResults([]);
    setFinished(false);
    rootRef.current?.scrollIntoView({ block: "start" });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!quizHasKeyboard()) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      const n = LETTERS.indexOf(e.key);
      if (n !== -1 && !finished) {
        e.preventDefault();
        choose(n);
        return;
      }
      if (e.key === "ArrowRight" || e.key === "Enter") {
        // Let Enter on a focused button do its own click instead of double-firing.
        if (e.key === "Enter" && target && (target.tagName === "BUTTON" || target.tagName === "A")) return;
        e.preventDefault();
        if (finished) return;
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, advance, finished]);

  useEffect(() => {
    if (answered) nextRef.current?.focus({ preventScroll: true });
  }, [answered]);

  const pct = Math.round((score / questions.length) * 100);

  return (
    <div ref={rootRef} id={QUIZ_ROOT_ID} className="rounded-2xl border border-line bg-white shadow-sm">
      {/* progress strip: one cell per question */}
      <div className="flex gap-1 rounded-t-2xl border-b border-line bg-soft px-4 py-3 sm:px-6">
        {questions.map((_, i) => {
          const r = results[i];
          const cls =
            r === true ? "bg-ok" : r === false ? "bg-bad" : i === index && !finished ? "bg-cisco" : "bg-[#cfdbe5]";
          return <span key={i} className={`h-1.5 flex-1 rounded-full ${cls}`} />;
        })}
      </div>

      {finished ? (
        <div className="px-4 py-8 text-center sm:px-6">
          <div className="font-mono text-xs uppercase tracking-wider text-muted">Quiz complete</div>
          <div className={`mt-2 text-5xl font-bold ${pct >= 80 ? "text-ok-dark" : "text-deep"}`}>
            {score}/{questions.length}
          </div>
          <p className="mt-2 text-muted">
            {pct === 100
              ? "Perfect score. This Day is locked in."
              : pct >= 80
                ? "Solid. Skim the explanations for the ones you missed."
                : pct >= 60
                  ? "Getting there. Re-read the sections behind the missed questions, then retry."
                  : "Worth another pass through the lesson before retrying."}
          </p>
          <button
            type="button"
            onClick={retry}
            className="mt-6 rounded-lg bg-cisco px-5 py-2.5 font-semibold text-white hover:bg-cisco-dark"
          >
            ↻ Retry quiz
          </button>
        </div>
      ) : (
        <div className="px-4 py-6 sm:px-6">
          <div className="mb-3 flex items-center justify-between font-mono text-xs text-muted">
            <span>
              Question {index + 1} of {questions.length}
            </span>
            <span>score {score}</span>
          </div>
          <div className="text-lg font-medium text-deep">
            <Markdown tight>{q.question}</Markdown>
          </div>

          <div className="mt-5 grid gap-2.5" role="group" aria-label="Answer options">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.answerIndex;
              const isChosen = i === selected;
              let cls = "border-line bg-white hover:border-cisco hover:bg-[#f2fafe]";
              if (answered) {
                if (isCorrect) cls = "border-ok bg-[#f0f9ec]";
                else if (isChosen) cls = "border-bad bg-[#fdf0f0]";
                else cls = "border-line bg-white opacity-60";
              }
              return (
                <button
                  key={i}
                  type="button"
                  disabled={answered}
                  onClick={() => choose(i)}
                  className={`flex items-start gap-3 rounded-lg border-2 px-3.5 py-3 text-left transition ${cls}`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-xs font-semibold ${
                      answered && isCorrect
                        ? "bg-ok text-white"
                        : answered && isChosen
                          ? "bg-bad text-white"
                          : "bg-soft text-navy"
                    }`}
                  >
                    {answered && isCorrect ? "✓" : answered && isChosen ? "✗" : LETTERS[i]}
                  </span>
                  <span className="text-[0.97rem]">{opt}</span>
                </button>
              );
            })}
          </div>

          {answered && (
            <div
              className={`mt-5 rounded-lg border-l-4 px-4 py-3 ${
                selected === q.answerIndex ? "border-ok bg-[#f2faee]" : "border-bad bg-[#fdf3f3]"
              }`}
              aria-live="polite"
            >
              <div
                className={`mb-1 text-sm font-bold ${selected === q.answerIndex ? "text-ok-dark" : "text-bad"}`}
              >
                {selected === q.answerIndex ? "Correct" : `Not quite. The answer is ${LETTERS[q.answerIndex]}.`}
              </div>
              <Markdown tight>{q.explanation}</Markdown>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="hidden font-mono text-[0.7rem] text-muted sm:block">
              keys: 1–4 answer · enter / → next
            </span>
            <button
              ref={nextRef}
              type="button"
              disabled={!answered}
              onClick={advance}
              className="ml-auto rounded-lg bg-deep px-5 py-2 font-semibold text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:opacity-30"
            >
              {index + 1 >= questions.length ? "See score" : "Next question →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
