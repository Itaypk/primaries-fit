import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import type { Answer, Answers, CandidateScore, Event, VoterVector } from "../engine/types";
import { buildVoterVector } from "../engine/voter";
import { rankCandidates } from "../engine/score";
import { applyPostRanking, balanceByGender, shuffleAboveThreshold } from "../engine/postRank";
import { loadEvent } from "../data";
import { EventProvider } from "../data/eventContext";
import { DEFAULT_ACCENT } from "../theme";
import { useI18n } from "../i18n";
import { useMeta } from "../meta";
import { decodeAnswers } from "../share";
import { isAnswered } from "../view/question";
import { AppFrame } from "../components/AppFrame";
import { Header } from "../components/Header";
import { ProgressBar } from "../components/ProgressBar";
import { clearProgress, loadProgress, saveProgress } from "../persistence";

/** How the ranked list is presented. Post-ranking only — none of these change
 *  a single score; see engine/postRank.ts. */
export type ViewMode = "match" | "balanced" | "close";

/** How far below the best match still counts as "close enough" to shuffle. */
const CLOSE_ENOUGH_MARGIN = 0.05;

/** Small seeded PRNG (mulberry32) so a given seed always yields the same order —
 *  the list can't quietly reshuffle itself under the voter on a re-render. */
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

/**
 * The per-event session shared with every sub-route through the router Outlet
 * context. It holds the voter's answers and the derived ranking for one event;
 * navigation between screens is the URL's job, not this object's.
 */
export interface EventSession {
  event: Event;
  answers: Answers;
  qIndex: number;
  total: number;
  answered: boolean;
  setAnswer: (value: Answer) => void;
  toggleOption: (optionId: string) => void;
  goNext: () => void;
  voter: VoterVector;
  ranked: CandidateScore[];
  displayed: CandidateScore[];
  viewMode: ViewMode;
  changeViewMode: (mode: ViewMode) => void;
  openInfo: string | null;
  toggleInfo: (id: string) => void;
  restart: () => void;
}

/** Typed accessor for the Outlet context — every event sub-route reads this. */
// eslint-disable-next-line react-refresh/only-export-components
export function useEventSession(): EventSession {
  return useOutletContext<EventSession>();
}

/**
 * Loads the event named in the URL, then hands off to `EventShell`. Data and
 * its locale fragments are lazy-fetched; while that resolves we show the
 * momentary empty frame. An unknown event id bounces back to the chooser.
 */
export function EventLayout() {
  const { eventId = "" } = useParams();
  const { setEventCatalogs } = useI18n();
  const [event, setEvent] = useState<Event | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    setEvent(null);
    setNotFound(false);
    loadEvent(eventId)
      .then((e) => alive && setEvent(e))
      .catch(() => alive && setNotFound(true));
    return () => {
      alive = false;
    };
  }, [eventId]);

  // Layer this event's copy over the shared catalog; clear it on leave so the
  // chooser (and any other event) resolves against the right strings.
  useEffect(() => {
    if (event) setEventCatalogs(event.locales as never);
    return () => setEventCatalogs(null);
  }, [event, setEventCatalogs]);

  if (notFound) return <Navigate to="/" replace />;
  if (!event) return <AppFrame accent={DEFAULT_ACCENT}>{null}</AppFrame>;
  return <EventShell event={event} />;
}

/**
 * The event's flow shell: session state, persistence, chrome, and the routed
 * `<Outlet/>`. Mounted only after the event has loaded, so its "read once before
 * first paint" persistence init still holds. Lifted from the old single-event
 * App state machine — the screen transitions are now URL navigations.
 */
function EventShell({ event }: { event: Event }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, locale } = useI18n();
  const eventBase = `/e/${event.meta.id}`;
  const { parameters, candidates, questionnaire } = event;

  // A shared results link (`?a=…`) previews the right primary and lands on the
  // ranking it encodes, so reflect the event into the document metadata.
  useMeta({
    title: `${t.party(event.meta.party)} · ${t.app.name}`,
    description: t.ui.welcome.sub,
    url: eventBase,
    locale,
  });

  // Answers come from the shared link if present, else this event's saved
  // progress. A `?a=` link is only in the URL on a cold load of a shared
  // results page; the normal in-app flow navigates without it, so this seeds
  // exactly the shared-link case. Read once at mount — later navigation within
  // the event must not re-seed under the voter.
  const [shared] = useState(() => decodeAnswers(new URLSearchParams(location.search).get("a")));
  const [restored] = useState(() => loadProgress(event.meta.id, questionnaire.version));
  const [answers, setAnswers] = useState<Answers>(shared ?? restored?.answers ?? {});
  const [qIndex, setQIndex] = useState(
    shared ? questionnaire.questions.length - 1 : restored?.qIndex ?? 0,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("match");
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [openInfo, setOpenInfo] = useState<string | null>(null);

  const total = questionnaire.questions.length;
  const question = questionnaire.questions[qIndex];
  const answered = isAnswered(question, answers[question.id]);

  useEffect(() => {
    saveProgress(event.meta.id, { version: questionnaire.version, answers, qIndex });
  }, [event.meta.id, questionnaire.version, answers, qIndex]);

  const voter = useMemo(
    () => buildVoterVector(answers, questionnaire, parameters),
    [answers, questionnaire, parameters],
  );
  const ranked = useMemo(
    () => rankCandidates(candidates, voter, parameters),
    [voter, candidates, parameters],
  );
  const displayed = useMemo(() => {
    if (viewMode === "match") return ranked;
    const step =
      viewMode === "balanced"
        ? balanceByGender()
        : shuffleAboveThreshold((ranked[0]?.score ?? 0) - CLOSE_ENOUGH_MARGIN, seededRng(shuffleSeed));
    return applyPostRanking(ranked, candidates, [step]);
  }, [ranked, candidates, viewMode, shuffleSeed]);

  const session: EventSession = {
    event,
    answers,
    qIndex,
    total,
    answered,
    setAnswer: (value) => setAnswers((prev) => ({ ...prev, [question.id]: value })),
    toggleOption: (optionId) =>
      setAnswers((prev) => {
        const cur = Array.isArray(prev[question.id]) ? (prev[question.id] as string[]) : [];
        const next = cur.includes(optionId) ? cur.filter((k) => k !== optionId) : [...cur, optionId];
        return { ...prev, [question.id]: next };
      }),
    goNext: () => {
      if (qIndex < total - 1) setQIndex(qIndex + 1);
      else {
        setOpenInfo(null);
        navigate(`${eventBase}/results`);
      }
    },
    voter,
    ranked,
    displayed,
    viewMode,
    changeViewMode: (mode) => {
      setViewMode(mode);
      if (mode === "close") setShuffleSeed((s) => s + 1); // re-picking re-rolls the order
    },
    openInfo,
    toggleInfo: (id) => setOpenInfo((cur) => (cur === id ? null : id)),
    restart: () => {
      clearProgress(event.meta.id);
      setAnswers({});
      setQIndex(0);
      setOpenInfo(null);
      navigate(eventBase);
    },
  };

  // Chrome. The quiz is the only screen with a progress bar; the back affordance
  // shows on the inner screens (quiz/browse/candidate/review), not welcome/results.
  const onQuiz = location.pathname === `${eventBase}/quiz`;
  const onBrowse = location.pathname === `${eventBase}/browse`;
  const onCandidate = location.pathname.startsWith(`${eventBase}/c/`);
  const onReview = location.pathname === `${eventBase}/review`;
  const filled = qIndex + (answered ? 1 : 0);

  function onBack() {
    if (onQuiz) {
      if (qIndex > 0) setQIndex(qIndex - 1);
      else navigate(eventBase);
    } else {
      navigate(-1);
    }
  }

  return (
    <EventProvider event={event}>
      <AppFrame accent={DEFAULT_ACCENT}>
        <Header showBack={onQuiz || onBrowse || onCandidate || onReview} onBack={onBack} />
        {onQuiz && <ProgressBar step={qIndex + 1} total={total} pct={Math.round((filled / total) * 100)} />}
        <Outlet context={session} />
      </AppFrame>
    </EventProvider>
  );
}
