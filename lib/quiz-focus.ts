/**
 * The quiz owns the keyboard (1-4, Enter, arrows) while it sits in the middle band of the viewport.
 * Measured at key-press time so it never goes stale.
 */
export const QUIZ_ROOT_ID = "quiz-root";

export function quizHasKeyboard(): boolean {
  const el = document.getElementById(QUIZ_ROOT_ID);
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const top = window.innerHeight * 0.35;
  const bottom = window.innerHeight * 0.65;
  return rect.top < bottom && rect.bottom > top;
}
