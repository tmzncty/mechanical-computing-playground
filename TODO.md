# TODO

`STATUS.md` is the current-state authority. This file is intentionally short and should contain only the next bounded tasks.

## Next up

- [ ] Migrate new/edited research notes to the two-axis policy in `docs/EVIDENCE_POLICY.md`; do not extend the old A–D scale into new domains.
- [x] Add a direct-multiplication functional model based on the Steiger / Millionaire source map in `research/multiplication-mechanisms.md`.
- [x] Extend the multiplication comparison so it contrasts **operator-supplied repetition** with **mechanically encoded multiplication-table selection**.
- [x] Add a minimal key-driven computation model after `research/key-driven-computation.md`, without attempting a full Comptometer emulator.
- [x] Write `research/subtraction-and-division.md`: complements, reverse crank/mode changes, repeated subtraction, carriage/revolution-counter workflow, and machine-specific uncertainty.
- [x] Write `research/simulator-matrix.md` for Difference Engine, Analytical Engine, Curta, stepped-drum/pinwheel calculators, and strong online reconstructions.
- [x] Expand `research/curta-source-map.md` from a pointer list into model/revision + manual/patent/page-level provenance.
- [x] Expand `research/analytical-engine-information-flow.md` with historical publication/drawing anchors, explicit Walker emulator provenance, and a tested P/M Store/Mill trace.
- [x] Strengthen `research/differential-analyzer.md`, harden the continuous integrator/flow replay model, and add the evidence-aware workbench.
- [x] Add a tested generic setting–crank interlock lesson and harden Curta provenance.
- [x] Re-run typecheck/tests/build for the control/interlock code change and update `docs/VERIFICATION.md`.
- [x] Add `docs/REPRESENTATION_AND_PROTOCOL.md` across the six currently supported machine/lesson families.
- [x] Ground Difference Engine provenance/output contracts: add the Babbage/Scheutz source map, harden difference-column replay, and connect persistent output roles to `#/finite-difference` without claiming printer geometry.
- [x] Deepen subtraction/control provenance: separate Thomas, Odhner, Felt/Tarrant, and Pascaline source roles; add typed evidence profiles and the controls comparison without generalizing across families.
- [x] Deepen output/audit-trail comparison beyond Difference Engines with identified register/printing objects, primary subtotal/total semantics, a tested persistent ledger, and a public comparison route.
- [x] Ground carry architecture provenance with Pascal/Felt/Model A source separation, hardened key-driven replay, and a public visible-carry comparison.
- [x] Ground Odhner-family rotary carry scheduling/reliability with three separated patents, a fail-closed ordinal scheduler, and a public comparison.
- [x] Ground Thomas stepped-drum carry evolution with 1820/1865/1880 revision boundaries and a cross-family public comparison.
- [x] Map source-separated mechanical error-control responsibilities across Thomas, Odhner/Talamini, and Bush frontlash evidence.
- [x] Compare human versus machine arithmetic responsibilities using counts derived from existing multiplication, key-driven, division, and persistent-output traces.
- [x] Add a named-machine source atlas for directly inspected Difference Engine No. 2 and Bush Differential Analyzer records, preserving supports/not-established boundaries.
- [x] Extend the source atlas with directly inspected Curta patent/manual and Analytical Engine facsimile/drawing anchors while preserving production, transcription, reconstruction, and P/M boundaries.
- [x] Deepen Difference Engine No. 2 and Differential Analyzer publication precision with the 2020 R/E2 technical description, BAB/B/001 H/E1 record, and Bush–Caldwell 1931 application facsimile while preserving inaccessible Bush/Shannon and generation boundaries.
- [x] Retry canonical Bush 1931 and Shannon 1941 full-text access and encode their still-blocked construction/theory roles separately without fabricated content-page claims.
- [x] Integrate PR #11 fixture-derived Analytical Engine replay atop action-bound direct multiplication and add bounded Type II BOM/drawing sheet identity.
- [x] Harden operator-division quotient-nine/exact-zero causality and replay, then separate Curta facsimile controls from E3 division transcription without back-filling named-machine states.
- [x] Ground Controlled-key incomplete-stroke responsibility in Turck 1921 and add a tested generic exactly-once key-stroke integrity/interlock lesson.
- [x] Directly inspect the exposed Thomas 1868 register legend and add a tested generic independent result/revolution-register lifecycle lesson.
- [x] Harden decimal/integrator replay against serialized provenance tampering and inspect Curta Type II service controls at exact page/leaf precision.
- [x] Reconcile the H. P. Babbage 1888 reading, 1889 chapter range, modern reproduction metadata, E3 transcription content, and unavailable drawing-catalogue cross-walk without fabricating page claims.
- [x] Directly anchor the Smithsonian 1853 Scheutz engine, ca.1857 operational drawing set, and Merzbach/patent provenance while preserving the 2214/2216 conflict and P/M boundary.
- [x] Independently confirm Scheutz patent No. 2216 in an 1855 patent list and add the Royal Society pp. 499–509 examination layer without erasing the Smithsonian 2214 discrepancy.
- [x] Bind shared decimal-register replay to its recorded action, complete crank/carry trace, warning/error outputs, and lossless enumerable shape.

## Repository maintenance

- [ ] Keep README / ROADMAP / STATUS synchronized when a mechanism becomes genuinely implemented or a historical claim becomes source-backed.
- [x] Verify GitHub Project Pages deployment and record the live URL; continue checking each newer deployment before claiming it live.

## Guardrails

- Core state remains the source of truth; animation consumes phases/events.
- Do not start 3D/physics work before a mechanism has a tested discrete or explicitly continuous model.
- Do not rewrite a mature whole-machine emulator without a mechanism-level explanatory increment.
- Do not treat a patent as proof that a feature was manufactured exactly as drawn; distinguish intended design, surviving artifact, reconstruction, and teaching model.
- Do not call a mathematical fact “historical evidence grade A.” Use `docs/EVIDENCE_POLICY.md`.
- Add a machine only when it introduces a new mechanism, representation, operator protocol, or evidence question.
