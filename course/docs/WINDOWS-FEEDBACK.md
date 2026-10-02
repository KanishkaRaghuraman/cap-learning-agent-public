> Current scope (2026-10-01): final lesson12 / Explore3 is required native application MCP practice in both runtimes. Only the API-key-enabled Fiori continuation is optional. Dated results below remain historical and do not verify the revised learner conversation.

> Historical revision notice (2026-09-30, superseded by the scope above): single-chat flow and embedded-agent elective require new user-led learner-flow testing. Results below describe their dated scenarios, not acceptance of the new flow.

# Windows feedback validation — 2026-09-26

The course was revised against a learner's Windows transcripts and feedback. This is a scoped regression report, not a guarantee about every model or a fresh replay of every lesson in a native editor.

## Changes

- Teacher explains; a bounded builder prompt implements and verifies. Two chats share the course directory; only teacher writes progress and only builder edits the app. Single-chat assistance remains supported.
- No mandatory quizzes, predictions, manual code entry or copying UUIDs/logs. Optional reflection can be skipped; technical failures cannot be marked passed.
- Lesson0 performs routine setup, checks current stable compatible tool versions, preserves existing settings and asks only for genuine decisions/trust/sign-in.
- Import-only model discovery is treated as an early project phase, not automatically as a failed server. Existing-model compilation failures still require repair.
- Fiori generation includes completing required sections, installing declared dependencies and verifying the generated UI in the same task. Incident headers show titles.
- Windows launcher resolves the installed official Claude package's executable instead of attempting to execute its PowerShell/npm shim.
- UI5 MCP updated to0.3.1. The existing hash-checked schema workaround is still needed and verified.
- The mutating regression verifier requires an explicit `COURSE_TARGET_ID` rather than choosing a record silently.

## Observed results

| Check | Result |
|---|---|
| Course/setup checks on macOS and native Windows | PASS,12 tests each |
| Windows setup and Claude launcher | PASS; native CLI2.1.220 invoked from npm installation |
| Windows development MCP | PASS: real CAP course/docs/model, Fiori course/docs/schema discovery, UI5 guidelines |
| Windows UI5 manifest validator | PASS: valid accepted, invalid rejected, repeat accepted |
| Existing Windows app MCP read stage | PASS,16 protocol requests; data unchanged |
| Isolated Windows action stage | PASS,28 protocol requests, confirmed synthetic target only |
| Core business rules on Windows fixture | PASS,20 HTTP requests |
| Criticality/projection/count/draft/enum checks | PASS,27 HTTP/MCP requests, including same-user/cross-user outstanding drafts |
| Windows CAP and UI5 builds | PASS; UI5 emits fallback-locale warnings |
| Windows UI5 linter | PASS, no findings |
| Browser against Windows-hosted app | PASS: columns, title header, conversation/child detail, partner picker, draft save and independent readback |
| Focused model-behaviour cases on macOS | PASS,6 Claude Sonnet4.6 trials: skip, prompt-based building, false-success refusal, builder role, exact-target boundary, newer-version policy |
| Native Windows Claude model interaction | PASS: Sonnet5 builder role, skipped question, real application MCP describe/query |
| Existing learner state | Preserved at lesson12.1; no maintainer test marks the learner's lesson complete |

Mutation tests used a separate Windows application copy and database. The actual learner app remains at its read-only extension stage. Its minimal header/label source patch was applied without changing domain records.

## Limits and remaining items

The computer-use browser ran on macOS against the Windows service through local SSH forwarding. It was not a native Windows VS Code UI test. A completely fresh0–11 course replay inside native Windows VS Code, full two-chat execution of all lessons, and all-editor/all-model coverage are NOT RUN in this revision. The Java lesson text was updated and checked structurally; Java runtime evidence remains the prior dated validation, not a new Windows Java run.

Eight reported development-dependency audit findings remain (3moderate,5high). No audit suppression, forced breaking upgrade or experimental UI5 prerelease was used. UI5 build fallback-locale warnings are nonblocking and recorded. The schema workaround is local and must be reapplied by setup after `npm ci`; it is not an upstream fix. Existing user/project configuration preferences were retained; direct process probes do not prove an already-open editor has reloaded them.

Open a new teacher chat and ask **Read AGENTS.md and resume**. Known saved revisions migrate additively with backup; questions no longer prevent continuation. Keep the repository private until licence and metadata redistribution clearance is resolved.
