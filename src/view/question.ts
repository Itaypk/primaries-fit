/** Derives a question's topic + hint (both computed, not stored) from structure. */
import type { Question } from "../engine/types";
import type { Translator } from "../i18n";

/** The parameter a question is "about" — used for its topic chip and poles. */
export function primaryParameter(q: Question): string | undefined {
  if (q.targets && q.targets.length) return q.targets[0].parameter;
  if (q.parameter) return q.parameter;
  if (q.importanceFor && q.importanceFor.length) return q.importanceFor[0];
  return undefined;
}

/** Topic chip = the primary parameter's label. */
export function questionTopic(t: Translator, q: Question): string {
  const p = primaryParameter(q);
  return p ? t.param(p) : "";
}

/** Hint line is a fixed per-widget string. */
export function questionHint(t: Translator, q: Question): string {
  switch (q.widget) {
    case "slider":
    case "segmented":
      return t.ui.quiz.dragHint;
    case "importance":
      return t.ui.quiz.rangeHint;
    case "multiselect":
      return t.ui.quiz.multiHint;
    case "boolean":
      return t.ui.quiz.boolHint;
  }
}

/** Whether a question has been answered (multi needs a non-empty selection). */
export function isAnswered(q: Question, answer: unknown): boolean {
  if (q.widget === "multiselect") return Array.isArray(answer) && answer.length > 0;
  return answer != null;
}
