# Lesson 3 — Model the Domain and Expose a Service

## Learner activity and example

Describe the incidents, business partners and conversations the app needs to represent. Ask the agent to use the course model so later exercises remain compatible.

**For example:**
> Create the course incident model and service, including its partner and conversation relationships. Explain what CAP supplies from these definitions.

Apply `course/docs/LEARNER-PROMPTS.md` to **every** subsequent prompt instruction in this lesson, including follow-ups and recovery. The technical recipes below guide implementation; present each learner task with its own brief explanation and example rather than copying the recipe verbatim.

> **Internal one-chat pacing (do not read source labels aloud):** Follow AGENTS.md and course/BUILDER.md. Full path uses this canonical lesson; short path reuses canonical10/11/12 as display1/2/3. Its setup uses prerequisites and the bundled starter per course/docs/SHORT-STARTER.md, never lesson replay. Explain each learner-authored activity with a concise **For example:** prompt; routine setup, terminal startup and preview instructions need no copied prompt; implement the learner’s request, verify and explain actual results. The recipes below are internal guidance.

## Step 3.1 — Describe the domain

### [TEACH]

“CDS is CAP’s language for describing data and services. An association links an incident to an independently stored partner; a composition makes its conversation messages part of the incident. A service projection chooses what clients can access, and CAP supplies standard data operations. Draft support lets users edit a working copy before saving; the partner lookup stays read-only.”

Ask the course agent for this activity; adapt the example to what you want to explore.

**For example:**
> Create the course incident model and service, including its partner and conversation relationships. Explain what CAP supplies from these definitions.

### Internal implementation recipe — not a learner prompt

Create the course's incident domain and service in IncidentManagement, following the canonical model and service contract in lesson 3. Include incidents, owned conversation messages and synthetic local business partners; use UUID keys, managed timestamps, validated urgency/status enums, draft-enabled incidents and read-only partners. Keep the imported external contract separate. Compile for my runtime and verify the new model through CAP MCP. Do not create sample data or UI yet.

Apply shared grounding, ownership and evidence safeguards in course/BUILDER.md.

### [CHECK]

Implement the bounded learner request in this course chat. No reportback or copied logs. Explain actual results before the next checkpoint.

## Step 3.2 — Internal implementation contract

Before creation, inspect whether local domain files exist; preserve existing work. Ground aspects, composition backlinks, projections, draft and enum validation through live CAP documentation. Do not demand a successful local `search_model` before the first model exists. Immediately after creation, run it against the actual app and confirm all entities/service/navigation. If it fails then, inspect the real compilation/scope error and fix that cause before completion.

Retain namespace `incident.mgmt`, service `IncidentsService`, file paths `db/schema.cds` and `srv/incidents-service.cds`: later fixtures and staged extensions depend on these explicit course names. The following is a **internal reference**, not code the learner must type. Verify compatibility before applying; formatting may vary but the contract must not drift.

```cds
namespace incident.mgmt;
using { cuid, managed } from '@sap/cds/common';

type Urgency : String enum { high; medium; low; }
type Status : String enum { new_; assigned; closed; }

entity Incidents : cuid, managed {
  title : String(200);
  urgency : Urgency @assert.range: true;
  status : Status @assert.range: true;
  businessPartner : Association to BusinessPartners;
  messages : Composition of many ConversationMessages on messages.incident = $self;
}

entity ConversationMessages : cuid, managed {
  message : String(2000);
  author : String(100);
  incident : Association to Incidents;
}

entity BusinessPartners : cuid {
  businessPartnerId : String(40);
  name : String(200);
}
```

```cds
using { incident.mgmt as mgmt } from '../db/schema';

service IncidentsService {
  @odata.draft.enabled
  entity Incidents as projection on mgmt.Incidents;
  entity ConversationMessages as projection on mgmt.ConversationMessages;

  @readonly
  entity BusinessPartners as projection on mgmt.BusinessPartners;
}
```

`cuid` provides UUID identity; `managed` provides audit fields. `businessPartner_ID` references the partner UUID, not its readable `businessPartnerId`. Messages use the composition backlink; do not replace UUIDs with readable IDs. Enum declaration alone is not runtime validation: retain the grounded `@assert.range: true` constraints.

### [VERIFY] Agent-owned checks

Compile actual `db/` and `srv/` to SQL for the selected runtime (H2 dialect for Java). Inspect base tables, projected views, keys, associations and generated draft structures. Compilation verifies model translation, not runtime constraints. Record the actual model discovery and service metadata shape; schedule the invalid-enum and read-only partner HTTP checks with the running application in lesson 6. Do not claim those runtime checks passed yet.

## Step 3.3 — Review what the prompt produced

### [TEACH]

Point to one association, the messages composition and the service's draft/read-only annotations in the actual diff. Explain their effect briefly. The learner may review the source; no syntax memorization or answer is required.

## [SAVE PROGRESS] Course checkpoint

Inspect supporting files/results directly. Missing checks remain pending; repair within scope and never invent completion. Explain the actual outcome briefly.

Save and read back `memory-bank/activeContext.md` then `memory-bank/progress.md` under the root contract, preserving runtime/platform, actual paths, current step, next action and pending technical checks. The same course agent saves state after evidence review. Foundation preparation grants no studied-lesson credit. Skipped optional exploration/questions do not create pending checks. A required unavailable tool or failed functional check does. Summarize the concept and actual result in a few sentences, then stop.

Record the later runtime checks explicitly as pending lesson 6; this lesson verifies the model/service definition, not behaviour that has not run.

At a verified checkpoint invite the next bounded activity.

**For example:**
> Continue to the next step.

## For more detail

- [Official reference 1](https://cap.cloud.sap/docs/guides/services/constraints#assertrange)
- [Official reference 2](https://cap.cloud.sap/docs/cds/common#aspect-cuid)
- [Official reference 3](https://cap.cloud.sap/docs/cds/common#aspect-managed)
- [Official reference 4](https://cap.cloud.sap/docs/guides/domain/#compositions)
- [Official reference 5](https://cap.cloud.sap/docs/guides/databases/cdl-to-ddl#database-specific-dialects)
- [Official reference 6](https://cap.cloud.sap/docs/guides/uis/fiori#draft-enabled-entities)
- [Official reference 7](https://cap.cloud.sap/docs/guides/security/authorization#restricting-events)

These links are reference entry points, not evidence that a live lookup or learner test succeeded.
