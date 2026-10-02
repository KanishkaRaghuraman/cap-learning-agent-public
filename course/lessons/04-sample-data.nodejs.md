# Lesson 4 — Generate Synthetic Sample Data (Node.js)

## Learner activity and example

Ask for the synthetic sample data needed to explore the app. You can ask how the records relate to one another.

**For example:**
> Add the course synthetic sample data and verify the relationships between incidents, partners and messages.

Apply `course/docs/LEARNER-PROMPTS.md` to **every** subsequent prompt instruction in this lesson, including follow-ups and recovery. The technical recipes below guide implementation; present each learner task with its own brief explanation and example rather than copying the recipe verbatim.

> **Internal one-chat pacing (do not read source labels aloud):** Follow AGENTS.md and course/BUILDER.md. Full path uses this canonical lesson; short path reuses canonical10/11/12 as display1/2/3. Its setup uses prerequisites and the bundled starter per course/docs/SHORT-STARTER.md, never lesson replay. Explain each learner-authored activity with a concise **For example:** prompt; routine setup, terminal startup and preview instructions need no copied prompt; implement the learner’s request, verify and explain actual results. The recipes below are internal guidance.

## Step 4.1 — Give the app useful examples

### [TEACH]

“CAP can load CSV files as initial data for the modeled entities. Here, synthetic incidents, partners and messages let us try the service without connecting to a real business system. Their keys link the records, so those references must match. In this course’s in-memory database, a restart reloads the sample data and removes local changes.”

Ask the course agent for this activity; adapt the example to what you want to explore.

**For example:**
> Add the course synthetic sample data and verify the relationships between incidents, partners and messages.

### Internal implementation recipe — not a learner prompt

Create synthetic tutorial data in IncidentManagement/test/data/ for the actual incident model: at least 5 incidents covering all urgency/status values, at least 10 related messages and at least 3 fictional business partners. Use UUID keys/references and separate readable partner identifiers. Validate all CSV headers, values and references automatically. Preserve existing learner data; do not seed the imported external API or invent real customer data. Keep these as development fixtures; report static checks separately from the runtime loading checks in lesson 6.

Apply shared grounding, ownership and evidence safeguards in course/BUILDER.md.

### [CHECK]

Implement the bounded learner request in this course chat. No reportback or copied logs. Explain actual results before the next checkpoint.

## Step 4.2 — Internal implementation and checks

Use `search_model` for actual entity fields and live documentation for CSV naming/loading in this runtime. Create `test/data/incident.mgmt-Incidents.csv`, `incident.mgmt-ConversationMessages.csv` and `incident.mgmt-BusinessPartners.csv` with headers derived from the model. Include `high`, `medium`, `low` and `new_`, `assigned`, `closed`; include an open lower-urgency incident for the later action exercise. The partner key is UUID `ID`; incidents reference that key, not `businessPartnerId`.

Parse all files: consistent header/row widths, valid unique UUID keys, valid enum values and no orphaned message/partner references. Check for conflicting duplicate seed sources. Do not replace existing data without an actual replacement decision. These are synthetic samples, not production data.

For Node.js, `test/data/` is the course's development-data route under the documented local watcher configuration. `db/data/` is for initialization data that can be included in deployments; do not describe arbitrary CSVs as always loaded regardless of configuration. The static fixture checks pass only when actually run; loading/counts/HTTP reads remain lesson 6 checks. In-memory restart resets runtime edits to the configured fixtures.

## Step 4.3 — Review a useful dataset

### [TEACH]

Summarize the real counts and scenarios, and show one readable incident title. Explain that automated checks verified relationships. The learner can inspect the generated data; never demand manual UUID matching, row counting or a proof-of-reading answer.

## [SAVE PROGRESS] Course checkpoint

Inspect supporting files/results directly. Missing checks remain pending; repair within scope and never invent completion. Explain the actual outcome briefly.

Save and read back `memory-bank/activeContext.md` then `memory-bank/progress.md` under the root contract, preserving runtime/platform, actual paths, current step, next action and pending technical checks. The same course agent saves state after evidence review. Foundation preparation grants no studied-lesson credit. Skipped optional exploration/questions do not create pending checks. A required unavailable tool or failed functional check does. Summarize the concept and actual result in a few sentences, then stop.

At a verified checkpoint invite the next bounded activity.

**For example:**
> Continue to the next step.

## For more detail

- [Official reference 1](https://cap.cloud.sap/docs/guides/databases/initial-data#using-cds-add-data)

These links are reference entry points, not evidence that a live lookup or learner test succeeded.
