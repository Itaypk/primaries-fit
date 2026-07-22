/**
 * Build-time data validator — the CI guardrail for the structural dataset.
 *
 * Runs OUTSIDE the app (Node, via `tsx`); it never imports React or the engine.
 * It walks the event registry (src/data/events/index.json) and validates every
 * primary's folder in two layers:
 *   1. STRUCTURE — zod schemas mirroring src/engine/types.ts catch shape errors
 *      (wrong types, missing required fields, bad enums).
 *   2. REFERENTIAL — cross-file checks zod can't express: ids resolve, positions
 *      are in range, `set` values are declared options, the evidence sidecar
 *      agrees with the projected candidate positions, meta matches the registry,
 *      and every data id has its string in EVERY locale catalog.
 *
 * Exits non-zero with a grouped, readable error list on any failure; prints a
 * one-line summary on success. Disk access is isolated in `load`, so relocating
 * data later only repoints paths — the rules stay put.
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { z } from "zod";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const EVENTS_DIR = "src/data/events";
const LOCALE_DIR = "src/locales";
const LOCALES = ["he", "en"] as const;

/** Read + JSON-parse a repo-relative file. The only place that touches disk. */
function load(rel: string): unknown {
  return JSON.parse(readFileSync(resolve(root, rel), "utf8"));
}
const fileExists = (rel: string) => existsSync(resolve(root, rel));

// ---------------------------------------------------------------------------
// Error collection
// ---------------------------------------------------------------------------

const errors: string[] = [];
const fail = (msg: string) => errors.push(msg);

// ---------------------------------------------------------------------------
// Structural schemas (mirror src/engine/types.ts)
// ---------------------------------------------------------------------------

const eventStatus = z.enum(["upcoming", "open", "past"]);

const eventSummarySchema = z
  .object({
    id: z.string().min(1),
    party: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected ISO YYYY-MM-DD"),
    status: eventStatus,
  })
  .strict();

const eventMetaSchema = eventSummarySchema.extend({
  dataUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected ISO YYYY-MM-DD"),
  methodology: z.string().optional(),
});

const parameterSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum(["scalar", "valence", "set"]),
    options: z.array(z.string().min(1)).optional(),
  })
  .strict();

const positionValue = z.union([z.number(), z.array(z.string())]);

const candidateSchema = z
  .object({
    id: z.string().min(1),
    positions: z.record(z.string(), positionValue),
    // display is presentation-only; validate loosely (never scored).
    display: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

const positionTarget = z
  .object({ parameter: z.string().min(1), weight: z.number().optional() })
  .strict();

const questionSchema = z
  .object({
    id: z.string().min(1),
    widget: z.enum(["slider", "segmented", "boolean", "multiselect", "importance"]),
    targets: z.array(positionTarget).optional(),
    parameter: z.string().min(1).optional(),
    importanceFor: z.array(z.string().min(1)).optional(),
  })
  .strict();

const questionnaireSchema = z
  .object({
    id: z.string().min(1),
    version: z.number().int(),
    questions: z.array(questionSchema),
  })
  .strict();

const evidenceEntrySchema = z
  .object({
    value: positionValue,
    confidence: z.enum(["high", "medium", "low"]),
    rationale: z.string().min(1),
    sources: z.array(z.string()),
  })
  .strict();

const resultsSchema = z
  .object({
    raw: z
      .array(z.object({ candidateId: z.string().min(1), votes: z.number().optional(), rank: z.number() }).strict())
      .optional(),
    final: z
      .array(z.object({ candidateId: z.string().min(1), seat: z.number(), reason: z.string().optional() }).strict())
      .optional(),
  })
  .strict();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip the `$comment` documentation key some data files carry. */
function stripComment(obj: Record<string, unknown>): Record<string, unknown> {
  const rest: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (k !== "$comment") rest[k] = v;
  return rest;
}

/** Parse with a schema, recording a structural error and returning null on failure. */
function parse<T>(schema: z.ZodType<T>, value: unknown, where: string): T | null {
  const r = schema.safeParse(value);
  if (r.success) return r.data;
  for (const issue of r.error.issues)
    fail(`[structure] ${where}${issue.path.length ? " ." + issue.path.join(".") : ""}: ${issue.message}`);
  return null;
}

/** Compare two `set` values as unordered id sets. */
function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sb = new Set(b);
  return a.every((x) => sb.has(x));
}

// Shared catalogs carry generic chrome + party labels; event-specific copy lives
// in each event's locale fragment (checked per-event below). Load shared once.
type SharedCatalog = { party?: Record<string, string> };
type EventFragment = {
  param?: Record<string, { label?: string; poleLow?: string; poleHigh?: string }>;
  option?: Record<string, string>;
  question?: Record<string, { title?: string; statement?: string }>;
  candidate?: Record<string, { name?: string }>;
};
const sharedCatalogs: Record<string, SharedCatalog> = {};
for (const lang of LOCALES) sharedCatalogs[lang] = load(`${LOCALE_DIR}/${lang}.json`) as SharedCatalog;

// ---------------------------------------------------------------------------
// Per-event validation
// ---------------------------------------------------------------------------

function validateEvent(summary: z.infer<typeof eventSummarySchema>): number {
  const id = summary.id;
  const dir = `${EVENTS_DIR}/${id}`;
  const at = (msg: string) => fail(`[${id}] ${msg}`);

  const requiredFiles = [
    "parameters",
    "candidates",
    "questionnaire",
    "evidence",
    "meta",
    ...LOCALES.map((l) => `locales/${l}`),
  ];
  for (const f of requiredFiles) {
    if (!fileExists(`${dir}/${f}.json`)) {
      at(`missing required file ${f}.json`);
      return 0;
    }
  }

  const parametersRaw = load(`${dir}/parameters.json`) as Record<string, unknown>;
  const candidatesRaw = load(`${dir}/candidates.json`) as Record<string, unknown>;
  const meta = parse(eventMetaSchema, stripComment(load(`${dir}/meta.json`) as Record<string, unknown>), `${id}/meta.json`);
  const questionnaire = parse(
    questionnaireSchema,
    stripComment(load(`${dir}/questionnaire.json`) as Record<string, unknown>),
    `${id}/questionnaire.json`,
  );

  const parameters = parse(z.array(parameterSchema), parametersRaw.parameters, `${id}/parameters.json:parameters`) ?? [];
  const candidates = parse(z.array(candidateSchema), candidatesRaw.candidates, `${id}/candidates.json:candidates`) ?? [];

  // evidence.json is candidateId -> parameterId -> entry, plus a $comment.
  const evidence: Record<string, Record<string, z.infer<typeof evidenceEntrySchema>>> = {};
  for (const [cid, pmap] of Object.entries(stripComment(load(`${dir}/evidence.json`) as Record<string, unknown>))) {
    const parsed = parse(z.record(z.string(), evidenceEntrySchema), pmap, `${id}/evidence.json:${cid}`);
    if (parsed) evidence[cid] = parsed;
  }

  // meta must agree with the registry entry and the folder name.
  if (meta) {
    if (meta.id !== id) at(`meta.id '${meta.id}' does not match folder '${id}'`);
    for (const k of ["party", "date", "status"] as const)
      if (meta[k] !== summary[k]) at(`meta.${k} '${meta[k]}' disagrees with registry '${summary[k]}'`);
  }

  const paramById = new Map(parameters.map((p) => [p.id, p]));
  const candidateIds = new Set(candidates.map((c) => c.id));
  const optionsOf = (pid: string) => new Set(paramById.get(pid)?.options ?? []);

  // (1) positions in range, (2) ids defined, (3) set membership
  for (const c of candidates) {
    for (const [pid, val] of Object.entries(c.positions)) {
      const p = paramById.get(pid);
      if (!p) {
        at(`candidate '${c.id}': position references undefined parameter '${pid}'`);
        continue;
      }
      if (p.kind === "set") {
        if (!Array.isArray(val)) {
          at(`candidate '${c.id}'.${pid}: set parameter expects an array of option ids`);
          continue;
        }
        for (const o of val)
          if (!optionsOf(pid).has(o)) at(`candidate '${c.id}'.${pid}: option '${o}' is not declared in parameter.options`);
      } else {
        if (typeof val !== "number") {
          at(`candidate '${c.id}'.${pid}: ${p.kind} parameter expects a number`);
          continue;
        }
        if (val < 0 || val > 1) at(`candidate '${c.id}'.${pid}: position ${val} is outside [0,1]`);
      }
    }
  }

  // (2) ids defined: questionnaire references
  if (questionnaire) {
    for (const q of questionnaire.questions) {
      for (const tgt of q.targets ?? [])
        if (!paramById.has(tgt.parameter)) at(`question '${q.id}': target references undefined parameter '${tgt.parameter}'`);
      if (q.parameter && !paramById.has(q.parameter)) at(`question '${q.id}': references undefined parameter '${q.parameter}'`);
      for (const pid of q.importanceFor ?? [])
        if (!paramById.has(pid)) at(`question '${q.id}': importanceFor references undefined parameter '${pid}'`);
    }
  }

  // (4) evidence <-> projected position agreement
  let evidencePairs = 0;
  for (const [cid, pmap] of Object.entries(evidence)) {
    if (!candidateIds.has(cid)) {
      at(`evidence references undefined candidate '${cid}'`);
      continue;
    }
    const positions = candidates.find((c) => c.id === cid)!.positions;
    for (const [pid, entry] of Object.entries(pmap)) {
      const p = paramById.get(pid);
      if (!p) {
        at(`evidence '${cid}'.${pid}: references undefined parameter '${pid}'`);
        continue;
      }
      if (p.kind === "set")
        for (const o of Array.isArray(entry.value) ? entry.value : [])
          if (!optionsOf(pid).has(o)) at(`evidence '${cid}'.${pid}: option '${o}' is not declared in parameter.options`);

      const pos = positions[pid];
      if (pos === undefined) continue; // no projected position to compare against
      evidencePairs++;
      if (p.kind === "set") {
        const ev = Array.isArray(entry.value) ? entry.value : null;
        if (!ev || !Array.isArray(pos) || !sameSet(ev, pos))
          at(`evidence '${cid}'.${pid}: evidence value disagrees with projected position`);
      } else if (typeof entry.value !== "number" || typeof pos !== "number" || Math.abs(entry.value - pos) > 1e-9) {
        at(`evidence '${cid}'.${pid}: evidence value ${JSON.stringify(entry.value)} != position ${JSON.stringify(pos)}`);
      }
    }
  }

  // (optional) results reference known candidates
  if (fileExists(`${dir}/results.json`)) {
    const results = parse(resultsSchema, stripComment(load(`${dir}/results.json`) as Record<string, unknown>), `${id}/results.json`);
    for (const r of results?.raw ?? [])
      if (!candidateIds.has(r.candidateId)) at(`results.raw references undefined candidate '${r.candidateId}'`);
    for (const r of results?.final ?? [])
      if (!candidateIds.has(r.candidateId)) at(`results.final references undefined candidate '${r.candidateId}'`);
  }

  // (5) locale completeness — event-specific ids in EVERY event fragment, and
  // the party label in EVERY shared catalog.
  const questionIds = (questionnaire?.questions ?? []).map((q) => q.id);
  for (const lang of LOCALES) {
    const frag = stripComment(load(`${dir}/locales/${lang}.json`) as Record<string, unknown>) as EventFragment;
    for (const p of parameters) {
      if (!frag.param?.[p.id]?.label) at(`[locale:${lang}] missing param.${p.id}.label`);
      if (p.kind === "scalar") {
        if (!frag.param?.[p.id]?.poleLow) at(`[locale:${lang}] missing param.${p.id}.poleLow`);
        if (!frag.param?.[p.id]?.poleHigh) at(`[locale:${lang}] missing param.${p.id}.poleHigh`);
      }
      if (p.kind === "set")
        for (const o of p.options ?? []) if (!frag.option?.[o]) at(`[locale:${lang}] missing option.${o}`);
    }
    for (const c of candidates) if (!frag.candidate?.[c.id]?.name) at(`[locale:${lang}] missing candidate.${c.id}.name`);
    for (const qid of questionIds) if (!frag.question?.[qid]) at(`[locale:${lang}] missing question.${qid}`);

    // The chooser renders the party label from the shared catalog.
    if (meta && !sharedCatalogs[lang].party?.[meta.party])
      at(`[locale:${lang}] missing shared party.${meta.party}`);
  }

  return evidencePairs;
}

// ---------------------------------------------------------------------------
// Walk the registry
// ---------------------------------------------------------------------------

const registryRaw = load(`${EVENTS_DIR}/index.json`) as Record<string, unknown>;
const summaries =
  parse(z.array(eventSummarySchema), (stripComment(registryRaw) as { events?: unknown }).events, "events/index.json:events") ?? [];

let totalPairs = 0;
for (const s of summaries) totalPairs += validateEvent(s);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (errors.length) {
  console.error(`\n✗ data validation failed — ${errors.length} problem(s):\n`);
  for (const e of errors.sort()) console.error("  " + e);
  console.error("");
  process.exit(1);
}

console.log(
  `✓ data valid — ${summaries.length} event(s), ${totalPairs} evidence/position pairs, ${LOCALES.length} locales.`,
);
