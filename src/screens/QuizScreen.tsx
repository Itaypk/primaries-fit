import type { Answer, Question } from "../engine/types";
import type { AxisStyle } from "../theme";
import { useI18n } from "../i18n";
import { primaryParameter, questionHint, questionTopic } from "../view/question";
import { SliderQuestion } from "../components/questions/SliderQuestion";
import { SegmentedQuestion } from "../components/questions/SegmentedQuestion";
import { BooleanQuestion } from "../components/questions/BooleanQuestion";
import { MultiSelectQuestion } from "../components/questions/MultiSelectQuestion";
import { ImportanceQuestion } from "../components/questions/ImportanceQuestion";
import { parametersById } from "../data";

export function QuizScreen({
  question,
  answer,
  axisStyle,
  answered,
  isLast,
  onAnswer,
  onToggleOption,
  onNext,
}: {
  question: Question;
  answer: Answer | undefined;
  axisStyle: AxisStyle;
  answered: boolean;
  isLast: boolean;
  onAnswer: (value: Answer) => void;
  onToggleOption: (optionId: string) => void;
  onNext: () => void;
}) {
  const { t } = useI18n();
  const paramId = primaryParameter(question) ?? "";

  return (
    <div
      className="scr"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "6px 26px 22px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: "12.5px",
          fontWeight: 700,
          letterSpacing: ".5px",
          color: "var(--accent-ink, #7d3d29)",
          margin: "6px 0 10px",
        }}
      >
        {questionTopic(t, question)}
      </div>
      <h2
        className="serif"
        style={{
          fontSize: "26px",
          lineHeight: 1.28,
          fontWeight: 600,
          color: "#221e1a",
          margin: "0 0 8px",
        }}
      >
        {t.questionTitle(question.id)}
      </h2>
      <p style={{ fontSize: "14px", lineHeight: 1.5, color: "#9a8f7e", margin: "0 0 26px" }}>
        {questionHint(t, question)}
      </p>

      {renderWidget()}

      <div style={{ flex: 1, minHeight: "24px" }} />
      <button
        onClick={onNext}
        disabled={!answered}
        style={{
          width: "100%",
          height: "56px",
          border: "none",
          borderRadius: "16px",
          background: answered ? "var(--accent, #c0684a)" : "#e5dac8",
          color: answered ? "#fff" : "#b3a794",
          fontSize: "17px",
          fontWeight: 700,
          cursor: answered ? "pointer" : "not-allowed",
          boxShadow: answered ? "0 8px 20px -8px var(--accent, #c0684a)" : "none",
        }}
      >
        {isLast ? t.ui.quiz.seeResults : t.ui.quiz.next}
      </button>
    </div>
  );

  function renderWidget() {
    const num = typeof answer === "number" ? answer : null;
    switch (question.widget) {
      case "slider":
      case "segmented":
        return axisStyle === "segmented" ? (
          <SegmentedQuestion parameterId={paramId} value={num} onChange={onAnswer} />
        ) : (
          <SliderQuestion parameterId={paramId} value={num} onChange={onAnswer} />
        );
      case "boolean":
        return (
          <BooleanQuestion
            statement={t.questionStatement(question.id)}
            value={typeof answer === "boolean" ? answer : null}
            onChange={onAnswer}
          />
        );
      case "importance":
        return <ImportanceQuestion value={num} onChange={onAnswer} />;
      case "multiselect": {
        const options = parametersById[paramId]?.options ?? [];
        return (
          <MultiSelectQuestion
            options={options}
            selected={Array.isArray(answer) ? answer : []}
            onToggle={onToggleOption}
          />
        );
      }
    }
  }
}
