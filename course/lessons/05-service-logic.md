# Lesson 5 — Prompt for Business Rules

## Learner activity and example

Ask the agent to implement the incident business rules and explain why they belong in the service. You can ask how each rule is checked.

**For example:**
> Implement the course rules for urgent titles and closed incidents, and verify their behavior. Explain which behavior comes from CAP and which we added.

Apply `course/docs/LEARNER-PROMPTS.md` to **every** subsequent prompt instruction in this lesson, including follow-ups and recovery. The technical recipes below guide implementation; present each learner task with its own brief explanation and example rather than copying the recipe verbatim.

> **Internal one-chat pacing (do not read source labels aloud):** Follow AGENTS.md and course/BUILDER.md. Full path uses this canonical lesson; short path reuses canonical10/11/12 as display1/2/3. Its setup uses prerequisites and the bundled starter per course/docs/SHORT-STARTER.md, never lesson replay. Explain each learner-authored activity with a concise **For example:** prompt; routine setup, terminal startup and preview instructions need no copied prompt; implement the learner’s request, verify and explain actual results. The recipes below are internal guidance.

## Step 5.1 — Turn a business rule into a clear prompt

### [TEACH]

“CAP supplies standard data operations; custom event handlers add the rules specific to your application. We’ll ask the coding agent to add two rules: an incoming title containing “urgent” sets urgency to high, and an already closed incident cannot be changed. The handler must check the stored incident as well as the incoming fields, because an update may contain only the changed fields.”

Ask the course agent for this activity; adapt the example to what you want to explore.

**For example:**
> Implement the course rules for urgent titles and closed incidents, and verify their behavior. Explain which behavior comes from CAP and which we added.

### Internal implementation recipe — not a learner prompt

Add the two lesson-5 business rules to the existing incident service for my saved runtime. A supplied title containing urgent, case-insensitively, sets urgency high on active create/update; omitted title leaves urgency unchanged. Reject changes to a stored closed incident with the course's 409 conflict, including attempts to reopen it. An open incident may be closed once. Handle missing active targets as not found, not accidental upserts or crashes. Preserve draft support and normal CAP persistence. Use the lesson's runtime-specific implementation constraints, build and inspect the diff. Run the behaviour matrix if the application is available; otherwise report each pending runtime check for lesson 6. Create fresh disposable records for mutation tests; never use seeded incidents or partners as mutation targets. Record their generated IDs, independent readback and cleanup, and verify original fixture records remain unchanged. Do not implement UI criticality yet.

Apply shared grounding, ownership and evidence safeguards in course/BUILDER.md.

### [CHECK]

Implement the bounded learner request in this course chat. No reportback or copied logs. Explain actual results before the next checkpoint.

## Step 5.2 — Internal implementation contract

Use actual-model MCP evidence to find the service/entity, draft state and stored enum values. Preserve existing handlers and module style; no guessed generated Java types or duplicate handlers. Ground the selected runtime's before/on/after phases and query/error APIs through live documentation. Before validation runs before handling, after enriches the response; “after” is not a transaction-commit notification.

The urgent rule is a literal substring exercise: “not urgent” matches too. It is not a language classifier. Read stored status rather than trust omitted/new request fields. Validate the active entity so draft activation cannot bypass the closed rule. This lesson covers single-incident changes, not production authorization, bulk writes, concurrent-writer isolation, deletions or complete child-message immutability.

### Internal reference — Node.js constraints

- Inspect `IncidentManagement/package.json` before writing a handler. With `"type": "module"`, use `import cds from '@sap/cds'` and `export default`; preserve a CommonJS project’s existing style instead of changing its package type.
- Obtain the query builder explicitly with `const { SELECT } = cds.ql`. Do not destructure `SELECT` directly from `cds`: in the tested CAP 10.1.1 runtime that property is undefined, and the first update crashes even though the service class loads. [Capire API facades](https://cap.cloud.sap/docs/node.js/cds-ql#api-facades) documents the `cds.ql` export. Verify both the import and a real update; class-loading and CDS compilation do not execute the handler body.



- Register the urgency rule for active incident create/update operations, using the model’s entity definition. The following is a **partial teaching example**, not a complete service file:

```js
// Incidents is the entity definition already obtained from this service's model.
this.before(['CREATE', 'UPDATE'], Incidents, req => {
  if (typeof req.data.title === 'string' &&
      req.data.title.toLowerCase().includes('urgent')) {
    req.data.urgency = 'high'
  }
})
```

[cds-mcp: Node.js draft before UPDATE active entity draft PATCH SAVE closed status validation → documentation registers before(['CREATE','UPDATE'], entity, req => ...) on active entities]. [Source](https://cap.cloud.sap/docs/guides/uis/fiori#validation-on-active-entities).

- For the single-row update lookup, use the request’s addressed instance rather than requiring an ID in the body. `SELECT.from(req.subject)` is a documented way to read that row. Inspect the result for zero rows before reading its status. Resolve the query API import from the installed project and documentation; do not rely on an unexplained global.
- Do not use an unqualified database entity string and assume it resolves to the correct service entity. Use reflected definitions/request references.
- Reject a stored closed status with `req.reject(409, 'Cannot modify a closed incident')`. Treat a missing row as not found, not as a successful update or a JavaScript property-access crash; verify the endpoint’s actual missing-record response.
- Keep the two checks independent. Do not rely on registration order between separate before handlers.

[cds-mcp: Node.js req.subject SELECT.one req.target UPDATE request subject → SELECT.from(req.subject) targets the single addressed row; subject is not suitable for multi-row requests]. [cds-mcp: Node.js SELECT.one returns undefined no record columns req.subject → reflected entity definitions are recommended instead of repeating namespaces]. [cds-mcp: Node.js srv.after response enrichment srv.on next handlers → before handlers execute concurrently]. Sources: [request subject](https://cap.cloud.sap/docs/node.js/events#-subject), [reflected definitions](https://cap.cloud.sap/docs/node.js/cds-ql#using-reflected-definitions), [processing phases](https://cap.cloud.sap/docs/node.js/core-services#srv-handle-event).

**Java implementation constraints:**

- Use the actual generated accessor and reference interfaces. Never guess their package or ID getter spelling, and never edit generated classes.
- Register with `@Before` and `CqnService.EVENT_CREATE` / `CqnService.EVENT_UPDATE`. Do not invent event constants on the context interfaces.
- Typed entity data arguments provide the incoming data in the before phase. Null-check title and use a case conversion independent of the machine’s locale. Preserve fields omitted by a partial update.
- For stored-state lookup, use the request’s entity reference rather than assuming that the incoming data contains its key. A typed entity reference argument can be used with `Select.from(ref)`. Confirm the active-entity query and persistence service usage against the learner’s installed SDK and draft model.
- Read the optional first result and handle missing values explicitly. Do not call `single()` without understanding its missing-record behaviour. The exception could otherwise become an internal error. Return a documented not-found response for no active row and verify it.
- Reject a stored closed status with `new ServiceException(ErrorStatuses.CONFLICT, "Cannot modify a closed incident")`. Verify its HTTP 409 response rather than merely checking the exception name.
- Compile the implementation using the project’s documented build command before proceeding; a source file that looks right is not evidence of compatible imports or generated types.

[cds-mcp: Java event handlers EventHandler Component ServiceName entity data arguments Before modifications → typed list/accessor arguments can infer entity registration and obtain incoming data during Before]. [cds-mcp: Java CqnAnalyzer targetKeys update context getCqn keys → entity-reference arguments reflect the current CQN reference and can be used in Select.from(ref)]. [cds-mcp: Java Result first optional single EmptyResultException → first returns Optional; single needs appropriate missing-row error handling]. Sources: [entity data](https://cap.cloud.sap/docs/java/event-handlers/#pojoarguments), [entity reference](https://cap.cloud.sap/docs/java/event-handlers/#entity-reference-arguments), [result handling](https://cap.cloud.sap/docs/java/working-with-cql/query-execution#result).


## Step 5.3 — Verify the actual behaviour

The agent runs syntax/build checks and the following runtime matrix when a server is available. Use disposable synthetic records, preserve seed data, discover real endpoints/draft operations and inspect response plus independent readback. No learner prediction or typed implementation is required.

| Case | Required evidence |
|---|---|
| Urgent create | Supplied lower urgency becomes high |
| Ordinary create | Chosen urgency remains |
| Urgent title update | Active title changes and urgency becomes high |
| Partial update without title | Omitted title and unrelated fields preserved |
| Close once | Open incident becomes closed |
| Closed title update | 409; stored title unchanged |
| Reopen closed incident | 409; remains closed |
| Missing active target | Not found; no upsert or handler crash |
| Save closed incident's draft | Conflict; active record unchanged |

A draft can be edited before active Save rejects it. Record an earlier draft error separately. If the server is not available yet, save implementation/build evidence and keep each runtime case pending for lesson 6. Never call writing the handler a passed behaviour test. If a case fails, agent diagnoses the stored-state/registration/draft boundary, applies the smallest grounded fix and reruns affected cases without removing the rule.

### [TEACH]

Explain the actual diff in two parts: incoming-title adjustment and stored-state protection. Briefly state observed checks or pending runtime checks. No quiz stands between a technically verified result and progress.

## [SAVE PROGRESS] Course checkpoint

Inspect supporting files/results directly. Missing checks remain pending; repair within scope and never invent completion. Explain the actual outcome briefly.

Save and read back `memory-bank/activeContext.md` then `memory-bank/progress.md` under the root contract, preserving runtime/platform, actual paths, current step, next action and pending technical checks. The same course agent saves state after evidence review. Foundation preparation grants no studied-lesson credit. Skipped optional exploration/questions do not create pending checks. A required unavailable tool or failed functional check does. Summarize the concept and actual result in a few sentences, then stop.

The documented lesson-5 exception permits proceeding to lesson 6 with implementation verified and runtime checks explicitly pending. Keep lesson 5 provisional until they pass; a build failure does not qualify for this exception.

At a verified checkpoint invite the next bounded activity.

**For example:**
> Continue to the next step.

## For more detail

- [Official reference 1](https://cap.cloud.sap/docs/node.js/core-services#srv-before-request)
- [Official reference 2](https://cap.cloud.sap/docs/node.js/core-services#srv-on-request)
- [Official reference 3](https://cap.cloud.sap/docs/node.js/core-services#srv-after-request)
- [Official reference 4](https://cap.cloud.sap/docs/guides/services/custom-code#custom-service-providers)
- [Official reference 5](https://cap.cloud.sap/docs/node.js/events#req-reject---)
- [Official reference 6](https://cap.cloud.sap/docs/java/event-handlers/indicating-errors#exceptions)
- [Official reference 7](https://cap.cloud.sap/docs/guides/uis/fiori#validation-on-active-entities)
- [Official reference 8](https://cap.cloud.sap/docs/node.js/events#-subject)
- [Official reference 9](https://cap.cloud.sap/docs/node.js/cds-ql#using-reflected-definitions)
- [Official reference 10](https://cap.cloud.sap/docs/node.js/core-services#srv-handle-event)
- [Official reference 11](https://cap.cloud.sap/docs/java/event-handlers/#pojoarguments)
- [Official reference 12](https://cap.cloud.sap/docs/java/event-handlers/#entity-reference-arguments)
- [Official reference 13](https://cap.cloud.sap/docs/java/working-with-cql/query-execution#result)
- [Official reference 14](https://cap.cloud.sap/docs/java/fiori-drafts#activating-drafts)

These links are reference entry points, not evidence that a live lookup or learner test succeeded.
