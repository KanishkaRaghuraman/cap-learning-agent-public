# Lesson 9 — Add a Partner Picker and Finish the Application (Node.js)

## Learner activity and example

Ask for business-partner selection in the incident editor. You can try a search and inspect how selection changes the incident.

**For example:**
> Add the course business-partner value help and verify selection, saving and discarding an edit.

Apply `course/docs/LEARNER-PROMPTS.md` to **every** subsequent prompt instruction in this lesson, including follow-ups and recovery. The technical recipes below guide implementation; present each learner task with its own brief explanation and example rather than copying the recipe verbatim.

> **Internal one-chat pacing (do not read source labels aloud):** Follow AGENTS.md and course/BUILDER.md. Full path uses this canonical lesson; short path reuses canonical10/11/12 as display1/2/3. Its setup uses prerequisites and the bundled starter per course/docs/SHORT-STARTER.md, never lesson replay. Explain each learner-authored activity with a concise **For example:** prompt; routine setup, terminal startup and preview instructions need no copied prompt; implement the learner’s request, verify and explain actual results. The recipes below are internal guidance.

## Step 9.1 — Select a partner by name

### [TEACH]

“A value help lets someone choose a partner by a readable name or identifier while the application stores its UUID. We will connect that picker to the local synthetic partner lookup. The imported SAP API contract remains separate.”

Ask the course agent for this activity; adapt the example to what you want to explore.

**For example:**
> Add the course business-partner value help and verify selection, saving and discarding an edit.

### Internal implementation recipe — not a learner prompt

Add or finish the Business Partner value help on the incident Object Page using official CAP/Fiori MCP guidance. Preserve a correct existing ValueList mapping and add a missing editable form field if necessary. Display readable businessPartnerId and name, but map the selected partner UUID ID to businessPartner_ID. Verify search/selection, draft save and the persisted association automatically using a disposable synthetic incident. Use the UI Create flow for that disposable incident; do not enter Edit on an existing seeded incident for this test. Save through the UI, independently read back that same created record, then delete only your disposable record and verify cleanup. Preserve criticality, conversation navigation and all existing rules. Return the working preview and evidence; do not configure a live SAP system.

For browser navigation checks, click the actual visible row/navigation control and verify the destination, then check conversation navigation where available. A deep link or programmatic router call may help diagnose a failure but cannot count as a passing click-flow test.

For any change to an existing or just-generated Fiori app, first call list_functionality, then get_functionality_details for the relevant operation, then execute_functionality. A just-generated app is now an existing app. Only use a minimal direct annotation edit when live functionality discovery proves no suitable operation and official guidance supports the edit; record that evidence.

Apply shared grounding, ownership and evidence safeguards in course/BUILDER.md.

### [CHECK]

Implement the bounded learner request in this course chat. No reportback or copied logs. Explain actual results before the next checkpoint.

## Step 9.2 — Internal implementation and verification

Inspect actual model, annotation file and generated form before changing anything. The generator may already have `Common.ValueList` but no visible field; do not duplicate the mapping. Map UUID `ID` ↔ `businessPartner_ID`, with readable identifier/name as display values. Use live official documentation and the existing-app Fiori protocol. No supported operation is a capability gap requiring a minimal documented correction; disconnected tools do not authorize one.

For this managed association, attach display-text annotations to the CDS association `businessPartner` (for example `Common.Text: businessPartner.name`); CAP propagates them to the generated OData foreign key. Do not annotate a generated `businessPartner_ID` as if it were a declared source element. Keep the ValueList mapping to the actual UUID field and verify the compiled metadata. A compiler warning that an annotation target was not found requires correction even if the build exits successfully. Consult the connected CAP documentation for the current syntax before applying this reference.

Verify synthetic partner data in `test/data/` and the actual running service. Use the actual frontend URL and process configuration from lesson 7. Check metadata, lookup response and a fresh form; do not rely on personal table settings. Browser-test searching a known fictional identifier, selecting a partner, entering valid title/urgency/status, activating the draft and reopening. Read actual enum values before creating any test record: in the unchanged course model, `new_` includes the underscore; neither `open` nor `new` is a valid status. Do not invent a display-to-storage mapping. Perform the browser save and independent API readback on the same disposable record, so an API-only save cannot substitute for the UI check. Independently read back the active `businessPartner_ID` and expanded partner; it must be the selected UUID. A visible annotation or an assigned draft value alone does not prove successful save. Use a disposable local record and preserve existing seed data.

If a save fails, inspect the actual validation error and draft data; do not misdiagnose a mistyped enum as a broken lookup. Agent fixes the observed cause within scope and reruns the affected check. Learner exploration is optional; required technical UI evidence must be obtained or honestly recorded as unavailable, without forcing a transcription exercise.

## Step 9.3 — Review the prepared application

### [TEACH]

Summarize the application now built through prompts: model, service, fixtures, business rules and annotated UI. Verify the recap against the current schema and service. In the unchanged course model, the picker reads the local `incident.mgmt.BusinessPartners` entity projected by `IncidentsService`; it is not an external entity backed by the imported SAP API contract. The imported Business Partner metadata is separate and does not supply these synthetic rows. Offer the preview link. Explain in one sentence that live S/4HANA use would additionally need an authorized system, authentication/destination, key mapping, request delegation and integration tests; this picker uses local data. No claim of production readiness or fixed file count.

## [SAVE PROGRESS] Course checkpoint

Inspect supporting files/results directly. Missing checks remain pending; repair within scope and never invent completion. Explain the actual outcome briefly.

Save and read back `memory-bank/activeContext.md` then `memory-bank/progress.md` under the root contract, preserving runtime/platform, actual paths, current step, next action and pending technical checks. The same course agent saves state after evidence review. Foundation preparation grants no studied-lesson credit. Skipped optional exploration/questions do not create pending checks. A required unavailable tool or failed functional check does. Summarize the concept and actual result in a few sentences, then stop.

When the full foundation checks pass, preserve studied progress and introduce canonical10. The short route uses its separate foundation receipt, never executes this lesson as a preparation phase. No pending prerequisite may be hidden.

## For more detail

- [Official reference 1](https://cap.cloud.sap/docs/guides/uis/fiori#cdsodatavaluelist)

These links are reference entry points, not evidence that a live lookup or learner test succeeded.

For learner preview and exploration, use business-partner names and incident titles. Keep UUIDs in technical mappings and automated checks, not as something the learner must copy. If several incidents match a partner, ask which title they mean.
