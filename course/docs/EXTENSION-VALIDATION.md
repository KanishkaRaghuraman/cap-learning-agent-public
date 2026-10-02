> Current scope (2026-10-01): final lesson12 / Explore3 is required native application MCP practice in both runtimes. Only the API-key-enabled Fiori continuation is optional. Dated results below remain historical and do not verify the revised learner conversation.

> Historical revision notice (2026-09-30, superseded by the scope above): single-chat flow and embedded-agent elective require new user-led learner-flow testing. Results below describe their dated scenarios, not acceptance of the new flow.

# Extension validation — 2026-09-25

The three-lesson extension is implemented for the existing Node.js and Java Incident Management courses. The tested local extension flow passes. This report separates application execution, client permission behaviour and instructor behaviour; none can substitute for the others.

## Executed checks

| Check | Result | Evidence in maintainer verification/extension |
|---|---|---|
| Node and Java read-only stage | PASS: actual discovery, four-field data, no action, rejected writes | node-read-evidence.json; java-read-evidence.json |
| Node and Java action stage | PASS: permission checks, malformed/empty/missing/closed targets, independent persisted readback, unchanged unrelated rows and harmless repeats | node-action-evidence.json; java-action-evidence.json |
| Both runtime boundaries | PASS: reader/manager-only denial; another user's draft blocks even already-high incidents; discarding permits action; closed UI update still rejected | node-boundary-evidence.json; java-boundary-evidence.json |
| Existing lesson-5 rules | PASS: 20 actual regression requests per runtime | node-regression/http-results.json; java-regression/http-results.json |
| Node setup helper | PASS: exact reapplication; conflicting content/auth rejected without changes; action-to-read rollback refused | apply-test-result.txt |
| Node Fiori / MCP interaction | PASS: actual incident displayed high after action; browser edit draft blocked MCP; discard allowed action | node-ui-after-mcp.png; browser-draft-rejection-fixed.json; browser-after-discard.json |
| Java Fiori / Claude interaction | PASS: list/detail loaded, UI edit/save set urgency low; cancelled call left low; one permitted action and independent readback showed high; browser refresh agreed | java-ui-after-mcp.png; java-ui-after-mcp.txt; teaching/interactive-action-visible.json |
| Actual Claude action permission | PASS: exact action/UUID shown; selected No, readback low; fresh chat approval followed by per-call Yes, readback high. Never selected always-allow | teaching/interactive-permission-evidence.json; teaching/interactive-action-visible.json |
| Claude real read-only query | PASS: describe then query, actual two incident rows, stops at learner verification checkpoint | teaching/connected-query.jsonl |
| Claude startup through npm run learn | PASS: exact fresh welcome, Node/Java selection, no app or state created | teaching/launcher-fresh.jsonl |
| Instructor adverse cases | PASS on tested responses: off-script bulk build, missing MCP, fabricated success, missing action target, record injection, runtime preservation, final stop, legacy-state migration | teaching/*-summary.json and corresponding transcripts |
| Course integrity | PASS: six automated tests, including links, routing, checkpoint templates, real closing fences and final stop; git diff --check | npm test |
| Original clones | PASS: both original repository git status --porcelain outputs empty | maintainer completion report |

The six service suites record **138 MCP/boundary requests**. Existing lesson-5 regressions add **40 HTTP requests**. These are request counts, not a claim of 178 independent user journeys.

## Fixes found by testing

1. Node's service read did not reveal a different user's draft reliably. The handler now reads the draft identity before any mutation or already-high return; writes remain delegated to the original service. The actual browser reproduction then passed.
2. CAP Java 5.0.1 did not supply the MCP adapter. The Java recipe explicitly upgrades to 5.1.1 and adds the required Spring Security dependency. It uses the actual active entity compound key.
3. Early instructor trials offered a guessed fallback or skipped a failed check. The canonical contract now forbids both, gives a bounded troubleshooting path and is loaded explicitly by `npm run learn`. Targeted trials and the final eight-case suite were rerun.
4. Setup previously could overwrite existing customization; preflight now refuses conflicting files/authentication before writing.
5. A test previously trusted action output alone. It now checks independent stored state and unrelated rows, including after rejected calls.
6. Final lesson text incorrectly asked for next, and a README closing fence swallowed following prose. Both corrected; regression checks added.

Failed experiments remain in the private evidence directory; they are not relabelled as successful. No learner checkpoint is completed using maintainer evidence.

## Grounding and tested environment

CAP documentation was retrieved through development MCP. Hosted model retrieval rejected the scratch path; project-local stdio MCP with the actual workspace root succeeded (model-evidence.json). Recipes link Capire sources beside their APIs. Development MCP and business application MCP remain separate connections.

macOS; Node 24.19.0; Node CAP 10.1.1 and MCP adapter 1.5.0; Java CAP 5.1.1 / Spring Boot 4.1.0 / JDK 25; Claude Code 2.1.282 with its configured Sonnet 4.6. The Java Fiori preview log identified UI5 1.148.8; the attempted command-line 1.148.10 option did not establish that runtime version. Mock localhost users and synthetic records only.

## Boundaries

- No unresolved functional blocker remains in the extension scenarios above. This is extension E2E on completed sample fixtures plus focused real instructor trials, not a new uninterrupted human learner run through all lessons 0–12.
- Windows, Cursor and other client/model combinations were not rerun here. The native Claude executable is required for the launcher; do not claim arbitrary editors or npm .cmd Claude shims are verified.
- Prompt instructions reduce drift; finite tests cannot guarantee that an LLM never hallucinates or deviates. Live evidence, explicit learner checkpoints and server checks remain mandatory.
- Client permission is **not** server-enforced human approval. Production identity, cloud deployment, concurrent multi-user races and other databases are outside this exercise's validation.
- The original Java UI proxy loaded and saved without a login prompt; the protected application MCP identity was separately verified. Do not infer production UI authorization from this.
- Existing UI5 vendor console warnings and the stable development-tool dependency audit concern remain documented in VALIDATION.md/WINDOWS-TEST.md. The extension fixture used the previously tested CLI prerelease workaround; this is not evidence that the stable toolchain audit is clean. The existing UI5 MCP schema workaround remains an explicit local patch, not an upstream fix.
- Existing licence/metadata public-release clearance remains unchanged. No push or publication was made for this extension.

Run `npm test` at course root for structural regression. Runtime commands are in the two extension recipe READMEs; run mutating checks only after the learner's cancellation/confirmation demonstration and agreement. Start teaching with `npm run learn`, then `resume` or `start`; after verified lesson 9, choose `extend`.


## Windows feedback revision — 2026-09-26

The teaching contract and lessons were rewritten after actual learner feedback. Earlier strict-question trials above are historical, not the current desired pedagogy. See [Windows feedback validation](WINDOWS-FEEDBACK.md) for current fixes, executed checks and limits.
