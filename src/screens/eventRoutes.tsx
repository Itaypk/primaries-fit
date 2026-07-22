/**
 * Route wrappers for one event's screens. Each pulls the shared session (via the
 * Outlet context) and wires navigation, then renders the matching presentational
 * screen with the same prop API it has always had — so the screens stay dumb and
 * the URL owns "which screen".
 */
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../i18n";
import { useEvent } from "../data/eventContext";
import { encodeAnswers } from "../share";
import { buildBreakdown } from "../view/results";
import { DEFAULT_AXIS_STYLE } from "../theme";
import { useEventSession } from "./EventLayout";
import { WelcomeScreen } from "./WelcomeScreen";
import { QuizScreen } from "./QuizScreen";
import { ResultsScreen } from "./ResultsScreen";
import { BrowseScreen } from "./BrowseScreen";
import { CandidateScreen } from "./CandidateScreen";
import { ReviewScreen } from "./ReviewScreen";

export function WelcomeRoute() {
  const navigate = useNavigate();
  return <WelcomeScreen onStart={() => navigate("quiz")} onBrowse={() => navigate("browse")} />;
}

export function QuizRoute() {
  const s = useEventSession();
  const question = s.event.questionnaire.questions[s.qIndex];
  return (
    <QuizScreen
      question={question}
      answer={s.answers[question.id]}
      axisStyle={DEFAULT_AXIS_STYLE}
      answered={s.answered}
      isLast={s.qIndex === s.total - 1}
      onAnswer={s.setAnswer}
      onToggleOption={s.toggleOption}
      onNext={s.goNext}
    />
  );
}

export function BrowseRoute() {
  const navigate = useNavigate();
  return (
    <BrowseScreen
      onStart={() => navigate("../quiz")}
      onSelect={(id) => navigate(`../c/${id}`, { state: { from: "browse" } })}
    />
  );
}

export function ResultsRoute() {
  const s = useEventSession();
  const navigate = useNavigate();
  // A cold /results with no answers has nothing to rank — send them to welcome.
  // (Shareable, answer-carrying result URLs arrive in Phase 5 via ?a=.)
  if (Object.keys(s.answers).length === 0) return <Navigate to=".." replace />;
  const shareUrl =
    window.location.origin +
    `/e/${s.event.meta.id}/results?a=${encodeAnswers(s.answers)}`;
  return (
    <ResultsScreen
      ranked={s.displayed}
      topMatchId={s.ranked[0]?.candidateId}
      shareUrl={shareUrl}
      viewMode={s.viewMode}
      onViewMode={s.changeViewMode}
      openInfo={s.openInfo}
      onToggleInfo={s.toggleInfo}
      onSelect={(id) => navigate(`../c/${id}`, { state: { from: "results" } })}
      onRestart={s.restart}
    />
  );
}

export function ReviewRoute() {
  // Unlisted data-quality view. Reads the loaded event's evidence sidecar only;
  // no voter session, so it takes nothing from the outlet context.
  return <ReviewScreen />;
}

export function CandidateRoute() {
  const s = useEventSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const { candidatesById } = useEvent();
  const { candidateId = "" } = useParams();

  const candidate = candidatesById[candidateId];
  if (!candidate) return <Navigate to=".." replace />;

  // "browse" origin (or a cold deep-link with no state) shows the candidate's own
  // positions without a match figure; only a result-list click compares against
  // the voter.
  const from = (location.state as { from?: string } | null)?.from ?? "browse";
  const browsing = from !== "results";
  const score = s.ranked.find((c) => c.candidateId === candidateId)?.score ?? 0;

  return (
    <CandidateScreen
      candidateId={candidateId}
      score={score}
      breakdown={buildBreakdown(candidate, s.voter, s.event.parameters, t, s.event.evidence[candidateId])}
      browsing={browsing}
      onBack={() => navigate(-1)}
    />
  );
}
