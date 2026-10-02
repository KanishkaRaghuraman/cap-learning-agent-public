# Optional: an assistant inside the Fiori app

The required final lesson is already complete when the learner has tried the CAP browser assistant, checked the answer and tried a follow-up. This extension is optional. Ask whether the learner wants to add the chat inside Fiori or finish the course here. Reuse the model connection already verified in the preview; no new API key is required. An editor subscription alone still does not prove that a connection works.

## Before development

Explain: the assistant already runs inside CAP. This extension adds its chat button inside Fiori, using the same backend with a verified server-side model connection. This course provides the executable extension for the Node.js app. Do not apply it to Java or convert a learner's application. Java learners can complete their documented editor-MCP activity and explore the linked CAP Java guidance.

Check the installed agent package's supported provider configuration using CDS MCP and the pinned backend recipe. Never ask the learner to paste a key in chat, a prompt, a receipt or a browser form. Use a local ignored server configuration or environment variable; never store a key in the UI. Do not automatically install this extension just because model access exists. If the previously working connection fails, keep optionalEmbeddingStatus: pending, explain the actual error, and troubleshoot it. Let the learner choose to retry or finish without integration; do not silently skip their choice. Mark completed only after the panel checks pass.

## Develop and try it

1. Explain what will change. Keep the existing incident screens and add **Ask Incident Assistant** to the List Report header. The dialog sends questions to the same-origin CAP assistant and displays plain text. It carries the conversation context for follow-ups while the dialog remains open. Closing and reopening starts a new conversation.
2. A yes to the optional choice selects this activity; it does not skip teaching. Explain the change, then invite the learner to ask for it in their own words. After showing the example, wait for their request before running the install script. Accept rephrasing and do not require them to copy it verbatim.

   **For example:**
   > Add an incident assistant inside my Fiori app using my configured model connection. Keep its approval checks and let me ask follow-up questions.

3. Reuse the existing lesson11 assistant backend and confirm the existing model connection still returns a real answer before changes. Do not apply the legacy 12-agent read-only recipe over its action-enabled service. A development mock is not a real-model completion.
4. From the course root, run `node course/scripts/install-fiori-chat.mjs IncidentManagement --opt-in`. It adds `app/incidents/webapp/ext/IncidentChat.js` and one manifest action. It rejects conflicting files/actions and symlinks rather than overwriting learner work. It is specific to the course's `app/incidents` layout. It does not read, write or verify model credentials; the instructor must perform the provider check first.
5. This helper changes UI files only: reload the Fiori preview first; do not routinely restart CAP or run npm install. Restart only for an observed backend/dependency change that requires it, explaining the in-memory sample reset first. Open **Ask Incident Assistant**. The browser must be signed in with an incident-reader account. For the local mocked-auth course setup, GET `/a2a/incident-assistant` returns a standard HTTP Basic challenge (verified at the protocol level); use the configured course test user through the browser sign-in dialog, then return to Fiori. A GET response saying Method not allowed (405) is not proof that sign-in or authorization succeeded. Confirm access with a successful assistant request in the Fiori panel. The latest learner transcript reports this login route worked, but that is learner-reported evidence, not an automated login proof. If the browser blocks it, stop and diagnose that browser limitation; do not claim sign-in worked. Do not put credentials in URLs or add authentication bypasses. A deployed application uses its configured identity provider.
6. Ask a question, then a follow-up. Encourage changing the wording and checking the answer against the incident list.

   **For example:**
   > Which incidents need attention?

   Narrow the result with a follow-up.

   **For example:**
   > Show only those with high urgency.

7. Verify a real answer, a follow-up and an access/error case. The loading state must end, errors must be understandable, and read-only questions must not modify incidents. If an action is requested, show the exact action/arguments and wait for approval or rejection before resuming the pending task. Verify rejection leaves data unchanged and approval changes only the reviewed record. Refresh the Fiori page to see a successful change; if its table is empty, click Go to load the incidents. Do not restart CAP. Missing model access or mock responses leave this optional extension unverified; they do not undo completion of the required course.
8. After the panel works, briefly share course/docs/AI-CORE-NEXT-STEPS.md: other clients can use the assistant through A2A, and SAP AI Core can provide model access for a deployed application. This is a next step to explore, not another required exercise.
9. Wrap up using course/docs/COURSE-WRAP-UP.md, ending **Happy Building!!!!**

## Implementation evidence and boundaries

- [cds-mcp: agents chat protocol custom UI → CAP agents expose conversational endpoints and the supplied chat preview is alpha.] Source: https://cap.cloud.sap/docs/guides/ai/cap-agents#using-chat-preview
- Fiori MCP `list_functionality` → `get_functionality_details(create-controller-extension)` → `execute_functionality` succeeded on the disposable installed app on 2026-10-01. Initial starter-only attempts failed because the bundled starter has no installed CDS module. No learner app was modified.
- Fiori MCP `search_docs: custom action header actions manifest Fiori elements V4 press handler` returned “Adding Custom Actions Using Extension Points”, including V4 manifest actions and exported handler modules. The chat uses that documented custom action, not screen personalization or manipulation of framework controls. A controller was generated in the disposable protocol exercise; the recipe uses a smaller standalone action module, so that unused generated controller is not shipped.
- Transport is source/runtime verified against the pinned `@cap-js/agents` 0.9.7: JSON-RPC `message/send` at `/a2a/incident-assistant`, text parts and returned conversation context. This is a course integration, not a claim of a built-in Fiori chat product. Backend and provider remain alpha/version-sensitive.
- The browser sends same-origin credentials. Existing CAP authentication and authorization still apply. It never sends a model API key. Error text excludes raw backend/provider responses. Model output uses UI5 text controls, never HTML.
- Maintainer tests use a disposable app and mocked model; they do not establish real-model quality or credential validity. Browser test results belong in the verification report.

## Business names in the chat

Use business-partner names and incident titles in questions, summaries and approvals. Resolve actual businessPartnerName from the service, keep UUIDs internally for exact targeting, and ask which incident title the learner means when a partner has several matches. Before approval the panel reads the selected incident’s current partner/title and urgency; it never invents those labels from model prose. Keep technical arguments behind an optional details button. Missing or failed target lookup must prevent approval, not fall back to a guessed customer.
