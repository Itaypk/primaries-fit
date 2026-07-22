/**
 * Build-time data validator — the CI guardrail for the structural dataset.
 *
 * Runs OUTSIDE the app (Node, via `tsx`); it never imports React or the engine.
 * Two layers:
 *   1. STRUCTURE — zod schemas mirroring src/engine/types.ts catch shape errors
 *      (wrong types, missing required fields, bad enums).
 *   2. REFERENTIAL — cross-file checks zod can't express: ids resolve, positions
 *      are in range, `set` values are declared options, the evidence sidecar
 *      agrees with the projected candidate positions, and every data id has its
 *      string in EVERY locale catalog.
 *
 * Exits non-zero with a grouped, readable error list on any failure; prints a
 * one-line summary on success. File loading is deliberately isolated in one
 * place (`load`) so the multi-event relocation (docs/multi-event.md, Phase 1)
 * only repoints paths — the rules stay put.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { z } from "zod";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

/** Read + JSON-parse a repo-relative file. The only place that touches disk. */
function load(rel: string): unknown {
  return JSON.parse(readFileSync(resolve(root, rel), "utf8"));
}

// ---------------------------------------------------------------------------
// Error collection
// ---------------------------------------------------------------------------

const errors: string[] = [];
const fail = (msg: string) => errors.push(msg);

// ---------------------------------------------------------------------------
// Structural schemas (mirror src/engine/types.ts)
// ---------------------------------------------------------------------------

const parameterKind = z.enum(["scalar", "valence", "set"]);

const parameterSchema = z
  .object({
    id: z.string().min(1),
    kind: parameterKind,
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

// ---------------------------------------------------------------------------
// Load + structural parse
// ---------------------------------------------------------------------------

/** Strip the `$comment` documentation key some data files carry. */
function stripComment(obj: Record<string, unknown>): Record<string, unknown> {
  const rest: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (k !== "$comment") rest[k] = v;
  return rest;
}

const parametersRaw = load("src/data/parameters.json") as Record<string, unknown>;
const candidatesRaw = load("src/data/candidates.json") as Record<string, unknown>;
const questionnaireRaw = load("src/data/questionnaire.json") as Record<string, unknown>;
const evidenceRaw = load("src/data/evidence.json") as Record<string, unknown>;
const locales: Record<string, Record<string, unknown>> = {
  he: load("src/locales/he.json") as Record<string, unknown>,
  en: load("src/locales/en.json") as Record<string, unknown>,
};

/** Parse with a schema, recording a structural error and returning null on failure. */
function parse<T>(schema: z.ZodType<T>, value: unknown, where: string): T | null {
  const r = schema.safeParse(value);
  if (r.success) return r.data;
  for (const issue of r.error.issues) {
    fail(`[structure] ${where}${issue.path.length ? " ." + issue.path.join(".") : ""}: ${issue.message}`);
  }
  return null;
}

const parameters =
  parse(z.array(parameterSchema), parametersRaw.parameters, "parameters.json:parameters") ?? [];
const candidates =
  parse(z.array(candidateSchema), candidatesRaw.candidates, "candidates.json:candidates") ?? [];
const questionnaire = parse(questionnaireSchema, stripComment(questionnaireRaw), "questionnaire.json");

// evidence.json is candidateId -> parameterId -> entry, plus a $comment.
const evidence: Record<string, Record<string, z.infer<typeof evidenceEntrySchema>>> = {};
for (const [cid, pmap] of Object.entries(stripComment(evidenceRaw))) {
  const parsed = parse(
    z.record(z.string(), evidenceEntrySchema),
    pmap,
    `evidence.json:${cid}`,
  );
  if (parsed) evidence[cid] = parsed;
}

// ---------------------------------------------------------------------------
// Referential checks
// ---------------------------------------------------------------------------

const paramById = new Map(parameters.map((p) => [p.id, p]));
const candidateIds = new Set(candidates.map((c) => c.id));
const optionsOf = (pid: string) => new Set(paramById.get(pid)?.options ?? []);

/** Compare two `set` values as unordered id sets. */
function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sb = new Set(b);
  return a.every((x) => sb.has(x));
}

// --- (1) positions in range, (2) ids defined, (3) set membership ---
for (const c of candidates) {
  for (const [pid, val] of Object.entries(c.positions)) {
    const p = paramById.get(pid);
    if (!p) {
      fail(`[ids] candidate '${c.id}': position references undefined parameter '${pid}'`);
      continue;
    }
    if (p.kind === "set") {
      if (!Array.isArray(val)) {
        fail(`[kind] candidate '${c.id}'.${pid}: set parameter expects an array of option ids`);
        continue;
      }
      for (const o of val) {
        if (!optionsOf(pid).has(o))
          fail(`[set] candidate '${c.id}'.${pid}: option '${o}' is not declared in parameter.options`);
      }
    } else {
      if (typeof val !== "number") {
        fail(`[kind] candidate '${c.id}'.${pid}: ${p.kind} parameter expects a number`);
        continue;
      }
      if (val < 0 || val > 1)
        fail(`[range] candidate '${c.id}'.${pid}: position ${val} is outside [0,1]`);
    }
  }
}

// --- (2) ids defined: questionnaire references ---
if (questionnaire) {
  for (const q of questionnaire.questions) {
    for (const t of q.targets ?? [])
      if (!paramById.has(t.parameter))
        fail(`[ids] question '${q.id}': target references undefined parameter '${t.parameter}'`);
    if (q.parameter && !paramById.has(q.parameter))
      fail(`[ids] question '${q.id}': references undefined parameter '${q.parameter}'`);
    for (const pid of q.importanceFor ?? [])
      if (!paramById.has(pid))
        fail(`[ids] question '${q.id}': importanceFor references undefined parameter '${pid}'`);
  }
}

// --- (4) evidence <-> projected position agreement ---
let evidencePairs = 0;
for (const [cid, pmap] of Object.entries(evidence)) {
  if (!candidateIds.has(cid)) {
    fail(`[ids] evidence references undefined candidate '${cid}'`);
    continue;
  }
  const positions = candidates.find((c) => c.id === cid)!.positions;
  for (const [pid, entry] of Object.entries(pmap)) {
    const p = paramById.get(pid);
    if (!p) {
      fail(`[ids] evidence '${cid}'.${pid}: references undefined parameter '${pid}'`);
      continue;
    }
    if (p.kind === "set")
      for (const o of Array.isArray(entry.value) ? entry.value : [])
        if (!optionsOf(pid).has(o))
          fail(`[set] evidence '${cid}'.${pid}: option '${o}' is not declared in parameter.options`);

    const pos = positions[pid];
    if (pos === undefined) continue; // no projected position to compare against
    evidencePairs++;
    if (p.kind === "set") {
      const ev = Array.isArray(entry.value) ? entry.value : null;
      if (!ev || !Array.isArray(pos) || !sameSet(ev, pos))
        fail(`[evidence] '${cid}'.${pid}: evidence value disagrees with projected position`);
    } else {
      if (typeof entry.value !== "number" || typeof pos !== "number" || Math.abs(entry.value - pos) > 1e-9)
        fail(`[evidence] '${cid}'.${pid}: evidence value ${JSON.stringify(entry.value)} != position ${JSON.stringify(pos)}`);
    }
  }
}

// --- (5) locale completeness (every id in EVERY catalog) ---
type Catalog = {
  param?: Record<string, { label?: string; poleLow?: string; poleHigh?: string }>;
  option?: Record<string, string>;
  question?: Record<string, { title?: string; statement?: string }>;
  candidate?: Record<string, { name?: string }>;
};
/** Questions carrying voter-facing text; importance ratings do too (title/statement). */
const questionsNeedingText = new Set((questionnaire?.questions ?? []).map((q) => q.id));

for (const [lang, rawCat] of Object.entries(locales)) {
  const cat = rawCat as Catalog;
  for (const p of parameters) {
    if (!cat.param?.[p.id]?.label)
      fail(`[locale:${lang}] missing param.${p.id}.label`);
    if (p.kind === "scalar") {
      if (!cat.param?.[p.id]?.poleLow) fail(`[locale:${lang}] missing param.${p.id}.poleLow`);
      if (!cat.param?.[p.id]?.poleHigh) fail(`[locale:${lang}] missing param.${p.id}.poleHigh`);
    }
    if (p.kind === "set")
      for (const o of p.options ?? [])
        if (!cat.option?.[o]) fail(`[locale:${lang}] missing option.${o}`);
  }
  for (const c of candidates)
    if (!cat.candidate?.[c.id]?.name) fail(`[locale:${lang}] missing candidate.${c.id}.name`);
  for (const qid of questionsNeedingText)
    if (!cat.question?.[qid]) fail(`[locale:${lang}] missing question.${qid}`);
}

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
  `✓ data valid — ${parameters.length} parameters, ${candidates.length} candidates, ` +
    `${evidencePairs} evidence/position pairs, ${Object.keys(locales).length} locales.`,
);
