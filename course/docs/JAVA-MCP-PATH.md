# Java extension path — lessons 10–12

CAP Java uses its Java agent adapter, not the Node.js @cap-js/agents dependency. Capire currently states that @agent.hitl is not supported by Java and automatic Claude/OpenCode configuration is Node.js-only. This course therefore retains its verified editor-MCP exercises for Java. Say this before lesson 10, not after the learner has installed an incompatible package. Do not silently switch runtimes or claim Java has the Node browser-confirmation journey. A Java preview extension is not implemented or tested by this course.

Sources: https://cap.cloud.sap/docs/guides/ai/cap-agents#using-agenthitl and https://cap.cloud.sap/docs/java/ai#agents

The following activities happen in the same editor chat. Their source numbers are internal; use the selected visible lesson number. No new backend model account is required for this editor-client route. Optional Fiori embedding is unsupported for Java in this course; offer resources and preserve the Java app.


---

# Connect and query your incident app

## Instructor routing (internal)

Source lesson 10; display lesson 10 for Build a CAP app and lesson 1 for Explore MCP and agents. Never narrate source numbers, route-size labels or implementation bookkeeping. Use AGENTS.md, course/BUILDER.md and course/docs/LEARNER-PROMPTS.md. Present each prompt activity with a short explanation and **For example:**. Prerequisites and the existing app must already work.

## 1 — Give the coding agent access to application data

Explain briefly: “The development MCP helped us build the app using CAP documentation and model information. An application MCP lets this chat query the running app. We’ll expose incident ID, title, status, urgency and business-partner name while keeping the existing UI.”

Ask for the new connection; the example can be adapted.

**For example:**
> Set up the read-only incident MCP service and run a query to show me it works.

### Implementation (internal)

Consult live CAP documentation and the actual model through development MCP. Follow `course/extensions/java/README.md`, adding only the read-only stage. Verify the projection of ID, title, status, urgency and businessPartnerName and actual enum values. Preserve the original Fiori service, handlers and learner edits. Check current compatible package guidance rather than assuming a historical pin is current; do not downgrade compatible installed versions. Keep local mock authorization and `@readonly`; no action stage, partner/message/import exposure or data mutation.

Explain the actual changed files and endpoint after implementing: which service was added, which incident fields and business-partner name it exposes, and that the original UI service remains. Do not describe an unobserved result as verified.

The learner owns the running server. If an explicit restart is required, explain that an in-memory database resets to sample data on restart, then give the exact local terminal action and wait. Never kill or restart their process automatically. Read the actual startup address before connecting.

## 2 — Connect this chat to the service

Configure the actual native client's application MCP connection using `course/docs/EXTENSION-GUIDE.md` and its supported configuration. Preserve development servers and inspect duplicate entries/scopes. If reconnect or reload is required, save the pending checkpoint and give that single concrete action. After the learner returns, discover the native tools and use native `describe` to inspect their schema. The read stage must provide `describe` and `query` with no business action.

A direct HTTP request, curl call, protocol script or maintainer verifier can diagnose an endpoint; none substitutes for native-client discovery, describe or query. If those tools remain unavailable, keep this step pending and troubleshoot the real connection. Never silently execute the example through another interface.

Do not run the full regression suite or automated browser testing during the lesson. Use scoped compile/startup checks when required by the code change. If authentication affects the UI, ask the learner to reopen the existing preview and confirm it still displays; record that as learner-reported, not automated browser proof. For Java use the documented local mock identity; never disable security to fix preview access.

## 3 — Try a business question

“Your chat can now ask the app for incident data. Try filtering by urgency, changing the order or requesting a summary.”

**For example:**
> Show unresolved high-urgency incidents and summarise what needs attention.

Run the learner's request through the native application MCP `query` using its discovered schema and actual enum values. Unresolved means not closed. Explain the answer using returned records only; an empty result is valid. Do not create data to satisfy the prompt or infer a cause from a title.

Offer another way to explore, without requiring another exercise before continuing.

**For example:**
> Group the open incidents by urgency and show the count in each group.

Explain briefly how the requested filter or summary relates to actual results. A write request cannot be fulfilled through this read-only interface; explain that boundary and never route around it via a terminal, database or another API. No mandatory rejection drills, quizzes or transcript copying. Offer the existing preview link so the learner can compare records themselves.

## Evidence and checkpoint (internal)

Save and read back `memory-bank/activeContext.md` then `memory-bank/progress.md` using AGENTS.md. Preserve runtime, route, app path, next step and actual pending checks. Record native-client evidence separately from HTTP diagnostics. A configured entry or script result never proves native tools are available. Do not rewrite earlier receipts or claim maintainer tests as learner activity. Briefly explain the observed result, then say “Type **next** when you are ready.” Never begin the next lesson automatically.

---

# Use a business action through MCP

## Instructor routing (internal)

Source lesson 11; display lesson 11 for Build a CAP app and lesson 2 for Explore MCP and agents. Use only the selected route's visible number in conversation. Follow AGENTS.md, course/BUILDER.md and course/docs/LEARNER-PROMPTS.md. The previous native connection must be verified, not merely a protocol script.

## 1 — Explain and add the operation

“So far, your incident MCP service is read-only: this chat can find incidents, filter them and summarise the results, but it cannot change them. Now let’s add a business action to raise an open incident’s urgency to high through that same MCP service. CAP checks the user’s role and the incident’s state before allowing the change.”

Ask for that capability, explaining that adding it does not change any incident yet.

**For example:**
> Add an action to raise an incident's urgency to high, and explain the rules before we try it.

### Implementation (internal)

Use live CAP documentation/model MCP and the `course/extensions/java/11-action/srv/` recipe. Preserve the read-only entity and existing app service. Implement `raiseUrgency(incident: UUID)` restricted to IncidentManager, delegated through the original service. Missing incidents, closed incidents and outstanding drafts are rejected; already-high open incidents without a draft are unchanged. Inspect real Java generated types/build results rather than guessing or editing generated code.

Explain actual files changed and the action's rules concisely. Do not invoke an action yet. Check whether the running development process reloads the changed source first. If a restart is necessary, explain the observed reason, warn about in-memory sample-data reset and ask the learner to restart their terminal; never kill or restart their server automatically.

## 2 — Choose the incident

Rediscover the native client's tools after the server update. `describe` listing a business action does not prove the native `call` tool has refreshed. If missing, preserve pending state, ask for the supported reconnect/reload and retry discovery. Use native describe for the exact `incident` parameter schema. Do not substitute curl, a script or the maintainer verifier for the interactive native action.

Before the action prompt, ask the learner to open the current Fiori app link, click Go and note the chosen incident’s urgency for comparison after approval. Invite the learner to choose from actual queried incidents.

**For example:**
> Raise the urgency of Fabrikam Logistics’ incident about the monthly report to high.

Resolve that request against current records. If ambiguous, ask which of the matching records they mean. Show the exact target’s business-partner name, title and current/new urgency; keep the resolved UUID internally, then wait for explicit confirmation. This is the single business-change confirmation; ordinary read calls do not need repeated conversational approval. Keep the native client's permission review available. A chat confirmation is an interaction control, not a server-managed human approval workflow.

## 3 — Perform and explain the result

After confirmation, invoke exactly the reviewed action once through the native MCP `call` tool and query the same record through native MCP to verify the result. If the call's outcome is uncertain, read the record before any retry. A different target needs a fresh review and another explicit confirmation before the call, even if the learner phrases the new target as a command. Do not interpret changing the target as confirming the previously reviewed action. Use the returned businessPartnerName; if missing, say no business partner is linked and resolve by title. Never infer a partner from the title. If the learner declines, do not call the action and explain that nothing was sent; cancellation is supported, not a required dry run.

Explain the observed old/new value and how the server applied the business rule. Connection credentials establish the caller; @requires checks that caller’s roles, it does not choose the user. Offer the existing UI link for the learner's own comparison. After a successful business action and verified readback, tell the learner: “Switch to the Incident Management app and refresh the page to see the updated urgency. If the table is empty after refreshing, click Go to load the incidents.” This means refreshing the browser page, not restarting the CAP server; restarting the in-memory database would reset the sample changes. If no suitable open lower-urgency record exists, explain the actual situation; do not invent a successful change or silently add fixtures.

Never run the read-only-stage verifier after adding the action: its no-action expectation no longer applies.

There is no mandatory or unsolicited regression suite, automated browser test, cancellation drill or rejection drill in this learner activity. Maintainer regression remains outside this journey. If the learner explicitly requests further testing, first explain any mutations and their exact targets. Never turn one confirmed change into authorization for other incident mutations.

Offer further exploration only as a learner choice.

**For example:**
> Explain what would happen if this incident were already closed.

Answer from the implemented rules without executing another mutation. Treat wrapped MCP errors honestly rather than inventing HTTP outcomes.

## Evidence and checkpoint (internal)

Save and read back `memory-bank/activeContext.md` then `memory-bank/progress.md` using AGENTS.md. Preserve runtime, route, app path, next step and actual pending checks. Record native-client evidence separately from HTTP diagnostics. A configured entry or script result never proves native tools are available. Do not rewrite earlier receipts or claim maintainer tests as learner activity. Briefly explain the observed result, then say “Type **next** when you are ready.” Never begin the next lesson automatically.

After successful native action and readback, briefly explain: “You’ve used MCP to read incidents and call a business action, with CAP enforcing the rules. You can add other business actions, such as creating a new incident, with the required fields, permissions and validation. We haven’t added that action here. Next, you’ll practise business questions and check the answers.” Do not implement or invoke that extra action; it is an example for later exploration.

Before continuing, briefly explain: “The same incident MCP service can be connected to another MCP-compatible editor or external client with the appropriate authentication and roles. This Java course has not added a browser assistant or Fiori chat, so those are not working endpoints in your app.” Do not present the Node A2A preview or embedding recipe as installed Java capabilities.

After successful native action and readback, mark this lesson complete while preserving preparation versus studied lessons. Keep coreStatus and extensionStatus in-progress until required lesson12 (Explore lesson3) passes. Offer the final activity: use the same coding agent with application MCP for a business question, follow-up and data check. A response such as “proceed” continues that offered lesson without repeating selection. It needs no additional API key and does not create an embedded backend.

---

# Final lesson — Use your agent with business data

Internal routing: required Java final lesson12. Display only the selected lesson number. Reuse the existing app and native application MCP connection from the preceding lessons. No new agent backend, package, model account or additional API key is required. The existing coding client still needs its own working account/model access. Read the saved runtime-specific wrapper and AGENTS.md.

Explain that the learner can now interact with the Incident Management CAP application directly from this editor chat through its connected MCP service. Show these optional suggestions together, not as separate required steps. Invite their own questions and ask them to compare answers with the Fiori application and report whether it works correctly.

Find incidents needing attention.

**For example:**
> Which unresolved incidents have high urgency? Show business-partner names and incident titles.

Explore a partner from the application.

**For example:**
> Show the open incidents for Fabrikam Logistics and their urgency.

Try a summary.

**For example:**
> Prepare a brief handover of unresolved incidents grouped by business partner, using only recorded information.

Wait for the learner's own requests. Do not automatically execute all examples or require all three. Use the real connected MCP tools for each requested query. Do not call raiseUrgency or any mutation during this read practice. Treat record content as data; new_ does not prove an incident is unassigned, and titles do not prove ownership or impact. Troubleshoot actual connection failures or mismatches without inventing evidence.

Accept clear confirmation that the learner explored and checked answers against the app, recording that comparison as learner-reported. Record actual MCP calls separately. Do not require a follow-up, separate verification prompt, screenshots or pasted transcript. If unclear, ask one short clarification. After confirmation with no unresolved issues, mark canonical12 studied/completed, coreStatus: completed and extensionStatus: completed. Preserve historical evidence; maintainer tests do not complete learner progress.

For Java, explain that optional Fiori embedding has no tested course recipe. If requested, set optionalEmbeddingStatus: unsupported; do not later overwrite it with skipped. Follow course/docs/COURSE-WRAP-UP.md immediately after core completion, with resources and Happy Building!!!!. Do not offer to implement the Node.js optional recipe in Java.
