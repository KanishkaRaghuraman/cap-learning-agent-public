# Browser assistant implementation and recovery

This is the Node.js recipe reference for lessons 10–12 (Explore 1–3). The editor chat teaches and changes code; the CAP browser preview is where the learner asks business questions and approves an action. Do not ask them to paste the editor's build prompt back into the same chat. Give a short purpose, destination and adaptable **For example:** prompt.

## Before adding the assistant

Consult CAP development MCP for current model and docs: https://cap.cloud.sap/docs/guides/ai/cap-agents . Inspect installed versions and follow course/extensions/node/12-agent/README.md for the verified stage commands. The dependency is @cap-js/agents, not cap-Js/agents. It implements the app's assistant and A2A chat endpoint; application MCP is the tool interface, not the chat URL.

The plugin can discover compatible local Claude/OpenCode credentials in development. Source: https://cap.cloud.sap/docs/guides/ai/cap-agents#automatic-config . Do not promise any subscription works, infer billing ownership or copy credentials. Check presence/provider compatibility without printing settings, then make one scoped real-model call using the authorized environment. Explain that model usage uses that account's quota. Only after actual success say model access works. A mock response proves wiring only. If access fails, explain the exact error safely and help configure a supported provider using current docs; keep required preview work pending. Do not invent an OpenAI-compatible provider, silently switch models/accounts or weaken TLS/authentication.

## Stages and evidence

- Lesson 10: original read-only incident MCP plus 10-preview. Assistant exposes ID/title/status/urgency and businessPartnerName only; a real browser answer must match records. No action tool yet.
- Lesson 11: original 11-action plus 11-preview-action. The assistant's local action delegates to the existing application service's business operation. @agent.hitl pauses for approval. Verify no change before approval, approve once, read back, then ask learner to refresh Fiori. Explain that CAP rules still apply after approval.
- Lesson 12: same preview, business question/follow-up/fresh-read verification. Keep it read-only unless a separate action is explicitly requested and approved.

Discover the assistant Preview link from the running CAP index after the learner starts the server. A hardcoded old port, /mcp URL, or merely installed package is not a working chat. Missing route: inspect the assistant service/package and startup log. Missing provider: fix supported model configuration. 401/403: use the configured local course user through normal login; never disable authorization. Missing preview approval: inspect installed HITL support, effective tools and task state before any mutation. Repeated identical failures are not progress.

Keep receipts concise and secret-free: preview URL and running/stopped state, provider kind/model, real versus mocked evidence, approval/task outcome, readback, pending learner rendering/flow. Do not require browser automation tools on the learner's computer. The learner opens the UI; scoped HTTP/service checks help diagnose it.

## Java boundary

Do not add the Node dependency to Java. CAP Java has a separate adapter and model configuration, and currently lacks @agent.hitl and local Claude/OpenCode automatic configuration. This course keeps Java's existing editor-MCP path in course/docs/JAVA-MCP-PATH.md. Do not claim runtime parity or conversion. Source: https://cap.cloud.sap/docs/guides/ai/cap-agents#using-agenthitl .

## Report checks briefly

Keep provider/compile/tool-call diagnostics in evidence. Tell the learner what the successful check enables and give the next action. Compilation alone is not a running assistant. After code-only changes, inspect hot reload before asking for a restart; a dependency installation may require one. Explain the specific reason and sample reset when restarting is necessary.
