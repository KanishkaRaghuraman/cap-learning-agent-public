> Maintainer/full-app specification only. New learner short lesson0 installs the bundled starter using SHORT-STARTER.md; it does not execute this build/verification matrix or require its full foundation receipt.

# Incident Management foundation specification

specRevision: single-chat-2026-09-30

This is one bounded target application, not ten lessons to execute. Maintainers use it to define the bundled Node.js app. Inspect existing work first and implement missing outcomes in a coherent order. AGENTS.md owns teaching; course/BUILDER.md owns shared implementation safeguards. Do not load or replay foundation lesson scripts as an orchestrated sequence. The mappings below describe provenance, not execution phases.

## Domain and service contract

Use IncidentManagement/db/schema.cds and IncidentManagement/srv/incidents-service.cds with these exact names/types/relationships; verify current syntax through CAP development MCP.

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

Add virtual criticality : Integer to the incident service projection for UI read enrichment. Preserve drafts. UUID businessPartner_ID references BusinessPartners.ID, not readable businessPartnerId. CAP supplies persistence, draft behavior, managed audit fields and validated enums; handlers implement the custom rules below.

## Import and synthetic fixtures

Import the learner-downloaded Business Partner EDMX (full path only; short starter uses local synthetic partners) through supported cds import into srv/external. Validate nonempty XML EDMX and retain provenance. Inspect the generated service name, declared dependency and model/protocol configuration; include it in compiled CSN. Never manufacture metadata. This imported external contract is separate from local BusinessPartners; no destination, credentials or live SAP calls.

For Node.js create test/data/incident.mgmt-{Incidents,ConversationMessages,BusinessPartners}.csv under the app with actual model headers. At least5 incidents span high/medium/low and new_/assigned/closed, including an open lower-urgency incident; at least10 messages and3 fictional partners. Valid unique UUIDs, consistent rows, valid enums, matching partner/message references and no conflicting seed sources. Validate loading and counts at runtime. Preserve existing data. Legacy Java uses db/data and its verified build lifecycle, never silently converted.

## Business behavior

On active CREATE/UPDATE, a supplied title containing literal urgent case-insensitively sets urgency high, including “not urgent”; omitted title preserves urgency. Stored closed incidents reject changes/reopening with409 and “Cannot modify a closed incident”. An open incident may close once. Missing active target is not found, never an upsert/crash. Draft activation cannot bypass stored-state protection. Read stored state using actual reflected entity/request reference and supported query API; for Node.js obtain SELECT from cds.ql, preserve existing module style/handlers.

Criticality is virtual: high→1, medium→2, low→3, missing/unknown→0. Cover active/draft reads, single/collection, selected fields, filters, paging and counts. Fetch urgency only when necessary and remove helper fields when unrequested. Never leak criticality or its dependency into excluded selections. No extra per-record full-table query.

## Fiori outcome

Use supported Fiori generation/modification and UI5 checks. Incidents List Report shows source-defined title, urgency and status in a fresh session. Object Page header uses title, with details and conversation table via messages; child detail when generated shows message/author. Urgency displays readable text with criticality on list/detail. Source annotations, not personal table settings, supply labels/columns.

Editable Business Partner field has value help showing businessPartnerId and name while mapping UUID ID to businessPartner_ID. Preserve the selected association after UI draft save and independent readback. No live integration claim. Keep a coherent supported UI5 framework/preview version; inspect generated manifest/component/bootstrap/annotations and real package build scripts.

## Acceptance evidence

- Setup: actual versions/engines, current CAP/Fiori/UI5 native tool calls; changed configuration reconnected in the actual client.
- Model/import and data: compiled model, correct exposed metadata/import configuration, static fixture validation and real three-entity reads/counts.
- HTTP: course/scripts/verify-foundation.mjs --url <observed local origin> --stage full --output <evidence path> exits0 with passing JSON. Exercise urgent/ordinary create, urgent/partial update, close-once, closed edit/reopen rejection, missing target, closed draft Save, invalid enums, read-only partners, active/draft criticality/selection/paging/counts and verified cleanup.
- UI: actual application/model build, UI5 build, lint and native manifest validation; rendered fresh list/object/conversation pages and colors; partner search/selection; UI Create→draft Save→independent readback of the same disposable incident; draft discard and cleanup. Never mutate seeded incidents for test convenience.
- Scope/lifecycle: no application MCP or embedded-agent extension yet; source snapshot, actual running preview URL and owned process identity. Preserve original fixtures and verify cleanup of disposable records.

Use preparation receipt version:2, specRevision above, runtime, nonempty versions object, preview:{url,status:'running'}, recovery:[], app snapshot from prepare-course.mjs snapshot, checks with passed/evidence entries and pendingChecks:[]. Required evidence groups are defined by prepare-course.mjs; inspect its help/schema rather than invent field names. Record one receipt, finish only after all checks pass. Failed/unavailable evidence stays pending. Source checks do not establish native learner-flow success.

Foundation readiness is checked before entering canonical10 only. Once consumed, this snapshot remains historical evidence; legitimate extension changes use their own acceptance checks and must not trigger this specification’s no-extension gate.

## Provenance mapping

| Contract | Existing source |
|---|---|
| Setup/scaffold/import | lessons00–02 and learner-downloaded EDMX |
| Exact domain/service | lesson03 |
| Fixture shape | lesson04 runtime variants |
| Business behavior/HTTP | lessons05–06 and verify-foundation.mjs |
| UI/criticality/value help | lessons07–09 and verify-foundation.mjs |
| Later four-field MCP compatibility | course/extensions/node and course/extensions/java |

These mappings permit maintenance comparison; they do not require hidden lesson replay.
