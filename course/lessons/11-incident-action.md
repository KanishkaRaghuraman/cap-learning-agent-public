# Try a business action

## Instructor routing (internal)

Full lesson 11 / Explore lesson 2. Node.js uses the browser assistant from the previous lesson. Java follows course/docs/JAVA-MCP-PATH.md. Use the selected visible number and read this source before introducing the activity.

## 1 — Add an action in the editor chat

Required transition: use the read-only recap below before explaining the new action; do not replace it with an annotation list or an approval-system overview.

“So far, your incident MCP service is read-only: the assistant can find incidents, filter them and summarise the results, but it cannot change them. Now let’s add a business action to raise an open incident’s urgency to high through that same MCP service. CAP checks the user’s role and the incident’s state, and the browser assistant asks for your approval before making the change.”

Invite the learner to ask for this capability in their own words. Adding the action makes it available; it does not change an incident yet.

**For example:**
> Add an action to raise an incident's urgency to high. Make the browser assistant ask for approval before changing it.

Follow the Node 11-action and 11-preview-action stages and course/docs/BROWSER-ASSISTANT.md. Retrieve current CAP guidance through development MCP. Preserve the existing UI service, drafts and read-only entity. The assistant's action delegates to the same business operation exposed through application MCP; do not write directly to the database. Add @agent.hitl to the assistant action and verify the installed package's approval/resume protocol. An instruction asking the model to be careful is not an approval control. No mutation is authorized by the request to add the capability.

Explain the rules briefly: manager role required; incident must exist and be open; an active edit draft blocks the change; already-high urgency is unchanged. Credentials establish who calls; @requires checks their role. First check whether cds watch has reloaded the changed CDS/handler files and whether the running service exposes the action. Do not request a restart just because this lesson added code. If a new dependency/configuration or an observed reload failure requires a restart, explain that specific reason and the sample reset, then let the learner restart their own terminal with `cds watch`.

## 2 — Try the action in the browser preview

“First, open the Incident Management app using its current Fiori link, click Go and note the chosen incident’s urgency. Then return to the assistant preview and ask for the change. Check the proposed incident and urgency before approving.”

**For example:**
> Raise the urgency of Fabrikam Logistics’ incident about the monthly report to high.

Resolve from actual records. The preview must present an approval request for the exact action and incident. Show the business-partner name, incident title, current urgency and proposed high urgency; keep the resolved UUID as the internal action target; use the queried businessPartnerName, never infer it from a title. The learner approves or declines in the browser. Wait for that response; the editor agent must not execute the action on their behalf.

Before approval, no data may change. Cancellation leaves the record unchanged. A different target needs a fresh review and another explicit confirmation before the call. Do not reuse an approval for another record, silently approve tools or replay an uncertain call. If an outcome is unclear, read the record before any retry. A prompt-only promise or immediate mutation means this check failed; stop and fix the approval flow.

## 3 — Check the change and refresh the app

After the confirmed call, read the same incident again and explain the observed old/new urgency. Tell the learner: “Switch to the Incident Management app and refresh the page to see the updated urgency. If the table is empty after refreshing, click Go to load the incidents.” This is a browser refresh, not a CAP restart, which would reset the in-memory sample changes. Ask them to compare the displayed value with the assistant's result.

Label the destination explicitly: “Back in this editor chat, you can ask how the rule was implemented. The browser assistant answers business-data questions; it does not read the handler source.” Invite a question about the rule in the editor chat without making another change. Never say the learner must write business logic manually; they can ask their coding agent to implement their requirements using CAP guidance.

**For example:**
> What would happen if this incident were closed?

Answer from the implemented rules. There is no mandatory or unsolicited regression suite, rejection drill or browser automation in the learner activity. Never run a read-only-stage no-action verifier after adding actions. A separate action requires a new exact-target approval.

Required closing explanation after the action and readback succeed; do not omit the future-action example. Briefly recap: “You’ve used the MCP service to read incidents and call a business action, with CAP enforcing the rules. You can extend it with more business actions, such as creating a new incident, with the required fields, permissions and validation. We haven’t added that action here. Next, you’ll practise asking business questions and checking the answers.”

Explain the uses before mentioning technical URLs. Then give the short integration overview from course/docs/INTEGRATION-OPTIONS.md. Keep this as a short explanation, not another build task. Do not add or invoke a create-incident action. Continue to the final lesson when the learner is ready.

Save and read back activeContext then progress: approval/cancellation evidence, target, result, readback and learner-reported Fiori refresh. Keep failed/pending checks visible. Mark this lesson complete only after its actual browser action and readback; maintain coreStatus in-progress until the final lesson. Say “Type **next** when you are ready.” Never begin the next lesson automatically.
