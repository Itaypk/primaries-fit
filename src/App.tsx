/**
 * Route table. `/` is the event chooser; each primary lives under `/e/:eventId`
 * with a real URL per screen, so past-primary deep-links and shareable results
 * are possible (docs/multi-event.md, Phase 2). The event flow's state lives in
 * EventLayout; the screens are reached as nested routes.
 */
import { Navigate, Route, Routes } from "react-router-dom";
import { EventChooser } from "./screens/EventChooser";
import { EventLayout } from "./screens/EventLayout";
import { AboutScreen } from "./screens/AboutScreen";
import { FaqScreen } from "./screens/FaqScreen";
import {
  BrowseRoute,
  CandidateRoute,
  QuizRoute,
  ResultsRoute,
  ReviewRoute,
  WelcomeRoute,
} from "./screens/eventRoutes";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EventChooser />} />
      {/* Static editorial pages (docs/multi-event.md, Phase 5). */}
      <Route path="/about" element={<AboutScreen />} />
      <Route path="/faq" element={<FaqScreen />} />
      <Route path="/e/:eventId" element={<EventLayout />}>
        <Route index element={<WelcomeRoute />} />
        <Route path="quiz" element={<QuizRoute />} />
        <Route path="results" element={<ResultsRoute />} />
        <Route path="browse" element={<BrowseRoute />} />
        <Route path="c/:candidateId" element={<CandidateRoute />} />
        {/* Unlisted reviewer view (docs/multi-event.md, Phase 4). */}
        <Route path="review" element={<ReviewRoute />} />
      </Route>
      {/* Unknown paths fall back to the chooser. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
