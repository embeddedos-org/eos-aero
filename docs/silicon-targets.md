# Silicon targets — knowledge-base seed

> Status: seed document. eos-aero has no flight hardware selected; this
> doc records the silicon worth tracking for long-mission aerospace use —
> what it is, what it's qualified for, and what it would unlock — so
> board and compute choices grow from evidence, not brochures.

## Headline: AMD XQRVC1902 (space-grade Versal AI Core)

A flight-rated AI accelerator exists now — verified 2026-10-05.

- **What:** Versal AI Core adaptive SoC in an enhanced space-grade
  package (lidless organic, 2197-ball BGA), sampling with early-access
  customers.
- **Qualification:** under test toward MIL-PRF-38535 **Class Y** (the top
  spaceflight tier); flight-qualified units expected **H2 2027**.
- **Mission envelope:** package designed for missions of up to **15 years**.
- **Compatibility:** pin-compatible with the VC1902 commercial and
  defense-grade parts in the same 2197 BGA — one board design spans dev,
  defense, and flight units. This de-risks early development: prototype
  on VC1902, fly XQRVC1902.
- **Why it matters for eos-aero:** in-orbit vector/payload compute —
  on-board AI (sensor fusion, anomaly detection, autonomy) without the
  downlink bottleneck. Pairs with the Track 1 accelerator-HAL work
  (`eos` `docs/track1/accelerator-hal-profiles.md`, "large" tier).
- **Sources:** AMD newsroom (sampling announcement);
  AMD DS946 Versal ACAP overview (package/mechanical).
- **Catalog:** `eCAD-Hardware-Products` `parts/silicon/amd_xqrvc1902.json`.

## Shortlist (track, don't commit)

| Part | Role | Status | Note |
|---|---|---|---|
| AMD XQRVC1902 | In-orbit AI compute | Sampling; Class Y in progress; flight H2 2027 | Headline target above |
| TI / Infineon space-grade MCUs | Flight computer, power | Vendors are Zephyr Summit Platinum sponsors (see below) | Evaluate at the summit |

Keep this table short: a target earns a row when it has a verified
qualification path or a sampling program, not a press release.

## Zephyr Summit 2026 — session-mining plan (Oct 7–9, Prague)

The summit is two days out. Mine it for the two decisions this doc and
`docs/functional-safety.md` feed:

1. **CRA readiness** — the CRA's reporting duties are live (since
   11 Sept 2026); aerospace products are in scope. Look for sessions on
   SBOM practice, vulnerability disclosure for embedded, and ENISA
   reporting workflows. Compare against `eSec`
   `docs/cra-incident-reporting-runbook.md`.
2. **Functional safety** — Zephyr's safety story (the benchmark eos is
   measured against) and any safety-case tooling. Compare against
   `docs/functional-safety.md`.
3. **TI / Infineon Platinum presence** — both are relevant silicon
   vendors for the shortlist above; note any space-grade or
   long-lifecycle announcements.

Output: a dated summit-notes file under `docs/` within a week of the
event, with concrete follow-ups (not a trip report).
