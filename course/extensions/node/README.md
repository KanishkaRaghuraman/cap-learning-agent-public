# Node.js reference: lessons 10–11

This continues the course CommonJS or ESM IncidentManagement sample (namespace `incident.mgmt`, active incidents behind the existing draft UI). It is a local exercise. The existing UI service is unchanged and is not secured by these MCP-specific roles. Do not deploy this mock-authentication setup.

## Lesson 10: read stage

In the completed application's terminal:

```sh
npm add --save-exact @cap-js/mcp@1.5.0
```

From the course repository terminal, pass the real completed application path:

```sh
node course/extensions/node/apply.mjs /path/to/IncidentManagement 10-read-only
```

Read the copied `srv/incident-agent-service.cds` with the learner. It exposes only ID, title, status, urgency and the synthetic business partner display name. No action exists in this stage. The helper keeps the old UI service unchanged, configures local mock roles in the development profile, and disables automatic MCP-client configuration writes.

Restart the same development app as in lesson 6. On the verified Node.js sample, `cds watch` runs it at port 4004 and loads the existing test data. Use the actual port shown in its startup log. For the current Node journey, next apply `10-preview` and use the browser assistant as described below. An editor-client connection is an optional alternative after final practice: connect to the actual `/mcp/incident-agent` URL using Streamable HTTP. This exercise uses local mock user `alice` with an empty password, not production credentials. `alice` has reader and manager roles, `bob` only reader, and `mallory` neither. If choosing that editor-client alternative, configure its Authorization header as HTTP Basic for that mock identity; never send these mock settings to a public deployment. Follow the separately verified client instructions in the extension guide.

Maintainer diagnostic only, not a mandatory learner regression:

```sh
node course/extensions/node/verify.mjs read-stage http://localhost:4004
```

The test uses real MCP discovery and calls. Expected tools: `describe`, `query`; no `call`. It checks reads, anonymous/wrong-role rejection and rejection of mutation-shaped queries. Tool names and schemas are discovered live; do not assume a cached schema is current.

## Lesson 11: action stage

First discuss allowed/rejected cases; then from the course repository:

```sh
node course/extensions/node/apply.mjs /path/to/IncidentManagement 11-action
```

Ask the learner to restart their terminal if needed, explaining the in-memory reset first. Apply `11-preview-action` after `11-action`, then complete the browser-preview action and readback described in lesson 11. Cancellation is supported but is not a required drill.

### Optional maintainer verification — outside the learner journey

Only when explicitly requested, review the exact mutation target before running this suite. It is not a lesson completion gate.

```sh
# Set COURSE_TARGET_ID in your shell to the exact reviewed synthetic UUID first.
node course/extensions/node/verify.mjs action-stage http://localhost:4004
```

The test changes only the existing open incident explicitly supplied through `COURSE_TARGET_ID`; it refuses to choose a target for you. Review and confirm that UUID first. PowerShell uses `$env:COURSE_TARGET_ID = "the-reviewed-uuid"`; a POSIX shell can use `export COURSE_TARGET_ID="the-reviewed-uuid"`. Refresh Fiori to see the same stored value. It also checks missing/closed targets, unauthorized action access and repeated calls.

`raiseUrgency` accepts the `incident` UUID. It checks existence, rejects closed incidents and any outstanding edit draft, then returns unchanged data if urgency is already high. Otherwise it forwards the update through the existing `IncidentsService`, preserving its validation. Entity reads remain read-only. The extra draft lookup reads only an ID and never changes a draft. Save or discard the existing draft in Fiori before retrying.

Client approval is a separate interactive checkpoint: inspect the exact incident and action, then wait for confirmation. If declined, make no change. This script does not test a client's UI permissions and never claims that a chat prompt enforces server-side human approval.

## Tested prerequisites and boundaries

Runtime fixture: Node24.19.0, CAP10.1.1, MCP adapter1.5.0, SQLite3.1.1. Maintainer fixtures include foundation business-rule validation; this is not an additional learner exercise. Only the linked partner display name is added; no contact details, external API, conversation records or draft contents are exposed by the new service. Mock roles protect this MCP surface only. No production identity provider, cloud deployment or Windows editor behavior is implied.

## Grounding

- [cds-mcp: MCP adapter plugin → `npm add @cap-js/mcp`; `@mcp` services expose describe/query/call](https://cap.cloud.sap/docs/guides/ai/cap-mcp)
- [cds-mcp: srv.run(query) → queries are processed by registered service event handlers](https://cap.cloud.sap/docs/node.js/core-services#srv-run-query)
- [cds-mcp: Fiori programmatic access → `Foo.drafts` references read draft data in Node.js](https://cap.cloud.sap/docs/guides/uis/fiori#programmatic-access)
- [cds-mcp: Mocked Authentication → basic authentication with pre-defined development users; not suitable for production](https://cap.cloud.sap/docs/node.js/authentication#mocked)

The application model was also retrieved using a workspace-scoped CAP MCP connection before implementation. Do not invent alternate fields or repair steps if a learner's model differs: inspect the model and official docs through the configured development MCP first.

## Browser preview stages (Node.js)

After `10-read-only`, apply `10-preview` with the same helper. It adds the pinned `@cap-js/agents` dependency and a read-only `IncidentAssistant`. Install dependencies in the app, verify model access, restart it, and discover its preview link from the CAP index. No subscription access is assumed.

After `11-action`, apply `11-preview-action`. This adds `raiseUrgency` to the assistant with `@agent.hitl`. Its handler inherits the existing reviewed business implementation, so the MCP endpoint and preview enforce the same incident rules. The plugin pauses at `input-required` and displays the exact action arguments before approval. Reject the pending request before choosing a different target; review the new approval card. Refresh the Incident Management browser page after success.

[cds-mcp: @agent.hitl using agent hitl confirmation actions → Annotate a CDS action with @agent.hitl to require human approval; the task pauses in A2A input-required. Only supported by CAP Node.js.]

This does not add approval enforcement to a direct MCP client call: that client still needs its own learner confirmation. The browser assistant uses a local action tool because plugin 0.9.7 maps HITL by local action name; it does not route approval through the generic remote `call` tool. The per-action tool setting must remain enabled. Read-only projection and original MCP service remain intact.

Maintainer-only deterministic graph regression:

```sh
node course/extensions/node/11-preview-action/verify.mjs /absolute/path/to/disposable-installed-app
```

It uses a scripted test model, not a real LLM. It checks actual plugin approval pause, rejection, a changed target requiring a new approval, and the resulting stored change. Use a disposable fixture with synthetic data. Legacy `12-agent` remains a compatibility recipe for a read-only assistant; it must not replace an action-enabled preview.
