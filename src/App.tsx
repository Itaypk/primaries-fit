import { useEffect, useMemo, useState } from "react";
import type { Answer, Answers } from "./engine/types";
import { buildVoterVector } from "./engine/voter";
import { rankCandidates } from "./engine/score";
import { applyPostRanking, balanceByGender, shuffleAboveThreshold } from "./engine/postRank";
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
import { BrowseScreen } from "./screens/BrowseScreen";
import { CandidateScreen } from "./screens/CandidateScreen";
import { clearProgress, loadProgress, saveProgress } from "./persistence";

type Screen = "welcome" | "quiz" | "results" | "browse" | "candidate";

/** How the ranked list is presented. Post-ranking only — none of these change
 *  a single score; see engine/postRank.ts. */
export type ViewMode = "match" | "balanced" | "close";

/** How far below the best match still counts as "close enough" to shuffle.
 *  Scores cluster tightly near the top, so this is a small band deliberately:
 *  wide enough that the choice is a real one, narrow enough that everyone in
 *  it is genuinely a good match rather than a consolation. */
const CLOSE_ENOUGH_MARGIN = 0.05;

/** Small seeded PRNG (mulberry32). The shuffle is driven by an explicit seed
 *  rather than Math.random so a given seed always yields the same order — the
 *  list can't quietly reshuffle itself under the voter on a re-render. */
function seededRng(seed: number): () => number {
  let a = seed + 0x6d2b79f5;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function App() {
  const { t } = useI18n();

  // Read once, before first paint, so a returning visitor doesn't see the
  // welcome screen flash before their answers come back.
  const [restored] = useState(() => loadProgress(questionnaire.version));

  const [screen, setScreen] = useState<Screen>(restored?.screen ?? "welcome");
  const [qIndex, setQIndex] = useState(restored?.qIndex ?? 0);
  const [answers, setAnswers] = useState<Answers>(restored?.answers ?? {});
  const [selected, setSelected] = useState<string | null>(null);
  // Which screen a candidate drill-down was opened from, so "back" returns
  // there and the detail view knows whether there's a voter to compare against.
  const [selectionOrigin, setSelectionOrigin] = useState<"results" | "browse">("results");
  const [viewMode, setViewMode] = useState<ViewMode>("match");
  const [shuffleSeed, setShuffleSeed] = useState(0);
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

  useEffect(() => {
    // 'candidate' and 'browse' are transient detours off the main flow, not
    // places to restore into, so they persist as their nearest landing screen.
    const persistedScreen =
      screen === "candidate" ? (selectionOrigin === "browse" ? "welcome" : "results") : screen === "browse" ? "welcome" : screen;
    saveProgress({
      version: questionnaire.version,
      answers,
      qIndex,
      screen: persistedScreen,
    });
  }, [answers, qIndex, screen, selectionOrigin]);

  // Post-ranking reshapes the list without touching scores, so the ranking
  // stays explainable in every mode. 'match' is the raw ranking.
  const displayed = useMemo(() => {
    if (viewMode === "match") return ranked;
    const step =
      viewMode === "balanced"
        ? balanceByGender()
        : shuffleAboveThreshold(
            (ranked[0]?.score ?? 0) - CLOSE_ENOUGH_MARGIN,
            seededRng(shuffleSeed),
          );
    return applyPostRanking(ranked, candidates, [step]);
  }, [ranked, viewMode, shuffleSeed]);

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
      setScreen(selectionOrigin === "browse" ? "browse" : "results");
    } else if (screen === "browse") {
      setScreen("welcome");
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
      <Header
        showBack={screen === "quiz" || screen === "candidate" || screen === "browse"}
        onBack={back}
      />
      {screen === "quiz" && <ProgressBar step={qIndex + 1} total={total} pct={progressPct} />}

      {screen === "welcome" && (
        <WelcomeScreen onStart={() => setScreen("quiz")} onBrowse={() => setScreen("browse")} />
      )}

      {screen === "browse" && (
        <BrowseScreen
          onStart={() => setScreen("quiz")}
          onSelect={(id) => {
            setSelected(id);
            setSelectionOrigin("browse");
            setScreen("candidate");
          }}
        />
      )}

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
          ranked={displayed}
          viewMode={viewMode}
          onViewMode={(mode) => {
            setViewMode(mode);
            // Re-picking "close enough" re-rolls the order.
            if (mode === "close") setShuffleSeed((s) => s + 1);
          }}
          openInfo={openInfo}
          onToggleInfo={(id) => setOpenInfo((cur) => (cur === id ? null : id))}
          onSelect={(id) => {
            setSelected(id);
            setSelectionOrigin("results");
            setScreen("candidate");
          }}
          onRestart={restart}
        />
      )}

      {screen === "candidate" && selected && (
        <CandidateScreen
          candidateId={selected}
          score={selectedScore?.score ?? 0}
          breakdown={buildBreakdown(candidatesById[selected], voter, parameters, t, evidence[selected])}
          browsing={selectionOrigin === "browse"}
          onBack={() => setScreen(selectionOrigin === "browse" ? "browse" : "results")}
        />
      )}
    </AppFrame>
  );
}
