# Repository Guidance for Agents

## Scope and architecture

eos-aero contains three related AeroSwift design surfaces: the consolidated
`AeroSwift/` platform, the `AeroSwift-Personal/` AS-1/2 design, and the
`AeroSwift-Transit/` AS-10 design. Each includes some combination of hardware
BOM and PCB stack-up data, flight or energy-management firmware, control
software, design specifications, regulatory material, and academic drafts.
Treat the three trees as distinct sources unless a task explicitly requires a
coordinated update.

Within a vehicle tree, keep hardware, firmware, software, and documentation
contracts aligned. Flight-computer, energy, propulsion, redundancy, telemetry,
and vehicle specifications are safety-relevant. Follow the specialist role
briefs in [`.ai/`](./.ai/) and the handoff protocol in [`HANDOFF.md`](./HANDOFF.md).
The implementer must not act as the approving reviewer.

## Validation

The repository has no root build or test command. Do not invent one or report a
whole-repository pass.

- For `AeroSwift/software/web_app/`, use the scripts declared in its
  `package.json`; `pnpm check` type-checks and `pnpm build` builds that surface.
- The `AeroSwift/README.md` documents `pnpm install` and `pnpm dev` for the web
  dashboard and `pnpm install` plus `npx expo start` for its mobile app. Use
  those only when the affected application and required runtime are available.
- No automated validation command is checked in for the BOM, PCB stack-up,
  firmware, or aircraft-design files. Review those changes against the nearest
  README, BOM, stack-up note, source file, and regulatory documentation, and
  state which specialist tools or physical tests were not run.
- Documentation-only governance changes do not validate flight behavior,
  airworthiness, redundancy, energy performance, or certification readiness.

## Hardware and safety discipline

Preserve units, part identifiers, channel counts, voltage and power limits,
layer-stack assumptions, and Personal-versus-Transit distinctions. Do not copy
specifications between variants without source evidence. Never weaken fault
handling or describe planned or design-phase controls as implemented, tested,
certified, or production-ready.

Do not commit generated build output, dependency directories, credentials,
signing material, flight logs containing sensitive data, or proprietary source
material unless the repository already tracks that exact artifact and the task
requires it. Keep regulatory and academic assertions traceable to checked-in
evidence.

Every human-authored pull request must use a GitHub-recognized closing keyword
for an issue in this repository, for example `Fixes #123`. Cross-repository
issues and plain issue mentions do not satisfy the linked-issue policy. Follow
[`.github/PULL_REQUEST_TEMPLATE.md`](./.github/PULL_REQUEST_TEMPLATE.md), and
keep the published Wiki snapshot in [`docs/wiki/`](./docs/wiki/) synchronized
when Wiki content changes.
