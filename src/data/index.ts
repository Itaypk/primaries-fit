/** Loads the structural dataset (bundled JSON) and exposes it typed. */
import type {
  Candidate,
  Parameter,
  Questionnaire,
} from "../engine/types";
import parametersJson from "./parameters.json";
import candidatesJson from "./candidates.json";
import questionnaireJson from "./questionnaire.json";

export const parameters = (parametersJson.parameters as Parameter[]);
export const candidates = (candidatesJson.candidates as Candidate[]);
export const questionnaire = questionnaireJson as Questionnaire;

/** Index parameters by id for O(1) lookup in the UI and engine glue. */
export const parametersById: Record<string, Parameter> = Object.fromEntries(
  parameters.map((p) => [p.id, p]),
);

/** Index candidates by id. */
export const candidatesById: Record<string, Candidate> = Object.fromEntries(
  candidates.map((c) => [c.id, c]),
);
