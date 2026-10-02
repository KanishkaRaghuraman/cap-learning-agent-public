# Lesson 8 — Add Semantic Urgency Display (Java)

## Learner activity and example

Ask the agent to make the incident details useful through the course UI annotations. You can ask how annotations affect what appears on screen.

**For example:**
> Add the course incident details, conversation section and urgency indicators, then verify how they appear in the UI.

Apply `course/docs/LEARNER-PROMPTS.md` to **every** subsequent prompt instruction in this lesson, including follow-ups and recovery. The technical recipes below guide implementation; present each learner task with its own brief explanation and example rather than copying the recipe verbatim.

> **Internal one-chat pacing (do not read source labels aloud):** Follow AGENTS.md and course/BUILDER.md. Full path uses this canonical lesson; short path reuses canonical10/11/12 as display1/2/3. Its setup uses prerequisites and the bundled starter per course/docs/SHORT-STARTER.md, never lesson replay. Explain each learner-authored activity with a concise **For example:** prompt; routine setup, terminal startup and preview instructions need no copied prompt; implement the learner’s request, verify and explain actual results. The recipes below are internal guidance.

## Step 8.1 — Make urgency easier to recognize

### [TEACH]

“Annotations add information that Fiori elements uses to display the service data. We’ll keep urgency as business data and add a calculated display value that is returned by the service rather than stored as a new database column. Fiori uses that value to show high, medium and low urgency with error, warning and success emphasis; unknown values stay neutral.”

Ask the course agent for this activity; adapt the example to what you want to explore.

**For example:**
> Add the course incident details, conversation section and urgency indicators, then verify how they appear in the UI.

### Internal implementation recipe — not a learner prompt

Add urgency criticality to the existing incident list and detail page, preserving all existing rules. Use a virtual integer field on the service projection, runtime-specific read enrichment and the official Fiori annotation workflow. Map high to1, medium to2, low to3, missing/unknown to0; retain readable urgency text. Preserve selected fields, filters, paging, counts and active/draft reads. Use the lesson's internal reference after verifying current APIs. Build, run API regressions and inspect the UI; don't ask me to type handler code or configure personal table columns. Run the existing course-root course/scripts/verify-foundation.mjs against the observed local service with --stage full and save its JSON report under memory-bank/receipts/. This verifier exercises active/draft criticality, null fallback, selected-field boundaries, paging/counts, existing business rules and verified cleanup on its own disposable records; it does not add lesson9 UI features. Require exit0 and a passing report, then separately verify browser rendering. Do not substitute print-only curl samples, active reads labelled draft reads, or values1/2/3 labelled a fallback0 test.

For browser navigation checks, click the actual visible row/navigation control and verify the destination, then check conversation navigation where available. A deep link or programmatic router call may help diagnose a failure but cannot count as a passing click-flow test.

For any change to an existing or just-generated Fiori app, first call list_functionality, then get_functionality_details for the relevant operation, then execute_functionality. A just-generated app is now an existing app. Only use a minimal direct annotation edit when live functionality discovery proves no suitable operation and official guidance supports the edit; record that evidence.

Apply shared grounding, ownership and evidence safeguards in course/BUILDER.md.

### [CHECK]

Implement the bounded learner request in this course chat. No reportback or copied logs. Explain actual results before the next checkpoint.

## Step 8.2 — Internal implementation reference

Use CAP model/documentation MCP for the actual service field and handler APIs, and Fiori documentation MCP for criticality syntax/values. Do not narrate unrelated search results to the learner or fabricate a CAP citation for a Fiori source. Add `virtual criticality : Integer` to the existing incident service projection without losing fields or draft annotations. Confirm it appears in service metadata and is not a persisted column. Preserve lesson-5 handlers.

The following is the existing course's **internal reference**, not a manual typing exercise. Verify imports, generated types and API compatibility against the installed runtime before applying. Reuse actual bindings and avoid duplicate registration on resume.

For Java, regenerate the service accessor through the documented Maven build; never edit generated interfaces or conceal missing generation with a generic map write. Use the actual service-scoped handler and generated types.

```java
// Required imports in addition to the existing handler imports:
import java.util.ArrayList;
import com.sap.cds.ql.CQL;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.cqn.CqnSelectListItem;
import com.sap.cds.services.cds.CdsReadEventContext;
import com.sap.cds.services.handler.annotations.After;

// Methods inside the existing, correctly service-scoped handler:
@Before(event = CqnService.EVENT_READ, entity = Incidents_.CDS_NAME)
    public void includeCriticalityInput(CdsReadEventContext context) {
        List<CqnSelectListItem> items = new ArrayList<>(context.getCqn().items());
        boolean criticalityRequested = items.stream().anyMatch(item ->
                item.isRef() && "criticality".equals(item.asRef().path()));
        boolean urgencyPresent = items.stream().anyMatch(item ->
                item.isStar() || (item.isRef() && "urgency".equals(item.asRef().path())));
        if (criticalityRequested && !urgencyPresent) {
            items.add(CQL.get("urgency"));
            context.setCqn(Select.copy(context.getCqn()).columns(items));
            context.put("courseAddedUrgency", true);
        }
    }

    @After(event = CqnService.EVENT_READ, entity = Incidents_.CDS_NAME)
    public void computeCriticality(List<Incidents> incidents, CdsReadEventContext context) {
        for (Incidents incident : incidents) {
            String urgency = incident.getUrgency();
            int value = "high".equals(urgency) ? 1
                    : "medium".equals(urgency) ? 2
                    : "low".equals(urgency) ? 3 : 0;
            incident.setCriticality(value);
            if (Boolean.TRUE.equals(context.get("courseAddedUrgency"))) {
                incident.remove("urgency");
            }
        }
    }
```

For existing Fiori source changes, discover functionality/details/execute in order. If no operation covers the exact annotation, use documented minimal source correction per `course/BUILDER.md`; no guessed annotation and no connector bypass. Bind the real urgency field to the real criticality property on list/detail. Retain text for accessibility; theme affects the precise color appearance. No extra full-table lookup per record.

## Step 8.3 — Builder verifies; learner can explore

### [VERIFY]

Compile/build with tests enabled and inspect metadata. Verify high→1, medium→2, low→3, missing/unknown→0 (test fallback at handler level if input constraints reject invalid persistence). Test actual single/collection reads selecting only ID/criticality, with urgency also selected, and ID/title excluding criticality. The helper urgency must be removed when unrequested; neither computed field nor dependency should leak when excluded. Exercise active and draft reads, filtered/paged requests with inline count, and direct count. Preserve filters/keys/results; no fake successful responses or callback-only claim of service correctness.

Inspect list and detail rendering with browser tools and preserve existing navigation. HTTP mapping success alone does not prove the displayed semantic state. Debug service value → selected fields → metadata annotation → browser error; do not hide defects with CSS or personalization. Do not promise sort/filter support for this virtual field.

### [TEACH]

Explain the result in one chain: urgency stays in the business model, the computed number travels in the response, the annotation controls presentation. Offer the preview for optional exploration; do not request UUID/status reports or mandatory answers.

## [SAVE PROGRESS] Course checkpoint

Inspect supporting files/results directly. Missing checks remain pending; repair within scope and never invent completion. Explain the actual outcome briefly.

Save and read back `memory-bank/activeContext.md` then `memory-bank/progress.md` under the root contract, preserving runtime/platform, actual paths, current step, next action and pending technical checks. The same course agent saves state after evidence review. Foundation preparation grants no studied-lesson credit. Skipped optional exploration/questions do not create pending checks. A required unavailable tool or failed functional check does. Summarize the concept and actual result in a few sentences, then stop.

At a verified checkpoint invite the next bounded activity.

**For example:**
> Continue to the next step.

## For more detail

- [Official reference 1](https://cap.cloud.sap/docs/cds/cdl#virtual-elements)
- [Official reference 2](https://cap.cloud.sap/docs/cds/cdl#virtual-elements-in-views)
- [Official reference 3](https://cap.cloud.sap/docs/java/event-handlers/#pojoarguments)
- [Official reference 4](https://cap.cloud.sap/docs/java/working-with-cql/query-api#modify-select)
- [Official reference 5](https://cap.cloud.sap/docs/java/developing-applications/building#codegen-config)
- [Official reference 6](https://cap.cloud.sap/docs/guides/uis/fiori#fiori-annotations)

These links are reference entry points, not evidence that a live lookup or learner test succeeded.

For learner preview and exploration, use business-partner names and incident titles. Keep UUIDs in technical mappings and automated checks, not as something the learner must copy. If several incidents match a partner, ask which title they mean.
