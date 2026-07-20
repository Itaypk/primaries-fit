import { useEffect, useMemo, useState } from "react";
import type { Answer, Answers } from "./engine/types";
import { buildVoterVector } from "./engine/voter";
import { rankCandidates } from "./engine/score";
import { candidates, candidatesById, evidence, parameters, questionnaire } from "./data";
import { DEFAULT_ACCENT, DEFAULT_AXIS_STYLE } from "./theme";
import { useI18n } from "./i18n";
import { isAnswered } from "./view/question";
import { buildBreakdown } from "./view/results";
import { AppFrame } from "./components/AppFrame";
import { Header } from "./components/Header";
import { ProgressBar } from "./components/ProgressBar";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { QuizScreen } from "./screens/QuizScreen";
import { ResultsScreen } from "./screens/ResultsScreen";
import { CandidateScreen } from "./screens/CandidateScreen";
import { clearProgress, loadProgress, saveProgress } from "./persistence";

type Screen = "welcome" | "quiz" | "results" | "candidate";

export default function App() {
  const { t } = useI18n();

  // Read once, before first paint, so a returning visitor doesn't see the
  // welcome screen flash before their answers come back.
  const [restored] = useState(() => loadProgress(questionnaire.version));

  const [screen, setScreen] = useState<Screen>(restored?.screen ?? "welcome");
  const [qIndex, setQIndex] = useState(restored?.qIndex ?? 0);
  const [answers, setAnswers] = useState<Answers>(restored?.answers ?? {});
  const [selected, setSelected] = useState<string | null>(null);
  const [openInfo, setOpenInfo] = useState<string | null>(null);

  const total = questionnaire.questions.length;
  const question = questionnaire.questions[qIndex];
  const answered = isAnswered(question, answers[question.id]);

  // The voter reduced to the parameter space, and the resulting ranking.
  const voter = useMemo(
    () => buildVoterVector(answers, questionnaire, parameters),
    [answers],
  );
  const ranked = useMemo(
    () => rankCandidates(candidates, voter, parameters),
    [voter],
  );

  // 'candidate' is a transient drill-down off the results list, not a place to
  // land on reload, so it persists as 'results'.
  useEffect(() => {
    saveProgress({
      version: questionnaire.version,
      answers,
      qIndex,
      screen: screen === "candidate" ? "results" : screen,
    });
  }, [answers, qIndex, screen]);

  function setAnswer(value: Answer) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function toggleOption(optionId: string) {
    setAnswers((prev) => {
      const cur = Array.isArray(prev[question.id]) ? (prev[question.id] as string[]) : [];
      const next = cur.includes(optionId)
        ? cur.filter((k) => k !== optionId)
        : [...cur, optionId];
      return { ...prev, [question.id]: next };
    });
  }

  function next() {
    if (qIndex < total - 1) setQIndex(qIndex + 1);
    else {
      setScreen("results");
      setOpenInfo(null);
    }
  }

  function back() {
    if (screen === "candidate") {
      setScreen("results");
    } else if (qIndex > 0) {
      setQIndex(qIndex - 1);
    } else {
      setScreen("welcome");
    }
  }

  function restart() {
    clearProgress();
    setScreen("welcome");
    setQIndex(0);
    setAnswers({});
    setOpenInfo(null);
    setSelected(null);
  }

  const filled = qIndex + (answered ? 1 : 0);
  const progressPct = Math.round((filled / total) * 100);

  const selectedScore = ranked.find((c) => c.candidateId === selected);

  return (
    <AppFrame accent={DEFAULT_ACCENT}>
      <Header showBack={screen === "quiz" || screen === "candidate"} onBack={back} />
      {screen === "quiz" && <ProgressBar step={qIndex + 1} total={total} pct={progressPct} />}

      {screen === "welcome" && <WelcomeScreen onStart={() => setScreen("quiz")} />}

      {screen === "quiz" && (
        <QuizScreen
          question={question}
          answer={answers[question.id]}
          axisStyle={DEFAULT_AXIS_STYLE}
          answered={answered}
          isLast={qIndex === total - 1}
          onAnswer={setAnswer}
          onToggleOption={toggleOption}
          onNext={next}
        />
      )}

      {screen === "results" && (
        <ResultsScreen
          ranked={ranked}
          openInfo={openInfo}
          onToggleInfo={(id) => setOpenInfo((cur) => (cur === id ? null : id))}
          onSelect={(id) => {
            setSelected(id);
            setScreen("candidate");
          }}
          onRestart={restart}
        />
      )}

      {screen === "candidate" && selected && selectedScore && (
        <CandidateScreen
          candidateId={selected}
          score={selectedScore.score}
          breakdown={buildBreakdown(candidatesById[selected], voter, parameters, t, evidence[selected])}
          onBack={() => setScreen("results")}
        />
      )}
    </AppFrame>
  );
}
