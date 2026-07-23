import { useI18n } from "../i18n";
import { PastEventNotice } from "../components/PastEventNotice";
import { EventOutcome } from "../components/EventOutcome";
import { PageBody, PageHeading } from "../ui/primitives";

/** Standalone "what actually happened" page for a past race (`/e/:id/outcome`),
 *  reached from the chooser. The actual outcome is its own destination now — it
 *  is no longer folded into the bottom of the begin-questionnaire page. Renders
 *  body-only; the event shell supplies the header/footer chrome. */
export function OutcomeScreen() {
  const { t } = useI18n();
  const o = t.ui.outcome;

  return (
    <PageBody>
      <div className="page-column">
        <PastEventNotice />
        <PageHeading eyebrow={o.eyebrow} title={o.title} />
        <EventOutcome showTitle={false} />
      </div>
    </PageBody>
  );
}
