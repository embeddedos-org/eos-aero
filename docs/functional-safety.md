# Functional safety — knowledge-base seed

> Status: seed document. eos-aero has no safety case yet; this doc fixes the
> vocabulary and the shape of the work so hazard analysis, requirements, and
> verification grow in the right directions from day one.

## Why this exists

AeroSwift (personal / transit) will eventually need to argue — to
regulators, to partners, to itself — that the system is acceptably safe.
That argument is the **safety case**: a structured claim ("the system meets
its safety objectives") supported by evidence (hazards analyzed,
requirements traced, tests run). Starting the structure now is cheap;
retrofitting it later is not.

Relevant frameworks (pick per vehicle class; do not blend casually):

| Framework | Domain | What it demands |
|---|---|---|
| DO-178C / ARP4754A | Airborne software/systems | DAL-leveled objectives, traceability, coverage |
| ISO 26262 | Road vehicles | ASIL decomposition, safety analyses |
| UL 4600 | Autonomous systems | Safety case as the primary artifact |
| EU CRA | All connected products | Vulnerability handling, SBOMs (see org CVD policy) |

## Hazard analysis outline

1. **System definition** — boundaries, interfaces, operating modes,
   degraded modes. (AeroSwift vs AeroSwift-Personal vs -Transit differ here.)
2. **Hazard identification** — structured brainstorming (HAZOP guidewords:
   no / more / less / reverse / late) over each function.
3. **Risk assessment** — severity × likelihood; assign integrity levels.
4. **Safety requirements** — each hazard gets mitigations, each mitigation
   becomes a requirement with an ID.
5. **Verification** — each safety requirement gets a verification method
   (test, analysis, inspection, review) and evidence.

Hazard log format (seed; grow into `docs/safety/hazard-log.md`):

| ID | Hazard | Cause | Severity | Mitigation (req IDs) | Verification |
|---|---|---|---|---|---|
| H-001 | Uncommanded actuation | … | … | SR-…, SR-… | Test …, analysis … |

## Requirements traceability

Every safety requirement traces both ways:

```
Stakeholder need → System requirement (SR-xxx) → Software requirement (SWR-xxx)
    → Design element → Test case → Test result
```

Rules:

- IDs are immutable once assigned. Never reuse a retired ID.
- A requirement without a verification method is a wish, not a requirement.
- Traceability lives in one place (start: a markdown table; graduate to a
  real RM tool when the count exceeds ~200).

## HIL-via-EoSim story

Hardware-in-the-loop testing for AeroSwift does not require hardware on day
one. EoSim (the org's simulator, with an MCP server for agent-driven runs)
is the HIL stand-in:

1. **Model the vehicle** — EoSim platform descriptors for the AeroSwift
   compute + sensor/actuator set.
2. **Fault injection** — EoSim drives sensor faults, actuator stuck-ats, and
   comms dropouts; the safety requirements' fault-handling gets exercised
   deterministically and repeatably.
3. **Trace to hazards** — each fault-injection scenario maps to a hazard-log
   entry; the test report *is* safety evidence.
4. **Graduate to hardware** — when real HIL rigs exist, the same scenarios
   run against them; EoSim results become the regression baseline.

This gives the safety case executable evidence before the first airframe.

## Zephyr Summit, Oct 7–9 (Prague) — why it matters here

The summit's safety/CRA track is directly relevant:

- **Safety track** — how Zephyr-based projects structure safety cases and
  what assessors actually ask for. eos-aero should borrow the patterns,
  not invent its own.
- **CRA track** — the Cyber Resilience Act's reporting timelines are in
  force; the org's CVD policy (eSec) already aligns, but aerospace products
  face additional scrutiny — worth hearing how others operationalize it.
- **Networking** — safety assessors and RTOS safety leads in one place;
  the cheapest possible review of this seed document's direction.

Action: attend (or review published talks after) with the question "what
would an assessor flag in our hazard-log format?" and fold the answer back
into this doc.

## What is explicitly not claimed

This doc creates no certification, no DAL/ASIL assignment, and no safety
argument. It is the scaffolding the argument will hang on. Any claim of the
form "eos-aero is safe" remains false until the hazard log, requirements,
and evidence exist.


## ZDS 2026 Day 1 digest (2026-10-07)

Zephyr Developer Summit 2026 (Prague, Oct 7–9) opened today with 40+
sessions and 45+ speakers across functional safety, CRA readiness, and
automotive/space/industrial tracks.

- **First-ever Zephyr Community Awards** were announced today. Follow-up
  item for tomorrow: record the winners here once published — award
  categories signal what the community (and its commercial users) value most.
- **Space Cubics** joined as a new Silver member — a commercial-space RTOS
  demand signal worth watching; real flight heritage moves Zephyr (and eos)
  from lab to launch.
- **80-TOPS local inference is desktop commodity**: ASUS's Ascent QN10
  (and the Dimensity-9600-class dual-NPU phones landing this quarter) mean
  on-device inference is the expected baseline, not an exotic option.
  `docs/silicon-targets.md` should frame it that way: aero silicon targets
  are chosen assuming local inference exists, and the safety story covers it.

Sessions mined today skew heavily to functional-safety evidence formats —
hazard logs, requirements traceability, and what assessors actually flag.
That feeds directly back into this doc's scaffolding: the hazard-log format
question ("what would an assessor flag?") remains the open item.

## ZDS 2026 Day 2 digest (2026-10-08)

Day 2 centered on functional safety and CRA readiness -- the two tracks
this doc exists for.

- **Functional-safety evidence formats** dominated: hazard logs,
  requirements traceability, and assessor-flagged gaps. The takeaway for
  this doc's scaffolding: an assessor wants the hazard log to show not
  just identified hazards but the *reasoning that closed each one* --
  the "why this is safe" column, not just the "what could go wrong"
  column.
- **CRA readiness** sessions framed the 24h/72h/14d reporting duties
  (live since 11 Sept 2026) for embedded products. Aerospace is in
  scope; the eSec CRA incident-reporting runbook is the org's answer,
  and this doc should cross-reference it rather than duplicate it.
- **Dual-brain safety pattern**: the Bluemag Pi (SiFive E3+E2, added to
  `docs/silicon-targets.md` today) is the industry's current answer to
  "where does the AI live in a safety-critical system" -- flight-critical
  control on one core, AI/system tasks on the other, with a hard
  boundary. That boundary is the safety case's best friend: the AI
  core's failures are contained by architecture, not by testing.
