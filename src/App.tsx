/**
 * Route table. `/` is the event chooser; each primary lives under `/e/:eventId`
 * with a real URL per screen, so past-primary deep-links and shareable results
 * are possible (docs/multi-event.md, Phase 2). The event flow's state lives in
 * EventLayout; the screens are reached as nested routes.
 */
import { Navigate, Route, Routes } from "react-router-dom";
import { EventChooser } from "./screens/EventChooser";
import { EventLayout } from "./screens/EventLayout";
import {
  BrowseRoute,
  CandidateRoute,
  QuizRoute,
  ResultsRoute,
  WelcomeRoute,
} from "./screens/eventRoutes";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EventChooser />} />
      <Route path="/e/:eventId" element={<EventLayout />}>
        <Route index element={<WelcomeRoute />} />
        <Route path="quiz" element={<QuizRoute />} />
        <Route path="results" element={<ResultsRoute />} />
        <Route path="browse" element={<BrowseRoute />} />
        <Route path="c/:candidateId" element={<CandidateRoute />} />
      </Route>
      {/* Unknown paths fall back to the chooser. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
