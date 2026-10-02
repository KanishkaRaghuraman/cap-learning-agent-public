# Connect your incident app and try its assistant

## Instructor routing (internal)

Full lesson 10 / Explore lesson 1. Read the saved runtime before speaking. Node.js follows this file. Java follows the lesson-10 section in course/docs/JAVA-MCP-PATH.md; do not install @cap-js/agents in Java. Teach only the selected visible lesson number. Use short explanations, then **For example:** for each prompt activity. Name where the learner types: editor chat for building, browser assistant preview for business questions.

## 1 — Add the application MCP

In the editor chat, explain: “Until now, MCP helped us build the app using CAP guidance. Now we’ll expose a small part of our incident service so an agent can work with its data.”

Ask for a read-only connection. The learner can change the wording.

**For example:**
> Add an MCP service for reading incident titles, business-partner names, status and urgency. Keep the existing app working.

Consult the actual model and current CAP guidance through development MCP. Apply the Node read-stage recipe in course/extensions/node/README.md. Expose only the linked partner’s display name; keep contact details, messages and arbitrary writes out; preserve the original UI service. Check service compilation, authorization and a scoped read. MCP is the app's tool interface; its URL is not a chat page. Do not require configuring the editor's application MCP client to start the browser journey; that is offered after the final lesson.

## 2 — Add the CAP assistant and open its preview

Explain in the editor chat: “The MCP service provides access to the data. The @cap-js/agents package adds an assistant that runs inside CAP, uses a language model and can work with those services. It also includes a simple browser chat preview for local development. I’ll use the CAP documentation tools to check how to add it.”

**For example:**
> Add the CAP assistant and help me open its browser preview using my available model connection.

Follow course/docs/BROWSER-ASSISTANT.md and the Node 10-preview recipe. The development MCP supplies documentation/model context; the coding agent edits files and installs the dependency. Do not claim the MCP server installs a package by itself. Verify supported model access before treating setup as complete. Compatible local Claude/OpenCode settings may be picked up automatically; an editor subscription alone is not proof. Explain use of the learner's existing model quota before a live call. If unavailable, explain the required supported model connection and keep this step pending. Never substitute a mock response and call the assistant ready.

The learner owns the server. If a restart is needed, explain that the in-memory database reloads sample data, ask them to restart with `cds watch` in their app directory and wait. Discover the Preview link from the running CAP index; do not guess a port or reuse an old URL. Check it belongs to the current app. Ask the learner to open it and confirm the chat is visible. HTTP 200 alone does not prove rendering. No Playwright/browser tooling is required on the learner's machine.

## 3 — Ask a question in the browser preview

“Open the assistant preview. Try asking which incidents need attention. You can filter, sort or ask for a summary.”

**For example:**
> Show unresolved incidents grouped by business partner, with their titles and recorded urgency.

The learner types this in the browser preview, not back into the editor chat. Wait for their result; use accessible logs and read-only service checks to troubleshoot. Verify that a real model used the incident tools and that its answer matches actual records. No records should change. Explain empty results honestly. New status does not prove an incident is unassigned; a title does not establish business impact. Don't ask for transcript copying when evidence is directly accessible.

After success, briefly explain that the browser assistant runs in CAP while the editor agent helps build it. Save and read back activeContext then progress: preview URL, model access result without secrets, actual evidence and pending checks. Do not claim learner rendering based on a maintainer test. Say “Type **next** when you are ready.” Never begin the next lesson automatically.
