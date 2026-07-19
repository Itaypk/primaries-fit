import { useMemo, useState } from "react";
import type { Answer, Answers } from "./engine/types";
import { buildVoterVector } from "./engine/voter";
import { rankCandidates } from "./engine/score";
import { candidates, candidatesById, parameters, questionnaire } from "./data";
import { DEFAULT_ACCENT, DEFAULT_AXIS_STYLE } from "./theme";
import { useI18n } from "./i18n";
import { isAnswered } from "./view/question";
import { buildBreakdown } from "./view/results";
import { PhoneFrame } from "./components/PhoneFrame";
import { StatusBar } from "./components/StatusBar";
import { Header } from "./components/Header";
import { ProgressBar } from "./components/ProgressBar";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { QuizScreen } from "./screens/QuizScreen";
import { ResultsScreen } from "./screens/ResultsScreen";
import { CandidateScreen } from "./screens/CandidateScreen";

type Screen = "welcome" | "quiz" | "results" | "candidate";

export default function App() {
  const { t } = useI18n();
  const [screen, setScreen] = useState<Screen>("welcome");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
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
    <PhoneFrame accent={DEFAULT_ACCENT}>
      <StatusBar />
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
          breakdown={buildBreakdown(candidatesById[selected], voter, parameters, t)}
          onBack={() => setScreen("results")}
        />
      )}
    </PhoneFrame>
  );
}
