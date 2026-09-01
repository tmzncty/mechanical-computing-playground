# Current Status

Last reconciled on 2026-09-02 after binding decimal-register replay to its recorded action and complete trace, following the Analytical Engine fixture-provenance and Type II Curta sheet pass.

This file is the **current-state authority** for the repository. `ROADMAP.md` describes where the project should go; `IMPLEMENTATION_PLAN.md` is still useful as a dependency/design specification, but many of its checkboxes predate later implementation and must not be treated as the live task ledger.

## What already exists

### Build / verification foundation

- TypeScript + Vite + Vitest browser project.
- Strict type-check / test / production build scripts.
- GitHub Actions CI and a Pages deployment workflow.
- Deterministic state/event/replay primitives under `src/core/`.
- Golden carry fixtures under `fixtures/carry/`.
- The latest local code verification (`docs/VERIFICATION.md`, 2026-09-02 UTC+8) reports typecheck, 333 tests across 21 files, production build, and diff check passing. The most recent bilingual browser smoke was the preceding source-atlas pass; this trace-only slice does not change UI output.

Remote CI run `33437862103` passed for the previous operator-division checkpoint `7bebcea2d187f0ed2411de4098c846963df8b32a`. This status still does **not** substitute for CI on later commits.

### Mechanism models already present

- decimal wheel/register replay with runtime fail-closed rejection of unknown serialized event discriminators plus action-derived validation of the envelope, complete ordered crank/carry event sequence, warnings/errors, endpoints, and exact enumerable trace/state/action shape;
- carry chain;
- carriage shift;
- hardened difference-column / finite-difference stepping with state validation, derived arithmetic checks, fail-closed event replay, and row/output consistency;
- deterministic Difference Engine tabular-output teaching flow separating calculated values, persistent check-copy, and master/stereotype output roles;
- revolution counter;
- stepped-drum conceptual model;
- pinwheel conceptual model;
- direction-neutral ordinal rotary-carry scheduler with boundary/conditioning/strictly increasing transfer-slot/carry-out events and fail-closed replay;
- direct-multiplication functional model with an inspectable encoded-multiple table, digit selection, operation cycles, carriage shifts, and fail-closed action-derived replay;
- generic key-driven accumulator with place-value contribution, serialized carry, key-stroke cycles, validated state, and fail-closed action-derived replay that rejects carry/event/final-state tampering;
- generic key-stroke-integrity controller wrapping that accumulator, with incomplete release/detection/input lock, exactly-once errant-stroke commit, lock release, deterministic trace and action-derived replay;
- generic operator-driven division with quotient-nine and exact-zero boundary handling, explicit pending/detected/correction phases, per-place quotient counts, mandatory add-back, zero-place shifts, action-derived cycle-bound replay, and undersized-register rejection;
- generic setting–crank interlock with explicit lock/phase transitions, invalid-action rejection, and hardened replay;
- generic dual-register lifecycle with independent result/revolution clears, explicit mode selection, recorded already-zero clears, preserved-register evidence fields, and action-derived fail-closed replay;
- typed control-provenance profiles preserving source/model, H/R claim type, E1–E4 strength, documented roles, and explicit not-established boundaries;
- typed carry-provenance profiles separating Pascal/Felt, Odhner/Talamini, and Thomas 1820 patent/object, 1865, 1880 proposal, and R/E3 revision-history contexts;
- typed mechanical-error-control profiles separating Thomas inertia/load, Odhner/Talamini carry scheduling, and Bush frontlash/backlash-transmission responsibilities without pseudo-quantitative reliability fields;
- typed P/M operator-work profiles derived from existing multiplication, key-driven, division, and printing-ledger traces, with categorical counts and no scalar efficiency/productivity score;
- typed four-track named-machine source anchors separating Babbage archive records from the directly inspected 2020 DE2 R/E2 technical reconstruction, Smithsonian component records from the directly inspected Bush–Caldwell 1931 application paper, Curta patent/operator/service documents, 1843 Analytical Engine printed pages, specialist transcription boundaries, and later reconstruction choices;
- generic deterministic printing ledger separating working accumulator state from structured persistent ITEM/SUBTOTAL/TOTAL lines, including subtotal retention, total clearing, replay, and tamper rejection;
- typed output-contract profiles separating identified register-only/printing objects, primary total/subtotal patent semantics, and Difference Engine persistent-output roles;
- generic continuous integrator with independent/input/integrated quantities, P/M inspection interval, ordered observation/advance events, safe numeric validation, and action-derived replay binding actions, cycle ownership, ordered events and final state;
- continuous-flow teaching chain with explicit adder relation and tracer-output boundary;
- shared mechanism core and trace/replay support.

These are not all historical geometric reconstructions. Several intentionally model functional behavior only.

### Exhibits / public UI already present

The current browser shell contains non-empty routes or views for:

- visible carry with the existing interactive P/M chain, Pascaline/Felt profiles, one ordinal P/M schedule, and source-separated rotary versus Thomas stepped-drum carry/reliability sections;
- interactive finite differences plus a separately stepped calculation→persistent-output responsibility flow;
- interactive multiplication comparison with event/cycle stepping for direct multiplication;
- interactive operator-division procedure for `8478 ÷ 314` exposing the negative residual in `OVERSHOOT_PENDING` before detection makes add-back correction legal;
- interactive controls area with setting–crank interlock, incomplete-key-stroke integrity, and independently stepped result/revolution-register lifecycle scenarios, each preserving source/P/M boundaries;
- interactive output-contract lesson exposing `+12, +8, SUBTOTAL, +5, TOTAL`, persistent record versus accumulator state, and source-separated register/listing/Difference Engine comparisons;
- Curta;
- interactive Analytical Engine P/M information flow for `(ab+c)d`, with Store/Mill/card roles, intermediate `p/q`, output, stepping, and fixture-derived hardened replay that rejects alternate-fixture substitution and adversarial trace shape changes;
- interactive continuous mechanical integration workbench with A/B inputs, explicit sum, coordinate/integral phases, tracer output, stepping, reset, and a link to the documented frontlash responsibility;
- bilingual mechanical-error-control comparison preserving distinct Thomas, Odhner/Talamini, and Bush source/problem/control boundaries;
- bilingual arithmetic-work comparison showing what operators choose/repeat/shift/correct/request versus what mechanisms represent/execute/retain across four existing scenarios;
- bilingual four-track source atlas exposing what each Difference Engine No. 2, Bush Differential Analyzer, Curta or Analytical Engine source supports and does not establish, including access-host and inspected-page metadata;
- hand-crank backpropagation;
- about / evidence explanation.

Some of these are substantially more complete as pedagogical software than as historical research exhibits.

### Backpropagation track already present

- Stage A linear model;
- Stage B 2→2→1 chain-rule model;
- analytic gradient tests;
- learning-rate stability / overshoot behavior;
- explicit phase machine;
- mechanical mapping layer;
- reverse-phase event exposure.

This remains a **counterfactual pedagogical machine**, not a historical reconstruction.

## Research/evidence work completed in the 2026-09-01 reconciliation

- `docs/EVIDENCE_POLICY.md` now separates claim type (`M/H/R/P`) from historical evidence strength (`E1–E4`).
- `docs/RESEARCH_GAPS.md` provides a prioritized mechanism/research queue.
- `research/carry-is-the-hard-part.md` now uses Pascaline sautoir and Comptometer/key-driven carry as concrete comparison cases.
- `research/multiplication-mechanisms.md` now covers repeated addition, stepped drum, pinwheel, and Otto Steiger / Millionaire direct multiplication.
- `research/key-driven-computation.md` opens the Comptometer-style `keypress → accumulate` track.
- `research/finite-difference-design.md` now separates mathematical facts from Babbage-specific historical claims.
- `docs/PRIOR_ART.md`, `docs/STRUCTURE_EVIDENCE.md`, README, ROADMAP, TODO, and AGENTS have been reconciled with the current implementation and evidence policy.

## Where the repository is currently weak

The main weakness is no longer “there is no code.” It is that **historical/mechanism provenance is still thinner than the implementation**.

The most important remaining gaps are:

- carry maps now add Thomas 1820 patent/object separation, 1865 rapid overrun/sequential phasing/simultaneous-load false-result evidence, and the 1880 proposal versus R/E3 adoption boundary; exact Thomas and rotary production mapping, factory instructions/direct measurement, force/contact-load/material/lubrication/tolerance/wear/safe-rate/failure envelopes, and source-specific geometry remain open;
- direct multiplication now has a tested pedagogical functional state/event model and a fourth comparison path, but no source-specific Millionaire geometry is claimed;
- key-driven computation now has tested accumulator and incomplete-stroke integrity/interlock P/M models; simultaneous multi-column operation, exact Model E/F trigger/release geometry/timing, primary patent mapping, and universal production claims remain intentionally unmodeled;
- `research/curta-source-map.md` now directly inspects US 2,525,352, the Contina operator guide, Model I/II service material, plus Type II manufacturer BOM/drawing first sheets: internal CONTINA/Type II identity, BOM sheet date 3.9.52, drawing date 19.9.51 and visible 1.4.53 change entry; these sheet dates do not establish a frozen service issue, production chronology, capacity, hidden geometry or interchangeability;
- `research/analytical-engine-information-flow.md` directly anchors 1843 printed pp. 677, 679 and 704 and now separates the 1888 Bath reading, Cambridge-confirmed 1889 compilation chapter 32 / pp. 331–338 range, and Fourmilab items 10–20 transcription; because the relevant page images remain inaccessible, card-role/`(ab+c)d` content stays E3 and no modern BAB-code cross-walk is claimed;
- `research/subtraction-and-division.md` now separates the directly inspected Curta operator-guide viewer-page-1 controls (H/E1 via specialist mirror) from the E3 division transcription; exact Curta division-example edition/pages and the Thomas 1868 instruction facsimile remain open;
- `research/differential-analyzer.md` now directly inspects the Smithsonian object group/components and Bush–Caldwell 1931 application facsimile pp. 1898–1902/Figs. 1–3; bounded 2026-09-02 retries reconfirm Bush 1931 and Shannon 1941 identities but both full texts remain inaccessible, so the atlas encodes separate bibliographic-only construction/theory roles with no false pages, equations, geometry, torque/error or P/M timing claims;
- `research/difference-engine-source-map.md` now separates the Smithsonian built Scheutz object/drawing records, a contemporary Society of Arts p.393 patent-list entry independently identifying No.2216, the Royal Society 1855 examination at pp.499–509, Merzbach H/E2 synthesis/reproduced patent, Babbage designs, DE2 reconstruction, and repository P/M; the catalog's 2214 wording remains visible while its cause, exact geometry/timing/performance, and the unexposed letter remain open;
- `research/simulator-matrix.md` now records a bounded prior-art/reuse matrix, but several third-party license, stepping, and maintenance fields remain explicitly unverified;
- `research/key-driven-computation.md` directly anchors Turck 1921 printed pp. 159–162 for incomplete-stroke signaling, other-order blocking and correction-before-continuation, while keeping the Smithsonian 1920-revision book at one-image catalog precision and Science Museum `1921-16` at Model F object identity; exact release procedure/patent/geometry remains open;
- `research/control-and-zeroing-source-map.md` directly inspects the single exposed 1868 Thomas pamphlet spread for C/D register roles and independent O/P zeroing controls, keeps 1867 `MA.327900` and ca.1873 `MA.335215` object capacities/descriptions separate, and uses Oxford's 1865-booklet account at R/E2; exact linkage/timing and production-revision mapping remain open;
- `research/output-and-audit-trail.md` and `#/output-contracts` now compare register-only output, identified printing/listing objects, US885202A subtotal/total semantics, and Difference Engine persistent-output roles; direct museum-page access, printer geometry, period office procedure, commercial context, and source-specific production mapping remain open;
- `research/human-machine-arithmetic-labor.md`, typed adapters, and `#/arithmetic-labor` now synthesize operator versus machine responsibility from existing tested traces; historical productivity/time/effort and source-specific workflows remain explicitly open;
- `docs/REPRESENTATION_AND_PROTOCOL.md` compares representation, operator protocol, and persistent-output/error-control responsibilities; reliability/torque/tolerance and source-specific geometry remain future work.

See `docs/RESEARCH_GAPS.md` for the full queue.

## Evidence-policy state

The older A–D labels mixed together:

- direct artifact evidence;
- historical interpretation;
- mathematical facts;
- pedagogical abstractions.

Those are not one scale. New and edited research should follow `docs/EVIDENCE_POLICY.md`:

```text
M = mathematical / computational
H = historical record
R = reconstruction / engineering interpretation
P = pedagogical / counterfactual
```

Historical/reconstruction claims then receive `E1–E4` evidence strength separately. Existing A–D badges may remain temporarily in UI code for compatibility, but should not guide new research writing.

## Current highest-priority work

1. **Deepen carry/control sources only where exact evidence is available**: carry production mapping/force/tolerance data, Thomas instruction pages, partial-stroke correction, and source-specific geometry remain open after the completed family-separated provenance maps.
2. **Deepen Difference Engine and Differential Analyzer facsimile/page/figure anchors** before any source-specific geometry; the generation/source maps now exist.
3. **Deepen remaining cross-machine comparison layers** after the completed output-contract slice: commercial context and eventually reliability/torque/tolerance only when evidence supports them.
4. **Only then deepen source-specific geometry/animation.** Do not reward visual detail unsupported by source detail.

## External publishing state

GitHub Actions `Deploy Pages` run `33443320058` succeeded for `db3b1aa`, and <https://tmzncty.github.io/mechanical-computing-playground/> was directly reachable on 2026-09-01. Each newer commit still requires its own completed deployment before its routes are claimed live.

## Definition of the next good release

A useful next release is not “more routes.” It should connect three research findings to tested mechanism models:

- historically grounded carry comparison;
- multiplication comparison including direct multiplication;
- key-driven / human-operation comparison.

Each should connect:

```text
source evidence
→ claimed mechanism relationship
→ deterministic state model
→ visible operation trace
→ explicit simplification boundary
```

That is the point where the playground becomes more than a collection of clever simulations.
