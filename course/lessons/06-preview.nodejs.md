# Lesson 6 — Run the App and Check Its Rules (Node.js)

## Learner activity and example

Ask the agent to run the app and check its service behavior. You can explore the preview or ask what a response means.

**For example:**
> Run the Incident Management app, verify its service behavior and show me the working preview.

Apply `course/docs/LEARNER-PROMPTS.md` to **every** subsequent prompt instruction in this lesson, including follow-ups and recovery. The technical recipes below guide implementation; present each learner task with its own brief explanation and example rather than copying the recipe verbatim.

> **Internal one-chat pacing (do not read source labels aloud):** Follow AGENTS.md and course/BUILDER.md. Full path uses this canonical lesson; short path reuses canonical10/11/12 as display1/2/3. Its setup uses prerequisites and the bundled starter per course/docs/SHORT-STARTER.md, never lesson replay. Explain each learner-authored activity with a concise **For example:** prompt; routine setup, terminal startup and preview instructions need no copied prompt; implement the learner’s request, verify and explain actual results. The recipes below are internal guidance.

## Step 6.1 — Run and verify the application

### [TEACH]

“Starting CAP turns the service model into a running API. Its OData metadata describes the exposed entities, fields and operations, and requests return or change actual records. We’ll check that the service returns the sample data and applies our business rules. A successful startup alone does not prove those rules work.”

Ask the course agent for this activity; adapt the example to what you want to explore.

**For example:**
> Run the Incident Management app, verify its service behavior and show me the working preview.

### Internal implementation recipe — not a learner prompt

Start or reuse the existing IncidentManagement application for my runtime and discover its actual service address. Run every pending lesson-5 behaviour case plus invalid-enum and read-only partner checks using disposable local records. Preserve original fixtures, capture independent readback and clean up test drafts/records safely. Check all three entity reads against the sample data. Diagnose and fix scoped failures using MCP guidance; do not disable rules, draft support or authentication. Return the working preview link if one exists and concise observed results.

Run the existing course-root course/scripts/verify-foundation.mjs against the observed local service with --stage core and save its JSON report under memory-bank/receipts/. Require exit0 and a passing report; it uses only its own disposable test records and verifies their removal. A successful draft creation is not an activated business-rule test, and an unchecked DELETE response is not cleanup proof.

Apply shared grounding, ownership and evidence safeguards in course/BUILDER.md.

### [CHECK]

Implement the bounded learner request in this course chat. No reportback or copied logs. Explain actual results before the next checkpoint.

## Step 6.2 — Builder verification matrix

Inspect existing process ownership before starting/restarting; do not kill a process merely because its port is occupied. Reuse the lesson's actual runtime commands and metadata. For Node.js, use the verified `cds watch` or existing project script. Confirm SQLite initialization, `test/data/` loading and handler registration.

Run the full matrix in lesson 5. Additionally send invalid urgency and status values, verify their documented validation rejection and a valid control; verify partner reads succeed while create/update/delete through the read-only lookup fail. Confirm active and draft semantics from actual metadata. Record request/status/body and independent readback. Test data writes are part of this scoped build prompt; use disposable records and do not make the learner run each request manually. A missing test capability remains NOT RUN and blocks that technical checkpoint.

Keep source data intact. Resolve any reported failure at its actual layer, preserving the exact error in the evidence record. Do not conflate HTTP success with UI rendering or service startup with a successful application request.

## Step 6.3 — Explain the result and offer the preview

### [TEACH]

Show the concise actual outcome and the real application URL. Explain one accepted change and one rejected closed-incident change yourself. Say “You can explore the data in the preview app”; do not demand screenshots, IDs, counts, predictions or explanations as a completion gate.

The basic Fiori preview is optional if this runtime exposes one; do not invent a link. The agent can inspect it when available, but lesson 7 creates the real UI. Leave an owned server running for the next lesson unless the learner requests stopping or a technical change requires restart; record its command/address instead of asking repeatedly to stop/start it.

## [SAVE PROGRESS] Course checkpoint

Inspect supporting files/results directly. Missing checks remain pending; repair within scope and never invent completion. Explain the actual outcome briefly.

Save and read back `memory-bank/activeContext.md` then `memory-bank/progress.md` under the root contract, preserving runtime/platform, actual paths, current step, next action and pending technical checks. The same course agent saves state after evidence review. Foundation preparation grants no studied-lesson credit. Skipped optional exploration/questions do not create pending checks. A required unavailable tool or failed functional check does. Summarize the concept and actual result in a few sentences, then stop.

Complete lessons 5 and 6 only when all pending behaviour/constraint checks pass. Clear only resolved technical checks. A skipped learner preview or question is not a blocker; an actual failed runtime test is.

At a verified checkpoint invite the next bounded activity.

**For example:**
> Continue to the next step.

## For more detail

- [Official reference 1](https://cap.cloud.sap/docs/guides/databases/sqlite#manual-setup-for-nodejs)
- [Official reference 2](https://cap.cloud.sap/docs/guides/databases/sqlite#in-cap-nodejs-projects)

These links are reference entry points, not evidence that a live lookup or learner test succeeded.

For learner preview and exploration, use business-partner names and incident titles. Keep UUIDs in technical mappings and automated checks, not as something the learner must copy. If several incidents match a partner, ask which title they mean.
