/**
 * The loaded event, in React context. The app loads one `Event` up front and
 * shares it (plus its id-indexes) with every screen through this provider, so
 * components read the current primary's data by convention — `useEvent()` —
 * instead of importing ambient singletons. This is what lets a second primary
 * exist without any component "knowing" which one it's rendering.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Candidate, Event, EvidenceEntry, Parameter } from "../engine/types";
import { indexCandidates, indexParameters } from ".";

export interface EventContextValue {
  event: Event;
  parametersById: Record<string, Parameter>;
  candidatesById: Record<string, Candidate>;
  evidenceFor(candidateId: string, parameterId: string): EvidenceEntry | undefined;
}

const EventContext = createContext<EventContextValue | null>(null);

export function EventProvider({
  event,
  children,
}: {
  event: Event;
  children: ReactNode;
}) {
  const value = useMemo<EventContextValue>(
    () => ({
      event,
      parametersById: indexParameters(event),
      candidatesById: indexCandidates(event),
      evidenceFor: (candidateId, parameterId) =>
        event.evidence[candidateId]?.[parameterId],
    }),
    [event],
  );
  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

/** The current loaded event and its id-indexes. Throws outside an EventProvider. */
// eslint-disable-next-line react-refresh/only-export-components
export function useEvent(): EventContextValue {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvent must be used within an EventProvider");
  return ctx;
}
