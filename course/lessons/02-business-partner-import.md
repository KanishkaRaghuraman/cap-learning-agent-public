# Lesson 2 — Import an API Contract

## Learner activity and example

Ask the agent to import the Business Partner contract used by this course. You can ask how a service definition differs from a live backend connection.

**For example:**
> Import the course Business Partner service contract and explain what the app can learn from its metadata.

Apply `course/docs/LEARNER-PROMPTS.md` to **every** subsequent prompt instruction in this lesson, including follow-ups and recovery. The technical recipes below guide implementation; present each learner task with its own brief explanation and example rather than copying the recipe verbatim.

> **Internal one-chat pacing (do not read source labels aloud):** Follow AGENTS.md and course/BUILDER.md. Full path uses this canonical lesson; short path reuses canonical10/11/12 as display1/2/3. Its setup uses prerequisites and the bundled starter per course/docs/SHORT-STARTER.md, never lesson replay. Explain each learner-authored activity with a concise **For example:** prompt; routine setup, terminal startup and preview instructions need no copied prompt; implement the learner’s request, verify and explain actual results. The recipes below are internal guidance.

## Step 2.1 — Import a contract, not a connection

### [TEACH]

“An EDMX file describes an OData API. Importing it lets CAP understand that API's shape. It does not connect to S/4HANA: our tutorial will use separate synthetic local partners.”

Ask the course agent for this activity; adapt the example to what you want to explore.

**For example:**
> Import the course Business Partner service contract and explain what the app can learn from its metadata.

### Internal implementation recipe — not a learner prompt

Import the Business Partner EDMX contract into the existing IncidentManagement application. Ask the learner to open https://api.sap.com/api/API_BUSINESS_PARTNER/overview, sign in if required, choose API Specification and download the EDMX into the application folder. The learner obtains it under SAP’s applicable terms; no SAP API metadata is bundled. Wait for the actual file before importing. Verify the XML and use the official cds import workflow for my saved runtime. Install any newly declared project dependencies. Confirm generated contract files, runtime configuration and build-model inclusion. Do not configure credentials, a live destination or remote data calls.

Apply shared grounding, ownership and evidence safeguards in course/BUILDER.md.

### [CHECK]

Implement the bounded learner request in this course chat. No reportback or copied logs. Explain actual results before the next checkpoint.

## Step 2.2 — Internal implementation and checks

- Verify the learner-downloaded file is nonempty XML EDMX for API_BUSINESS_PARTNER, not HTML. If missing or inaccessible, keep the import step pending and help with the download; never synthesize or fetch a hidden bundled replacement.
- Work inside the actual generated app. Ground `cds import BusinessPartner.edmx --as cds`; use the actual filename. Verify nonempty `.cds` and `.edmx` output in `srv/external/`, actual service name, changed manifest/config and dependency installation. A filename is not necessarily a service name.
- **Node.js:** verify the generated `cds.requires` model/protocol entry and that its model resolves. **Java:** inspect the remote OData Maven dependency and the correct Spring profile, preserving other settings. Confirm the imported service is in the generated CSN. If the actual build needs an inclusion entry, preserve other imports and use the documented `using from './external/BusinessPartner';` in `srv/external-models.cds`, adjusted only to the observed filename. Rebuild; never add Node configuration to fix Java.
- Before `db/schema.cds` exists, do not require a domain-model search result or repeatedly call `search_model` against an empty local model. Inspect the import and compile its actual entry point using current documentation. A service import can be validated independently; verify domain discovery after lesson 3 creates the model. If compilation actually fails, diagnose the precise error; absence of a local domain is not proof of a broken MCP install.
- A generated destination reference is not a configured destination. Do not remove a remote configuration to hide `Cannot find service`; inspect model inclusion. Do not claim a live connection or runtime startup from a Maven configuration-goal success.

## Step 2.3 — Review the boundary

### [TEACH]

Show the imported-model path and the runtime-specific configuration change, then explain: “We now have a contract the application can describe. The small local partner entity in the next lesson is separate.” No field-name quiz or manual file-copy exercise is needed.

## [SAVE PROGRESS] Course checkpoint

Inspect supporting files/results directly. Missing checks remain pending; repair within scope and never invent completion. Explain the actual outcome briefly.

Save and read back `memory-bank/activeContext.md` then `memory-bank/progress.md` under the root contract, preserving runtime/platform, actual paths, current step, next action and pending technical checks. The same course agent saves state after evidence review. Foundation preparation grants no studied-lesson credit. Skipped optional exploration/questions do not create pending checks. A required unavailable tool or failed functional check does. Summarize the concept and actual result in a few sentences, then stop.

At a verified checkpoint invite the next bounded activity.

**For example:**
> Continue to the next step.

## For more detail

- [Official reference 1](https://cap.cloud.sap/docs/node.js/cds-connect#configuring-required-services)
- [Official reference 2](https://cap.cloud.sap/docs/java/cqn-services/remote-services#remote-odata-services)
- [Official reference 3](https://cap.cloud.sap/docs/node.js/cds-connect#cdsrequiressrvmodel)
- [Official reference 4](https://cap.cloud.sap/docs/guides/integration/reuse-and-compose#via-using-from-directives)

These links are reference entry points, not evidence that a live lookup or learner test succeeded.
