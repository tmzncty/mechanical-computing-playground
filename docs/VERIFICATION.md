# Verification record

## 2026-09-02 — complement-register structural replay equality

The exact remote-main baseline `e3788aaba731d5594d9caa70a0475b9452f6db15` reproduced two complementary fixture-integrity failures: reordered but otherwise identical object members were rejected, while an unsupported enumerable `undefined` field on `finalState` was discarded by `JSON.stringify` and accepted. Complement replay now validates the final state and uses the shared order-independent exact comparison rather than JSON serialization.

Before reading nested complement data, a mechanism-scoped bounded preflight constructs the v2 replay input as a stable ordinary snapshot: current-realm `Object.prototype` objects, exact `Array.prototype` arrays, own enumerable string-keyed data properties except intrinsic array `length`, and no Symbol/Function leaves, accessors, cycles or repeated identities. Its limits are conservatively derived from width `<= 15` and at most 17 events. Retained post-order clone checks reject top-level, nested, array, self-detaching and mutation-attempting Proxies without invoking their `get` traps or injected accessors. Clone container brands and own-key sets must match the inspected frames, which rejects brand-preserving built-ins whose prototypes were spoofed to `Object.prototype` without rejecting ordinary frozen or sealed data. A host container that `structuredClone` demotes to an ordinary object is never consumed directly: all envelope checks, transitions, comparisons and replay operate on the returned ordinary snapshot. The walk uses module-captured structural intrinsics and pre-bound collection methods, so a structural callback cannot replace ambient validators partway through the check. Failures from the initial structural gate through final comparison are contained as `InvalidComplementRegisterError`; unexpected failures use `invalid complement trace data`. The generic trace path remains alias-compatible for existing decimal events that intentionally share wheel objects.

Regressions cover reordered final-state and event members; fail-closed `undefined`, Symbol, Function, non-enumerable, accessor, cyclic and aliased data; structural budgets; transparent and dual-view Proxies; Proxy mutation and ambient-intrinsic replacement attempts; prototype-spoofed brand-preserving built-ins; clone-demoted host containers at the root, action, final-state and event boundaries; fresh normalization of ordinary and domain-typed errors thrown by an `ownKeys` trap; frozen/sealed ordinary inputs; and width-15 replay. No arithmetic transition, event vocabulary, research claim or browser rendering changed.

- `npm run typecheck` — pass
- focused mechanism-core, trace-fixture and complement-register tests — pass, 117 tests across 3 files
- `npm test` — pass, 420 tests across 22 files
- `npm run build` — pass
- `go run github.com/rhysd/actionlint/cmd/actionlint@v1.7.12 .github/workflows/ci.yml .github/workflows/pages.yml` — pass
- `git diff --check` — pass

## 2026-09-02 — bounded complement-register v2 trace semantics

The current-main baseline at `2395e9c29d8a7c38b079b7640b779c9694ee1c68` passed typecheck and 375 tests across 22 files. The accepted v1 complement trace emitted one event per unit of the subtrahend and made public `+345` look like 345 meaningful cycles. Version 2 instead represents one bounded forward-add action with begin/end markers, one register-advance event, and exactly one mathematically validated boundary-crossing summary per decimal order. Event count is `width + 2`, independent of delta magnitude; summaries use the change in `floor(value / 10^(order+1))` between before and after.

The large width-15 fixture `999999999999998 - 888888888888888 = 111111111111110` produces 17 events, not a magnitude-sized list. Replay regenerates and compares compact events from state/action before reducing them, rejects v1/unknown envelopes and tampered summaries/order/action/final state/extra fields, and retains explicit underflow/width/value rejection. The public panel now calls `+345` one bounded delta and shows per-order crossing counts, explicitly not physical cycles or historical timing.

The bounded Belair re-check did not close the digit-table uncertainty: DjVu p.373 still directly provides opposite ordering plus the one `1/8 → 0/9` transition, not a readable full ten-pair table. No research-gap claim was narrowed.

- `npm run typecheck` — pass
- focused complement-register tests — pass, 18 tests
- `npm test -- --run` — pass, 380 tests across 22 files
- `npm run build` — pass
- `git diff --check` — pass

Bilingual browser smoke for `#/visible-carry` and `#/about` was attempted, but the browser extension remained disconnected; no successful browser smoke is claimed.

No deployment check was performed for this not-yet-pushed completion commit.

## 2026-09-02 — Pascal/Belair complement-subtraction boundary and P/M lesson

The current-main baseline at `4b66bbbf92970d655b3710c4dfbe7da9a2130887` passed typecheck and 362 tests across 21 files. The Wikisource transclusions were resolved to the Brunschvicg/Boutroux 1923 DjVu. Pascal's *Avis* was checked at DjVu pp.359–360 (written construction/use description expressly withheld), p.362 (addition/subtraction and multiplication/division performed by one movement), and pp.363–364 (machine removes mental retaining/borrowing). Belair's separate 1659 letter was checked at DjVu p.371 (five-place machine in hand; input wheels cannot turn the other way), p.373 (mask selects lower addition or upper subtraction figures; opposite order; one `1/8 → 0/9` paired transition), and pp.376–377 (`99999 + 1` sequential falling carry pieces). No full ten-pair complement table, surviving-object identity, or complete historical subtraction procedure is claimed.

A generic `complement-register` P/M mechanism now models fixed-width nines complement, dual readouts, bounded `C(A)+B` forward increments, generic carry-boundary markers, deterministic transition/replay and fail-closed trace validation. The historical panel explicitly separates Pascal/Belair H/E1 claims from M complement arithmetic and the P/M event sequence.

- `npm run typecheck` — pass
- focused complement-register + decimal-core tests — pass, 70 tests
- `npm test -- --run` — pass, 375 tests across 22 files
- `npm run build` — pass
- `git diff --check` — pass

Bilingual browser smoke for `#/visible-carry` and `#/about` was attempted, but the browser extension remained disconnected; no successful browser smoke is claimed.

No deployment check was performed for this not-yet-pushed completion commit.

## 2026-09-02 — Thomas 1868 pamphlet/opening and revision boundary audit

The current-main baseline at `2f3ec51c105540769013ff339b42ae8ecd5c47fb` passed typecheck and 361 tests across 21 files. Smithsonian IIIF manifest `NMAH-AHB2018q019415` was resolved directly: it exposes exactly one 3000×1846 canvas labeled `image NMAH-AHB2018q019415`, an unnumbered title/legend opening—not a pamphlet page sequence. The readable 1868 legend anchors setting sliders `A`, operation selector `B`, result windows `C`, multiplier/quotient windows `D`, movable carriage/plate `M`, operating crank `N`, right `O` clearing `D`, left `P` clearing `C`, and the note that `O/P` also lift/slide `M`. It does not expose multiplication/division steps, turn counts, shift order, overshoot, add-back, termination, remainder, or counter direction.

Object records were kept revision-specific. `MA.327900` (1867) supplies 8 setting levers, 7 carriage positions, 9/16 register windows, ADD/MULT versus SUB/DIV selector, counterclockwise versus clockwise revolution-register direction, and right revolution-register clear at catalog precision; its left control is cataloged only as a lifting knob. `MA.335215` (ca.1873, serial 1068) supplies different 10-lever, 11/20-window capacities and independent right/left register clears, and is cataloged as received with the separately stored 1868 book. The ca.1820 `nmah_690692` boundary is ribbon-operated, has individual result-digit clears and no revolution register; later crank/dual-register procedure was not back-filled into it.

The generic operator-division and register-lifecycle transitions were not changed. Their phase/event names, signed overshoot, separate detection, mandatory add-back and lifecycle order remain deterministic P/M choices, not Thomas terminology or timing.

- `npm run typecheck` — pass
- focused provenance/operator-division/register-lifecycle tests — pass, 48 tests
- `npm test -- --run` — pass, 362 tests across 21 files
- `npm run build` — pass
- `git diff --check` — pass

Bilingual browser smoke for `#/division`, `#/controls`, and `#/about` was attempted, but the browser extension remained disconnected; no successful browser smoke is claimed.

No deployment check was performed for this not-yet-pushed completion commit.

## 2026-09-02 — Controlled-Key recovery/release protocol grounding

The current-main baseline at `d552a7744ca70363a219c593f56cec1b63126932` passed typecheck and 360 tests across 21 files. The image-only Felt & Tarrant scans were rendered locally and directly inspected. *Easy Instructions* ca. 1920 gives the general “complete unfinished stroke → release key → continue” account on PDF p.2 and the red Correction Button decision rules on printed p.8 / PDF p.5. *Methods of Operating the Comptometer* 1921 gives Model H locking/correction on printed pp.IX–XI / PDF pp.7–8: other columns lock, addition correction completes/retries the partial key before the red Release Button, multiple faulty columns each require correction, and multiplication/division guidance says cancel and redo.

Ziehm US1,110,734 was checked in the patent facsimile. Specification p.4 says partial depression/release arrests accumulation and locks other columns; completing the formerly partial key gives the intended accumulation; release key 134 then releases all orders; release before correction does not permanently release them. Claims 11, 16 and 19 preserve the partial-release/other-column/release responsibility. NMAH Model F records `MA.335357` and `MA.333576`, publication `1989.3054.01`, and SMG `1921-16` were kept at object/catalog precision. Matching the 15 September 1914 plate date to the patent grant date was not treated as production-feature proof. Recovery/Correction is also kept separate from the cataloged zeroing handle.

The generic `key-stroke-integrity` transition/replay model was not changed. Its named detection, locking, exactly-once commit and release events remain P/M rather than Model F event names or physical timing.

- `npm run typecheck` — pass
- focused `tests/control-provenance.test.ts` + `tests/key-stroke-integrity.test.ts` — pass, 19 tests
- `npm test -- --run` — pass, 361 tests across 21 files
- `npm run build` — pass
- `git diff --check` — pass

Bilingual browser smoke for `#/controls` and `#/about` was attempted, but the browser extension remained disconnected; no successful browser smoke is claimed.

No deployment check was performed for this not-yet-pushed completion commit.

## 2026-09-02 — Millionaire operator/control protocol grounding

The current-main baseline at `86700edf0b3613f9f8f34f7c5fbf9d1d5c929c27` passed typecheck and 360 tests across 21 files after the merged decimal-register replay hardening. Direct inspection of US 558,913 anchors the patented-design distinction: multiplication-table controlling plates, multiplier lever/scale selection, multiplicand setting/indication, and one complete crank rotation repeated for each multiplier figure. The patent's described form starts at the left of the multiplier but explicitly calls that arrangement a convenience and describes an alternate right-starting units/shift/tens ordering; it therefore does not historicalize the repository's right-to-left `7 → shift → 2` trace.

Smithsonian API records for identified lever-set manual examples `MA.328619`, `MA.323594`, and `MA.333940` anchor the visible 0–9 multiplier control, A/M/D/S selector, operating crank, three register/window responsibilities, zeroing knobs, and carriage-shift button at object/catalog precision. Accession documentation `.03`–`.07` was resolved by role: `.03` operating instructions and `.04` descriptive leaflet have no exposed pages, `.05` is disassembly instructions, `.06` is a 1906 article, and `.07` is a later NBS newsletter. Powerhouse `263911` independently identifies the 1907 nine-page-plus-figures booklet as directions for taking the machine apart, not an operator manual. No readable primary lid instruction sheet was found in the bounded access check.

The multiplication exhibit now visibly separates H/E1 patent/object evidence from the P/M deterministic trace. Its exact digit order, generated lookup table, shift semantics and event timing remain explicit non-claims.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 360 tests across 21 files
- `npm run build` — pass
- `git diff --check` — pass
- focused direct-multiplier tests — 22 tests passed

Bilingual browser smoke for `#/multiplication` and `#/about` was attempted, but the browser extension remained disconnected; no successful browser smoke is claimed.

No deployment check was performed for this not-yet-pushed completion commit.

## 2026-09-02 — decimal-register action-derived replay provenance

The exact current-main baseline `e19485647ee0dd02dee52d98b050e3adbe44379f` passed typecheck, 320 tests across 21 files, and a production build before the PR was rebased. The shared replay helper previously reconstructed only the recorded final state: a decimal trace could omit every reducer-level no-op `CRANK_BEGIN`, `CARRY_*`, and `CRANK_END` marker, reorder independent wheel steps, or detach action/cycle metadata while still being accepted whenever the retained wheel updates reached the recorded digits.

Replay now requires the deterministic transition alongside the event reducer. The reducer remains the source of the returned replayed state, while the transition independently re-derives the action-authorized envelope, complete ordered events, warnings, errors, and final state. Decimal state/action and the trace envelope reject unsupported enumerable string/Symbol fields. Digit arrays require an ordinary Array prototype plus every canonical index as an own enumerable slot, so an inherited value cannot conceal a sparse hole behind a non-canonical key. Comparison preserves object-member insertion-order tolerance without JSON's lossy treatment of enumerable `undefined`, Symbol keys, sparse arrays, or non-finite values. A transition with no event available to bind the mechanism/cycle envelope fails closed. Focused regressions cover omitted control markers, commutative wheel-step reordering, sequence/action/envelope-cycle changes, warning and error tampering, unknown event types, sparse/prototype-inherited arrays, zero-event transitions, faulty reducer/transition final states, and unsupported fields on the trace, state, action, event, and final state.

- `npm run typecheck` — pass
- `npx vitest run --maxWorkers=1` — pass, 360 tests across 21 files
- `npm run build` — pass
- `git diff --check` — pass
- focused mechanism-core and canonical-fixture tests — 59 tests passed

No browser or deployment check was performed because this slice changes trace provenance, replay validation, tests, and project records only; UI output is unchanged.

## 2026-09-02 — Scheutz British-patent 2214/2216 identity audit

The current-main baseline at `0ecd9f9f6671f687c525cba0d9146e29eea99922` passed typecheck and 320 tests across 21 files. Direct page-image inspection of *The Mechanics' Magazine* printed pp. 167 and 426 establishes No. 2214 as Lionel John Wetherell and Augustus Johann Hoffstaedt's improved pump patent, dated 16 October 1854; the p. 426 sequence places Wain No. 2213 immediately before it and George/Edward Scheutz's calculating-and-printing No. 2216, dated 17 October, immediately after. This independently agrees with the already inspected *Journal of the Society of Arts* p. 393 Scheutz 2216 entry.

Merzbach Appendix I was rechecked at printed pp. 43–55: its header says British Patent A.D. 1854 No. 2216, the provisional specification says filed 17 October 1854, and the final specification closes with the Scheutz names and 9 March 1855 signatures/seals. Merzbach's pp. 26–27 narrative mentions the drawings plus Edvard letter as the only Albany explanation but does not connect that set to 2214. The current Smithsonian API/IIIF metadata still displays 2214, and the one drawing canvas visibly has Fig. 1–14. The related letter remains unexposed. Therefore the patent identities are resolved—2214 pump, 2216 Scheutz—while the editorial cause/history of the Smithsonian catalog conflict remains unknown rather than being labelled a typo.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 320 tests across 21 files
- `npm run build` — pass
- `git diff --check` — pass
- focused source-atlas tests — 17 tests passed

Source-atlas data changed, but the browser extension remained disconnected; no successful bilingual browser smoke is claimed. Build and typed atlas tests passed.

No deployment check was performed for this not-yet-pushed completion commit.

## 2026-09-02 — Curta Type II systematic service-leaf census

The current-main baseline at `ace1e804e33b8143c899f73f96765aecbfec0059` passed typecheck and 320 tests across 21 files. The actual Type II service targets were resolved from the existing index hrefs rather than visible collector labels: two 43-page green image-only variants and a separate 55-page German image-only scan. Every page of the English-green and German-1967 scans was rendered and visually inspected; the German-green cover/front matter was inspected for the corresponding German notice, and its remaining pages are not claimed as fully inspected. Uncertain marks remain unreadable in the new leaf index.

The green covers internally identify Contina `CURTA Mod. II` but expose no date/revision/document number. Their front matter explicitly describes latest-modification replacement leaves, red changes and retained old leaves, and warns that reused Model I pictures may differ from Model II. The separate German cover internally identifies Model II `11×8×15` and states issue in autumn 1967; revision/addition tables exist on pp. 4–5, but fine-print entries not reliably readable were not converted into chronology. The census records exact readable green leaves for zero/home, carriage/lock, reversing, clearing, crank and zero-positioner responsibilities. It concludes that one dated 1967 German issue exists separately from two undated green replacement-leaf assemblies; no complete cross-scan replacement chronology or production adoption is established.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 320 tests across 21 files
- `npm run build` — pass
- `git diff --check` — pass
- focused source-atlas tests — 17 tests passed

A browser smoke was attempted because atlas data changed, but the browser extension was disconnected and local Edge headless DOM capture returned no document. No successful browser smoke is claimed. The build and typed atlas tests validate the public-data change; this access/tool limitation does not alter the evidence result.

No deployment check was performed for this not-yet-pushed completion commit.

## 2026-09-02 — Analytical replay integration and Curta Type II sheet precision

The current-main pre-edit baseline at `d076a061445b6dce498cc92c5a5e890e6b6693ad` passed typecheck and 302 tests across 21 files. The reviewed behavioral content of conflict-blocked PR #11 exact head `4a98fb186978356af5e860b76d0c15d811a28586` was applied only to the Analytical Engine flow and its tests, preserving current-main PR #10 direct-multiplication action-authority changes. Analytical replay and stepping now derive the canonical initial state/events/final state from an exact safe-integer `{a,b,c,d}` fixture and fail closed on fixture-only or alternate-fixture substitution, unknown enumerable string/Symbol fields, non-finite/undefined extensions, sparse or extended/reordered arrays and final-state tampering. Object member insertion order remains non-semantic.

A bounded Curta pass directly inspected the first manufacturer table/sheet in a 14-page Type II bill-of-material PDF and 154-page Type II drawing PDF. Visible internal evidence identifies Contina A.G. Mauren / CURTA II and records BOM table date 3.9.52, drawing `2’001.-*2` drawn 19.9.51, and a visible 1.4.53 change entry. These are sheet-level dates only: they do not establish a frozen service-manual issue, production launch, complete revision/replacement-leaf chronology, capacity on those sheets, hidden geometry or interchangeability. The modern `Dec. 2013` BOM wrapper is recorded as access/assembly metadata, not a manufacturer issue date.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 320 tests across 21 files; one later repeat hit transient multi-worker Node OOM, then `npm test -- --run --maxWorkers=1` passed the same 320/21 cleanly
- `npm run build` — pass
- `git diff --check` — pass
- focused Analytical Engine, direct-multiplier and source-atlas tests — 69 tests passed (30 + 22 + 17)

Local bilingual browser smoke:

- `#/source-atlas` rendered the new Type II manufacturer-sheet card and its three sheet dates in English and Chinese;
- `#/curta` retained the tested P arithmetic/operator abstraction and 8478 result;
- `#/about` retained the evidence-policy boundary;
- checked routes had no desktop horizontal overflow.

No deployment check was performed for this not-yet-pushed completion commit.

## 2026-09-02 — Bush 1931 and Shannon 1941 bounded full-text retry

The current-main pre-edit baseline passed typecheck and 292 tests across 21 files. Canonical full-text access was retried before changing evidence metadata. Bush's DOI resolved to ScienceDirect, whose article route presented human verification rather than pages; Commons exact-title search found no facsimile, the Internet Archive metadata route failed at TLS, and OpenAlex reported a closed work with no repository full text. Wiley's Shannon PDF returned HTTP 403; its rendered landing page exposed bibliographic metadata/references but no article body, Commons found no exact-title facsimile, and OpenAlex likewise reported no repository full text.

Both works therefore remain bibliographic-only. The typed atlas now exposes Bush 1931 as a construction-publication role and Shannon 1941 as a separate mathematical-theory publication role, each with `fullFacsimileInspected: false`, empty page/figure anchors, and explicit prohibitions on content-page, equation, geometry, wiring, timing, torque/error and repository P/M claims. The directly inspected Bush–Caldwell application and Smithsonian component/generation records remain separate. No runtime mechanism or public continuous/error-control wording required correction.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 292 tests across 21 files
- `npm run build` — pass
- `git diff --check` — pass
- focused source-atlas test — 16 tests passed

Local bilingual browser smoke:

- `#/source-atlas` rendered separate Bush construction and Shannon theory bibliographic-only cards in English and Chinese, with no false full-text status;
- `#/continuous` retained its P/M continuous-flow boundary;
- `#/mechanical-error-control` retained distinct frontlash and torque responsibilities;
- `#/about` retained the evidence-policy boundary;
- checked routes had no desktop horizontal overflow.

No deployment check was performed for this not-yet-pushed completion commit.

## 2026-09-02 — Scheutz patent identity and Royal Society examination

The current-main pre-edit baseline passed typecheck and 292 tests across 21 files. A directly inspected public-domain scan of *Journal of the Society of Arts*, vol. III no. 126, 20 April 1855, printed p. 393 lists patent 2216 for George and Edward Scheutz under patents sealed 13 April, with the calculating-and-printing-results title and adjacent entries 2208/2304. This independently agrees with the No. 2216 header in Merzbach Appendix I. Smithsonian drawing catalog No. 2214 remains recorded as a discrepancy; it is not silently rewritten or declared a typo.

The original-period scan of the Royal Society committee report was directly inspected across printed pp. 499–509. It separates Scheutz mechanism from Babbage lineage, reports four difference orders / fifteen-digit values / eight printed function digits, describes alternating additions and lead-to-stereotype output, mathematically analyses omitted-difference/decimal limits, and records a backward-print-order limitation. Qualitative smoothness, utility, speed and error-risk language remains committee assessment rather than a controlled modern performance benchmark. No P/M mechanism code or output-contract wording changed.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 292 tests across 21 files
- `npm run build` — pass
- `git diff --check` — pass
- focused source-atlas test — 16 tests passed

Local bilingual browser smoke:

- `#/source-atlas` rendered five separated Scheutz cards, including p. 393 patent identity, pp. 499–509 committee report and the visible 2214/2216 discrepancy, in English and Chinese;
- `#/finite-difference` retained its P/M flow;
- `#/output-contracts` required no correction and retained its table-output boundary;
- `#/about` retained the evidence-policy boundary;
- checked routes had no desktop horizontal overflow.

No deployment check was performed for this not-yet-pushed completion commit.

## 2026-09-02 — Smithsonian Scheutz built-engine and operational-drawing evidence

The current-main pre-edit baseline passed typecheck and 291 tests across 21 files. NMAH object records and their IIIF manifests were directly inspected for the surviving 1853 Scheutz engine `MA.323659` / `nmah_997042` and ca.1857 drawing set `1988.0798.01` / `nmah_1005138`. The object record establishes maker/date/place/material/dimensions plus Paris/Dudley/government-contract catalog context; the drawing record establishes 14 figures and the drawings-plus-unexposed-letter instruction provenance. It explicitly says the figures are similar to but not identical with final patent specifications.

The 84-page GovInfo PDF of Merzbach's 1977 Smithsonian study was identity-checked and searched at printed-page precision. Anchors now include p. 13 (1853 completion), pp. 19–21 (patent and Paris chronology), pp. 26–29 (Albany, instructions, work and contract), and Appendix I pp. 43–55 (reproduced British Patent A.D. 1854 No. 2216). The NMAH drawing catalog instead says No. 2214; both source wordings remain explicit and unreconciled. Merzbach prose remains H/E2, while the identified patent appendix is separately described only at reproduced-primary precision.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 292 tests across 21 files
- `npm run build` — pass
- `git diff --check` — pass
- focused source-atlas test — 16 tests passed

Local bilingual browser smoke:

- `#/source-atlas` rendered three separated Scheutz cards for built object, operational drawing set and institutional study/patent reproduction, including the 2214/2216 conflict, in English and Chinese;
- `#/finite-difference` retained its P/M difference/output flow;
- `#/output-contracts` required no wording correction and retained its table-output boundary;
- `#/about` retained the evidence-policy boundary;
- checked routes had no desktop horizontal overflow.

No deployment check was performed for this not-yet-pushed completion commit.

## 2026-09-02 — direct multiplication action-bound replay

The current-main pre-edit baseline passed typecheck and 292 tests across 21 files. Direct-multiplication traces previously retained only the initial state, ordered events and final state, so replacing both events and final state with a valid trace for another multiplier still passed replay. Traces now record the requested multiplier action and replay regenerates the canonical event sequence from that action and the initial multiplicand before accepting it. Event comparison reuses the core trace canonicalizer: recursively sorted object keys make JSON member insertion order semantically irrelevant, while event array order and serialized field values remain authoritative. Missing actions, unknown action discriminators and unsafe multipliers fail closed; additional action metadata remains inert for forward compatibility. Undefined-only object members follow JSON serialization semantics and are ignored, while defined event extensions are rejected. Zero and `Number.MAX_SAFE_INTEGER` multiplier boundaries remain supported.

- `npm run typecheck` — pass
- `npm test` — pass, 302 tests across 21 files
- `npm run build` — pass
- `git diff --check` — pass
- focused direct-multiplier regression — 22 tests passed
- `actionlint` — pass

No browser or deployment check was performed because this slice changes only trace provenance, replay validation, tests and project records; UI output is unchanged. No push or PR was performed from this worktree.

## 2026-09-01 — H. P. Babbage 1889 publication-access boundary

The current-main pre-edit baseline passed typecheck and 291 tests across 21 files. Cambridge Core directly confirmed the 1889-first-published Spon compilation, chapter 32 *Proceedings of the British Association, 1888*, reproduced chapter range pp. 331–338, and DOI `10.1017/CBO9780511694721.033`. Its accessible preview exposed only numbered items 1–5; the PDF route returned the access page rather than printed page images. Library of Congress metadata independently identifies the Tomash 1982 volume as a reprint of the 1889 E. & F. N. Spon edition, but exposes only an illustration.

Because items 10–20 and their page breaks were not directly viewable, the source atlas now records pp. 331–338 only as E1 chapter-range metadata while retaining Number/Directive/Operation roles and `(ab+c)d` as E3 Fourmilab transcription content. The printed drawing-catalogue chapters were likewise not exposed, so no cross-walk to modern `BAB/A/125`, `BAB/D/028`, or `BAB/P/167` codes was invented. The Analytical Engine P/M trace was not changed.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 291 tests across 21 files
- `npm run build` — pass
- `git diff --check` — pass
- focused source-atlas boundary test remained green within the full suite

Local bilingual browser smoke:

- `#/source-atlas` rendered four Analytical Engine cards with the pp. 331–338 range, E3 marker and explicit no-content-page boundary in English and Chinese;
- `#/analytical-engine` retained its P/M information-flow lesson;
- `#/about` retained the evidence-policy boundary;
- checked routes had no desktop horizontal overflow.

No deployment check was performed for this not-yet-pushed completion commit.

## 2026-09-01 — decimal/integrator replay integrity and Curta Type II service precision

The current-main pre-edit baseline passed typecheck and 277 tests across 21 files. Reviewed PR #8 exact head `6724e40154151d94bd83c4af2fa457f032927d85` and PR #9 exact head `72a0ca0ea0e7dcd2c3b36f3f5da6a624171f2caf` were used as code/test inputs without importing stale verification prose. The current-main patch now rejects unknown decimal-register event discriminators at runtime and makes integrator replay action-derived, including strict non-empty cycle ids, explicit-null input rejection, endpoint validation and genuine zero-action traces.

The 43-page image-only Curta Model II service PDF was downloaded from the mycurta specialist mirror, rendered locally and visually inspected. Direct anchors were recorded at PDF pp. 1–2, p. 6 / leaf `N I-a`, p. 10 / leaf `O-1-2`, and p. 34 / leaf `S 3`. The manual's replacement-leaf notice and warning that reused Model I pictures may differ in detail/proportion from actual Type II remain explicit; no cover capacity/date/revision was visible.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 291 tests across 21 files
- `npm run build` — pass
- `git diff --check` — pass
- focused decimal-register, continuous-integrator and source-atlas regression — 55 tests passed
- canonical `0099 + 1 → 0100` replay remained unchanged; integrator numerical/UI semantics remained unchanged

Local bilingual browser smoke:

- `#/source-atlas` rendered four Curta source cards, including the Type II replacement-leaf service card and exact leaf anchors, in English and Chinese with no desktop horizontal overflow;
- `#/curta` retained its existing P operational diagram and source-atlas link;
- `#/about` retained the evidence-policy boundary.

No deployment check was performed for this not-yet-pushed completion commit. PR closure/supersession is left to repository review; contributor branches were not rewritten.

## 2026-09-01 — Thomas register controls and independent lifecycle

The current-main pre-edit baseline passed typecheck and 264 tests across 20 files. The Smithsonian `nmah_904757` IIIF manifest was directly inspected: its sole 3000×1846 canvas is one readable open spread of the 1868 pamphlet, with result windows `C`, multiplier/quotient windows `D`, right knob `O` clearing `D`, and left knob `P` clearing `C`. The 1867 `MA.327900` and ca.1873 `MA.335215` catalog/object descriptions were kept separate, and Oxford's attribution of independent carriage zeroing to an 1865 booklet engraving remains R/E2 rather than a directly inspected primary booklet.

A generic P/M `register-lifecycle` model now wraps the existing revolution-counter state and exposes independent result/revolution clears plus mode selection. Already-zero clears are recorded deterministic actions; replay is action-derived and rejects forged preserved-register values, before-values, order, counter state and final state.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 277 tests across 21 files
- `npm run build` — pass
- `git diff --check` — pass
- focused register lifecycle plus revolution-counter/operator-division/setting-crank/key-integrity regression — 85 tests passed

Local bilingual browser smoke:

- `#/controls` preserved `8478 / 27` through mode selection, cleared revolutions to `0` while retaining result `8478`, then cleared result independently; English/Chinese evidence boundaries rendered without desktop horizontal overflow;
- `#/division` retained the operator-division lesson at phase `READY` on reset;
- `#/about` retained the evidence-policy boundary.

The pamphlet manifest exposes no additional procedure pages, and no Thomas linkage/timing or universal revision claim is made. No deployment check was performed for this not-yet-pushed commit.

## 2026-09-01 — Controlled-key source boundary and key-stroke integrity

The current-main pre-edit baseline passed typecheck and 251 tests across 19 files. This slice directly inspected Turck's 1921 public-domain facsimile at viewer pages 179–182 / printed pp. 159–162, the Smithsonian `nmah_905178` catalog and one-canvas IIIF manifest, and Science Museum Group object `1921-16`. It added a generic P/M key-stroke-integrity controller that wraps the existing accumulator instead of duplicating arithmetic: incomplete release leaves arithmetic unchanged, explicit detection locks unrelated input, correction commits the errant key exactly once through existing key events, and release preserves the result.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 264 tests across 20 files
- `npm run build` — pass
- `git diff --check` — pass
- focused key-stroke-integrity/key-driven/setting-crank regression — 51 tests passed
- operator-division and revolution-counter regressions remained green in the full suite

Local bilingual browser smoke:

- `#/controls` stepped units-key `7` through early release, explicit detection/input lock at accumulator `0`, exactly-once correction to `7`, lock release and return to `IDLE`; English and Chinese source boundaries rendered with no desktop horizontal overflow;
- `#/arithmetic-labor` retained its existing operator-work profiles;
- `#/about` retained the evidence-policy boundary;
- the current key-driven arithmetic presentation remained intact through focused tests and the control scenario's delegated accumulator commit.

The Smithsonian manifest exposed only one object image, not manual pages; Wolff's exact white-button/trigger/upstroke account remains E3 orientation. No deployment check was performed for this not-yet-pushed commit.

## 2026-09-01 — current-main operator-division integration and procedure boundary

The pre-edit current-main baseline was 236 tests across 19 files with typecheck passing. Reviewed PR #6 exact head `7a81ad80068f97ca6fed1dd79a860cb250b64911` applied cleanly on current main without overwriting the later revolution-counter or source-atlas work. The Curta source pass directly inspected *Your CURTA Calculator* viewer page 1/2 for Model I/II control roles and kept the separate Curta.org division examples at E3 transcription precision. The Smithsonian Thomas 1868 route remained behind request verification and no stable exact instruction facsimile was found in the bounded search, so it remains catalog-identity only.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 251 tests across 19 files
- `npm run build` — pass
- `git diff --check` — pass
- focused operator-division plus revolution-counter regression — 44 tests passed
- bounded arithmetic sweep retained from the integrated reviewed patch: dividends `0..500`, divisors `1..50`, offsets `0..2`; 61,845 fitting configurations, 13,305 undersized configurations rejected, no mismatch

Local bilingual browser smoke:

- `#/division` exposed residual `-942` as `OVERSHOOT_PENDING` before the separate detection event changed the phase to `CORRECTION_REQUIRED`; completion produced quotient `27`, remainder `0`;
- `#/visible-carry` quick regression rendered the carry lesson after the merged revolution-counter hardening;
- `#/about` retained the evidence boundary;
- checked desktop routes had no horizontal overflow.

No deployment check was performed for this not-yet-pushed completion commit; no claim that the integration is already live is made.

## 2026-09-01 — DE2 and Differential Analyzer publication precision

The pre-edit remote-main baseline was 221 tests across 19 files. This slice directly inspected the complete 232-page Science Museum *Charles Babbage's Difference Engine No. 2: Technical Description*, exact R/E2 anchors at p. i, pp. 4–9, 21–24, 33–45, 49–54, 83–85, 187–188 and 212–218, and the H/E1 BAB/B/001 record. Bush 1931 and Shannon 1941 remain bibliographic-only after bounded publisher/repository access attempts; the complete APS facsimile of Bush and Caldwell's separate 1931 application paper, printed pp. 1898–1902 and Figures 1–3, was directly inspected instead.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 223 tests across 19 files
- `npm run build` — pass
- `git diff --check` — pass

Local browser smoke against Vite:

- `#/source-atlas` rendered four track groups and 23 source cards in English and Chinese, including the R/E2-versus-H/E1 detail boundary, exact inspected page/figure anchors, Bush/Shannon access limits and application-versus-construction distinction;
- `#/finite-difference` retained its calculation/output stepping and Difference Engine atlas cross-link in English and Chinese;
- `#/continuous` completed the P/M flow to tracer output `1.5`, reset, and retained its Bush atlas cross-link in English and Chinese;
- `#/about` retained the evidence-policy explanation in English and Chinese;
- `#/analytical-engine` quick regression retained the `(ab+c)d` lesson and atlas cross-link;
- no desktop horizontal overflow was observed on the checked routes.

No deployment check was performed for this not-yet-pushed commit; no claim that the new precision is already live is made.

## 2026-09-01 — Curta and Analytical Engine source hardening

The pre-edit remote-main baseline was 217 tests across 19 files. This slice directly inspected the US 2,525,352 text/PDF, Contina *Your CURTA Calculator* operator-guide page 1/2, the 1967 Model I service-manual cover 1/59, 1843 *Scientific Memoirs* scan pages 677/679/704, three Science Museum Analytical Engine drawing records, and Walker reconstruction documentation. The H. P. Babbage 1888 `(ab+c)d` account remains explicitly transcription-only after a bounded 1889-scan discovery attempt.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 221 tests across 19 files
- `npm run build` — pass
- `git diff --check` — pass

Local browser smoke against Vite:

- `#/source-atlas` rendered four track groups and 20 source cards in English and Chinese, including document role, access host, inspected page/figure anchors, partial-facsimile boundaries, and no scalar quality score;
- `#/curta` retained its operational P diagram and exposed the source-atlas cross-link;
- `#/analytical-engine` stepped the existing P/M `(ab+c)d` trace to output `50`, reset, and exposed the source-atlas cross-link;
- `#/about` still rendered the evidence-policy explanation;
- `#/finite-difference` still advanced its arithmetic/output trace and retained its source-atlas cross-link;
- no desktop horizontal overflow was observed on the five checked routes.

No deployment check was performed for this not-yet-pushed commit; no claim that the four-track atlas is already live is made.

## 2026-09-01 — operator-division causal overshoot and exact-zero completion

The rebased remote-main baseline was 221 tests across 19 files. This bounded correction lets a quotient digit at nine make the necessary tenth subtraction attempt only when that attempt overshoots, represents the resulting negative residual as `OVERSHOOT_PENDING` until the explicit detection event, and shifts through implied lower zero places before completing an exact division. Replay now rejects omitted or duplicated overshoot-detection events instead of treating detection as a removable no-op, re-derives every action/event group, requires unique non-empty cycle identities, and verifies canonical initial plus complete final state.

- `npm run typecheck` — pass
- `npm test` — pass, 236 tests across 19 files
- `npm run build` — pass
- `git diff --check` — pass
- bounded arithmetic sweep over dividends `0..500`, divisors `1..50`, and offsets `0..2` — 61,845 fitting configurations completed with the expected quotient/remainder; 13,305 undersized configurations rejected; no mismatch

Local browser smoke against Vite with headless Chrome 151:

- at `1280 × 900`, event 3 on `#/division` showed residual `-942`, phase `OVERSHOOT_PENDING`, and no overshoot-detection log entry;
- event 4 changed the phase to `CORRECTION_REQUIRED`, added the explicit detection entry, and only then instructed the operator to add back;
- finishing all 14 events produced quotient `27`, remainder `0`, and disabled further stepping;
- the completed view had no horizontal overflow at either `1280 × 900` or `390 × 844`, and no runtime JavaScript error was observed.

No deployment check was performed for this not-yet-pushed commit; no claim that the fix is already live is made.

## 2026-09-01 — named-machine source-anchor atlas

The pre-edit remote-main baseline was 208 tests across 18 files. This slice directly inspected Babbage Papers archive/index, calculation-drive, printing/stereotype, motion-notation and 1991/2002 reconstruction records; directly inspected the Smithsonian Differential Analyzer group plus five component records; retained Bush 1931 as bibliographic-only after a bounded facsimile attempt; and added typed supports/not-established anchors with a bilingual public atlas.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 217 tests across 19 files
- `npm run build` — pass
- `git diff --check` — pass

Local browser smoke against Vite:

- `#/source-atlas` rendered two track groups and 13 source cards, including BAB/A/171 calculation-only limits, Babbage lifetime-build boundaries, R/E2 reconstruction status, five separate Bush roles, and the Bush 1931 bibliographic-only warning in English and Chinese;
- `#/finite-difference` still advanced arithmetic/output traces and exposed its source-atlas cross-link;
- `#/continuous` still completed to tracer output `1.5`, reset, and exposed its source-atlas cross-link;
- `#/mechanical-error-control` still rendered separate Thomas, Odhner/Talamini and Bush responsibilities;
- `#/about` still rendered the evidence-policy explanation;
- no desktop horizontal overflow was observed on the five checked routes.

No deployment check was performed for this not-yet-pushed commit; no claim that the new route is already live is made.

## 2026-09-01 — human-machine arithmetic-work synthesis

The pre-edit remote-main baseline was 201 tests across 17 files. This slice directly inspected the Smithsonian calculating-machine overview, added a source-separated arithmetic-responsibility note, derived four typed P/M profiles from existing multiplication/key-driven/division/printing traces, and added a bilingual public comparison without an efficiency score or pseudo-historical productivity data.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 208 tests across 18 files
- `npm run build` — pass
- `git diff --check` — pass

Local browser smoke against Vite:

- `#/arithmetic-labor` rendered all four profiles, operator/machine responsibility pairs, event-derived counts, evidence boundaries, and no-leaderboard warning in English and Chinese;
- `#/multiplication` still exposed direct multiplication's two cycles and completed its trace to `8478`;
- `#/division` still exposed overshoot/correction and completed to quotient `27`, remainder `0`;
- `#/controls` still blocked a setting change during the crank cycle and reset;
- `#/output-contracts` still completed five operations, retained subtotal `20`, printed total `25`, and cleared the working accumulator;
- no desktop horizontal overflow was observed on the five checked routes.

No deployment check was performed for this not-yet-pushed commit; no claim that the new route is already live is made.

## 2026-09-01 — cross-machine mechanical error control

The pre-edit remote-main baseline was 194 tests across 16 files. This slice added a source-separated Thomas/Odhner/Talamini/Bush error-control map, directly inspected and recorded Smithsonian frontlash unit `1983.3002.04` / `nmah_693235`, separated integration/shaft/backlash/torque/tracing responsibilities, added four typed profiles and a bilingual public comparison, and left the ideal continuous-integrator mechanism unchanged.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 201 tests across 17 files
- `npm run build` — pass
- `git diff --check` — pass

Local browser smoke against Vite:

- `#/mechanical-error-control` rendered four separate source cards, three distinct error classes, the Smithsonian catalog/record identity, and the no-probability/no-RPM/no-physics boundary in English and Chinese;
- `#/visible-carry` still completed `0099 + 1` to `0100` and exposed its cross-link;
- `#/continuous` still completed the six-event ideal P/M cycle to tracer output `1.5`, reset correctly, and displayed the separate H/E1 frontlash responsibility;
- no desktop horizontal overflow was observed on the three checked routes.

No deployment check was performed for this not-yet-pushed commit; no claim that the new route is already live is made.

## 2026-09-01 — Thomas stepped-drum carry evolution

The pre-edit remote-main baseline was 190 tests across 16 files. This slice separated Thomas 1820 patent and surviving-object contexts, mapped Thomas 1865 rapid overrun, successive stepped-cylinder phasing, older simultaneous-load/false-result and replacement relationships, separated the Thomas de Bojano 1880 20→10-part proposal from R/E3 production interpretation, and reused the existing source-neutral ordinal P/M timeline for a cross-family visible-carry comparison.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 194 tests across 16 files
- `npm run build` — pass
- `git diff --check` — pass

Local browser smoke against Vite:

- the existing `0099 + 1` controls still stepped, completed to `0100`, exposed two carries, and reset;
- the ordinal slots remained `0,1,2`, with explicit text that they are neither Thomas tooth phasing nor Odhner/Marchant spiral geometry;
- Thomas 1820 patent, ca.1820 Smithsonian object, 1865 patent, 1880 patent proposal, and R/E3 revision interpretation rendered as separate cards;
- the Thomas 1865 versus Talamini/Marchant 1932 distinction, older simultaneous-load false-result statement, and proposal-not-adoption boundary rendered in English and Chinese;
- no desktop horizontal overflow was observed.

No deployment check was performed for this not-yet-pushed commit; no claim that this upgraded comparison is already live is made.

## 2026-09-01 — rotary carry scheduling constraints

The pre-edit remote-main baseline was 170 tests across 15 files. This slice separated US514725A baseline rotary transfer, US1377269A's rapid-rotation transfer-arm/miscalculation constraint, and Talamini/Marchant US1867603A's staggered opportunities/phase-overlap experiment; added a direction-neutral ordinal P/M scheduler with fail-closed replay; and exposed the scheduler plus three typed patent profiles below the existing visible-carry comparison.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 190 tests across 16 files
- `npm run build` — pass
- `git diff --check` — pass

Local browser smoke against Vite:

- the existing `0099 + 1` controls still stepped, completed to `0100`, exposed two carries, and reset;
- the rotary section rendered strictly increasing slots `0,1,2` and the explicit no-angle/no-time/no-safe-RPM/no-failure-probability boundary;
- Odhner 1894, Valentin Odhner 1921, and Talamini/Marchant 1932 remained separate source cards with H/E1 and `not established` text;
- English and Chinese text rendered, and no desktop horizontal overflow was observed.

No deployment check was performed for this not-yet-pushed commit; no claim that this upgraded comparison is already live is made.

## 2026-09-01 — carry architecture provenance and replay hardening

The pre-edit remote-main baseline was 150 tests across 14 files. This slice separated Pascal's operational text, Cnam object description, CMU reconstruction, Felt US366945A, Felt US762520A, and Smithsonian Model A catalog roles; hardened key-driven state validation and action-derived replay; and added typed bilingual carry profiles below the unchanged generic visible-carry P/M interaction.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 170 tests across 15 files
- `npm run build` — pass
- `git diff --check` — pass

Local browser smoke against Vite:

- the existing `0099 + 1` step and complete controls still reached `0100`, exposed two carry propagations, and reset to `0099`;
- six typed source profiles rendered source/model/date, H/R and E1/E2 labels, documented roles, operator implications, and not-established boundaries;
- the generic serialized P/M versus historical carry-storage/scheduling boundary was visible;
- English and Chinese text rendered, and no desktop horizontal overflow was observed.

No deployment check was performed for this not-yet-pushed commit; no claim that this upgraded comparison is already live is made.

## 2026-09-01 — persistent output contracts and printing ledger

The pre-edit remote-main baseline was 133 tests across 13 files. This slice added a deterministic P/M printing ledger with structured persistent ITEM/SUBTOTAL/TOTAL lines, subtotal retention, total clearing, safe-integer validation, replay and tamper rejection; a typed five-profile output provenance dataset; a source-backed register/listing/Difference Engine comparison; and the bilingual `#/output-contracts` route.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 150 tests across 14 files
- `npm run build` — pass
- `git diff --check` — pass

Local browser smoke against Vite:

- `+12`, `+8`, subtotal, `+5`, and total stepped in the required order;
- subtotal left the working accumulator at 20, total cleared 25 to 0, and all five structured lines persisted;
- reset restored an empty record and zero accumulator;
- five source profiles rendered source/model/date, claim/evidence labels, documented behavior, and open boundaries in English and Chinese;
- the generic-ledger/Burroughs boundary and modern “audit trail” terminology boundary were visible;
- no desktop horizontal overflow was observed;
- the existing finite-difference output lesson still rendered.

No deployment check was performed for this not-yet-pushed commit; no claim that this upgraded route is already live is made.

## 2026-09-01 — subtraction, zeroing, and control provenance

The pre-edit remote-main baseline was 128 tests across 12 files. This slice added a family-separated source map for Thomas, Odhner, Felt/Tarrant and Pascaline controls; a typed evidence dataset with source/model, two-axis evidence labels, documented roles and explicit open boundaries; and source-driven comparison cards below the unchanged generic P/M interlock lesson. It also tightened the operator-division evidence boundary without changing its mechanism.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 133 tests across 13 files
- `npm run build` — pass
- `git diff --check` — pass

Local browser smoke against Vite:

- setting change, cycle begin, blocked active-phase setting attempt, completion/home return, and reset still worked;
- the generic P/M event log remained distinct from all historical profiles;
- five typed profiles rendered with visible model/date, source ID/link, claim type, evidence strength, documented roles and not-established boundaries;
- Thomas, Odhner US1510100, Felt US960528, Turck US1154897 and Pascaline H/R entries were readable in English and Chinese;
- no desktop horizontal overflow was observed.

No deployment check was performed for this not-yet-pushed commit; no claim that this upgraded route is already live is made.

## 2026-09-01 — Difference Engine provenance and output contract

The pre-edit remote-main baseline was 108 tests across 12 files. This slice hardened difference-column state/event/replay validation, added a tested P/M flow from generated table value to persistent check-copy and master/stereotype output roles, and mapped Difference Engine No. 1, Difference Engine No. 2 design/reconstruction, BAB/A/173–176 drawing records, and built Scheutz engines without claiming printer geometry.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 128 tests across 12 files
- `npm run build` — pass
- `git diff --check` — pass

Local browser smoke against Vite:

- square preset remained at `0,1,2` columns and generated `1` after one arithmetic crank;
- the new output state started with no calculation-ready/check-copy/master state;
- stepping exposed calculation-ready first, then persistent check-copy `1`, then master/stereotype role `1`;
- reset removed all derived output artifacts without changing the arithmetic result;
- square/cubic preset controls rebuilt the output source coherently;
- M, H/E1, R, H, P/M and open boundaries remained readable in Chinese and English;
- no desktop horizontal overflow was observed.

No deployment check was performed for this not-yet-pushed commit; no claim that this upgraded route is already live is made.

## 2026-09-01 — continuous mechanics provenance and replay

The post-hardening-PR baseline was 96 tests across 11 files. This slice replaced the minimal Euler helper with a validated P/M independent/input/integrated-quantity model, ordered observation/coordinate/integration events, fail-closed action/event boundaries, and hardened replay. It added an explicit A+B→integrator→tracer teaching flow, a source/generation map for Differential Analyzer evidence, and the required six-family representation/protocol comparison.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 108 tests across 12 files
- `npm run build` — pass
- `git diff --check` — pass

Local browser smoke against Vite:

- `#/continuous` rendered in Chinese with no desktop horizontal overflow;
- initial/reset state showed A=2, B=1, no adder or tracer output, coordinate/integral 0, and event 0/6;
- stepping exposed input observation, explicit `2+1=3`, integrator observation, coordinate `0→0.5`, integral `0→1.5`, then tracer output `1.5`;
- the ordered log and H/E1 vs M vs P/M vs open boundary remained readable without motion/color;
- reset restored the initial empty derived state.

No deployment check was performed for this not-yet-pushed commit; no claim that this upgraded route is already live is made.

## 2026-09-01 — Analytical Engine flow and Pages reconciliation

Replaced the five-label static flow with a deterministic P/M `(ab+c)d` trace: given values enter named Store locations, two operands enter the Mill, validated operations produce `p=6`, `q=10`, and `result=50`, intermediate results return to Store, and output remains empty until the final output event. Replay validates sequence, role metadata, Store references/transfers, operand readiness, arithmetic, operation order and final state. The route now supports event stepping, reset, ArrowRight stepping, bilingual Store/Mill/card/output state, and an ordered text log.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 91 tests across 11 files
- `npm run build` — pass
- `git diff --check` — pass

Local browser smoke against Vite:

- `#/analytical-engine` rendered without horizontal overflow at the available desktop viewport;
- stepping populated `V1..V4`, exposed Mill inputs/operation/result, then stored `p=6`, `q=10`, and final `V7=50` before output;
- reset restored an empty Store/Mill/output and event `0`;
- the event log exposed NUMBER/DIRECTIVE/OPERATION/OUTPUT roles without relying on animation or color.

Publishing reconciliation:

- GitHub Actions `Deploy Pages` run `33443320058` succeeded for `db3b1aafdfdfa66db6998a14073f809af1f8433d`;
- <https://tmzncty.github.io/mechanical-computing-playground/> was directly reachable and returned Mechanical Computing Playground content before this commit;
- deployment of this new Analytical Engine commit must complete before its upgraded hash route is claimed live.

## 2026-09-01 — control interlock and Curta provenance

Added the generic P/M setting–crank interlock with explicit setting lock, crank release, active cycle, home return, crank relock and setting release events; invalid active-phase actions; invariant validation; and hardened replay. Added `#/controls`, source-backed Odhner/Curta control research, a patent/manual-based Curta source map, and reconciled the Curta machine notes.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 78 tests across 10 files
- `npm run build` — pass
- `git diff --check` — pass

Desktop browser smoke check against local Vite at the available 1072px viewport:

- `#/controls` rendered with no horizontal overflow;
- changing `314 → 315` produced a setting event and revision increment;
- beginning a cycle showed `ACTIVE`, released crank and locked setting, with lock preceding release in the event log;
- an attempted active-phase setting change was visibly blocked without changing state;
- completion returned `HOME_FREE`, counted one cycle, locked the crank and released setting;
- the ordered text log remained understandable without animation/color.

The browser environment did not expose a reliable narrow viewport despite a window resize request, so mobile layout is not claimed in this checkpoint.

## 2026-09-01 — operator-driven division procedure

Added the generic P/M `operator-division` mechanism, hardened event replay, `8478 ÷ 314 = 27` and `1000 ÷ 64 = 15 remainder 40` traces, source/evidence note, simulator matrix, and a public `#/division` stepping path.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 65 tests across 9 files
- `npm run build` — pass
- `git diff --check` — pass

Desktop browser smoke check against local Vite:

- `#/division` rendered in Chinese with no horizontal overflow at the available 1072px viewport;
- stepping four events exposed residual `-942` and `CORRECTION_REQUIRED` after three tens-place subtraction attempts;
- the event log remained readable without depending on animation or color;
- no runtime resource error was observed by the bounded page probe.

A narrow/mobile smoke check was not completed in this pass and is not claimed.

## 2026-09-01 — encoded table and key-driven accumulator

The direct-multiplier now stores an inspectable immutable table for digits `0..9`, and digit selection reads that represented control state. The generic P/M key-driven accumulator exposes key-stroke begin/end, place-value contribution, digit advances, serialized carries, human-operation count, determinism, and replay. The About view compares `SET_VALUE → CRANK` with `KEY_STROKE → ACCUMULATE` without claiming source-specific Comptometer geometry or timing.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 51 tests
- `npm run build` — pass
- `git diff --check` — pass

## 2026-09-01 — direct multiplication functional model (rebased integration)

After integration with the encoded-table and key-driven-accumulator work, the direct-multiplication slice provides deterministic digit-selection, operation-cycle, carriage-shift, accumulator, and replay events; a fourth path in the `314 × 27` comparison; full table/derived-value/order validation for replay; and an event/cycle-steppable bilingual workbench.

- `npm run typecheck` — pass
- `npm test` — pass, 54 tests across 8 files
- `npm run build` — pass
- `git diff --check` — pass

Browser smoke checks against the local Vite server and headless Chrome 151:

- desktop `1280 × 900` and mobile `390 × 844` layouts have no horizontal document overflow;
- single-event stepping exposes selector `7` and selected multiple `2198` without changing the accumulator;
- completing cycle one reaches accumulator `2198` at event `2 / 5`;
- completing cycle two reaches accumulator `8478` at event `5 / 5` and disables further step/cycle controls;
- English/Chinese switching preserves replay state; reset restores event `0 / 5` and accumulator `0`;
- no page/runtime JavaScript errors were observed (the existing absent favicon request is ignored).

The implementation is explicitly a claim-type P functional model informed by Steiger/Millionaire research. It does not claim source-specific cams, gears, control-plate geometry, timing, or dimensions.

## 2026-09-01 — documentation/research reconciliation

PR #1 (`docs: reconcile status and deepen mechanism research map`) changed documentation/research only; no TypeScript/runtime/test files were modified.

GitHub Actions CI run `33423493938` completed successfully for PR head `4289caeee1c2b67903afa853946c95faca8e57df`:

- `npm ci` — pass
- `npm run typecheck` — pass
- `npm test` — pass
- `npm run build` — pass

The PR was squash-merged as `ccc39d8e0b8a5c8cb83fa9bcf4d82672e30aa0f6`.

Follow-up `STATUS.md` reconciliation is documentation-only. No new browser behavior was introduced in this pass, so browser interaction smoke results below remain the last recorded manual browser check rather than being falsely re-dated.

## 2026-09-01 — revolution-counter replay and safe-integer boundary

The pre-edit remote-main baseline was 217 tests across 19 files. The isolated revolution counter now snapshots each caller-controlled field once, validates non-negative safe state, refuses an increment past `Number.MAX_SAFE_INTEGER`, and rejects unknown event discriminators plus forged sequence, before, or after fields instead of accepting an arbitrary recorded count.

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 230 tests across 19 files
- `npm run build` — pass
- `git diff --check` — pass

No UI, historical claim, or other mechanism is changed. No deployment check was performed for this not-yet-pushed commit.

## 2026-08-29 — local / browser checkpoint (UTC+8)

### Local

- `npm run typecheck` — pass
- `npm test -- --run` — pass, 32 tests
- `npm run build` — pass
- `git diff --check` — pass
- repository was clean after each published checkpoint

### Browser smoke checks

- `/` overview renders navigation cards.
- `#/visible-carry`: stepping from event 1 to 9 produces `0100`; reset returns `0099`.
- `#/finite-difference`: square/cubic presets and crank controls render state and update order.
- `#/multiplication`, `#/curta`, `#/analytical-engine`, `#/continuous`, `#/hand-crank-backprop`, and `#/about` render non-empty explanatory pages.
- Space key advances visible carry when that route is active.

### Remote publishing

CI for commit `30b3f16` completed successfully. Pages build jobs completed far enough to reach GitHub's Pages configuration step, but GitHub's `configure-pages` action failed because Pages was not enabled/configured for this repository at that checkpoint.

This was an external repository setting/API boundary, not a source build failure. The workflow remains explicit and should be re-tested once Pages is enabled/configured.

## 2026-09-05 — complete the current hand-crank backprop cycle

The exact remote-main baseline `c9e2ea0efd9a1563d38fa854f0e2d09e9bcf0102` reproduced a phase-boundary bug in the hand-crank backpropagation state machine. After three explicit single-step advances, “complete one learning cycle” always advanced ten more phases: it crossed the current `WEIGHT_UPDATE` boundary, entered the next cycle, left `phaseIndex` at 3, and accumulated 13 phase events. The first-red regression expected the current cycle to finish at `phaseIndex` 0 with exactly the ten ordered `STAGE_A_PHASES`, but received 3.

`runPhaseCycle` now advances only from the current phase index through the remaining phases of that cycle. The same partial-step scenario stops at the current cycle boundary, retains exactly the ten ordered phase events, and applies one weight update. A browser smoke on `#/hand-crank-backprop` confirmed three manual steps followed by cycle completion returned the display to `装入样本`, changed loss from `50.000` to `37.845`, and showed 10 phase log lines rather than 13.

- Node.js `22.23.2`
- `npm run typecheck` — pass
- `npm test` — pass, 421 tests across 22 files
- `npm run build` — pass
- `go run github.com/rhysd/actionlint/cmd/actionlint@v1.7.12 .github/workflows/ci.yml .github/workflows/pages.yml` — pass
- `git diff --check` — pass

No backpropagation formula, phase/event vocabulary, historical claim, evidence boundary, or deployment configuration changed.

## Current limitations

- The site uses hash routes so static Project Pages hosting does not require server-side rewrites.
- Curta, Difference Engine, continuous integration, and hand-crank backprop views contain pedagogical/operational abstractions where appropriate; they do not claim 1:1 historical geometry.
- The 2026-09-01 reconciliation improves research/evidence boundaries but does not constitute a new manual browser smoke pass.
- Pages live deployment still requires confirmation after repository settings are enabled/configured.
- After the next runtime/code change, run typecheck/tests/build again and perform browser smoke checks for affected routes.
