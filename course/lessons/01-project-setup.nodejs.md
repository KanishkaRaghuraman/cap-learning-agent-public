# Lesson 1 — Scaffold the Application (Node.js)

## Learner activity and example

Ask the agent to create the initial CAP project for your selected runtime. You can ask it to explain the generated folders.

**For example:**
> Create the Incident Management CAP project for my selected runtime and explain the purpose of its main folders.

Apply `course/docs/LEARNER-PROMPTS.md` to **every** subsequent prompt instruction in this lesson, including follow-ups and recovery. The technical recipes below guide implementation; present each learner task with its own brief explanation and example rather than copying the recipe verbatim.

> **Internal one-chat pacing (do not read source labels aloud):** Follow AGENTS.md and course/BUILDER.md. Full path uses this canonical lesson; short path reuses canonical10/11/12 as display1/2/3. Its setup uses prerequisites and the bundled starter per course/docs/SHORT-STARTER.md, never lesson replay. Explain each learner-authored activity with a concise **For example:** prompt; routine setup, terminal startup and preview instructions need no copied prompt; implement the learner’s request, verify and explain actual results. The recipes below are internal guidance.

## Step 1.1 — Understand the starting point

### [TEACH]

“A CAP project separates the data model in `db`, services and business logic in `srv`, and the UI in `app`. The model describes the application rather than spelling out every database or HTTP operation. We’ll create the project for your chosen runtime; the business model and UI will come in later lessons.”

Ask the course agent for this activity; adapt the example to what you want to explore.

**For example:**
> Create the Incident Management CAP project for my selected runtime and explain the purpose of its main folders.

### Internal implementation recipe — not a learner prompt

Create IncidentManagement as a CAP Node.js project using the explicit Node.js scaffold. Preserve any existing project. Inspect package.json and ensure the SQLite development adapter is actually installed and compatible, not merely declared. Start the empty development watcher and record its actual result. Do not add the incident model or a sample app yet.

Apply shared grounding, ownership and evidence safeguards in course/BUILDER.md.

### [CHECK]

Implement the bounded learner request in this course chat. No reportback or copied logs. Explain actual results before the next checkpoint.

## Step 1.2 — Internal implementation and checks

The agent works in the actual course root for scaffolding and in `IncidentManagement/` for application commands. Resolve current compatible stable packages through live sources for fresh dependencies; preserve the accepted existing toolchain and lockfile. Do not create a second app if resuming.

Use grounded `cds init IncidentManagement --nodejs`, then inspect `package.json`, `app/`, `db/`, `srv/` and installed dependency resolution. Bare `cds init` may create a minimal scaffold; if an existing project lacks the Node facet, repair only that missing documented facet without replacing files. Confirm `@cap-js/sqlite` compatibility and installation. An empty `cds watch` can correctly report no model and wait without opening HTTP. Record that state without diagnosing a missing service as failure. HTTP verification becomes required once a service exists.

Stop only a smoke process the agent started, and preserve other running work. Report the generated structure and actual checks without copying a long terminal log into the teaching chat.

## Step 1.3 — Review the result

### [TEACH]

Point to the actual model/service/UI folders and runtime manifest in the agent's output. Explain that this is a scaffold, not a business application yet. The learner may browse those files in their **code editor**; no directory-listing answer or manual command is required.

## [SAVE PROGRESS] Course checkpoint

Inspect supporting files/results directly. Missing checks remain pending; repair within scope and never invent completion. Explain the actual outcome briefly.

Save and read back `memory-bank/activeContext.md` then `memory-bank/progress.md` under the root contract, preserving runtime/platform, actual paths, current step, next action and pending technical checks. The same course agent saves state after evidence review. Foundation preparation grants no studied-lesson credit. Skipped optional exploration/questions do not create pending checks. A required unavailable tool or failed functional check does. Summarize the concept and actual result in a few sentences, then stop.

At a verified checkpoint invite the next bounded activity.

**For example:**
> Continue to the next step.

## For more detail

- [Official reference 1](https://cap.cloud.sap/docs/guides/databases/sqlite#manual-setup-for-nodejs)
- [Official reference 2](https://cap.cloud.sap/docs/guides/databases/sqlite#in-cap-nodejs-projects)
- [Official reference 3](https://cap.cloud.sap/docs/tools/cds-cli#cds-init)

These links are reference entry points, not evidence that a live lookup or learner test succeeded.
