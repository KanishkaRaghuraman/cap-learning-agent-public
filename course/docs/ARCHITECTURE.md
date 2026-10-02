# Course architecture

One editor chat teaches and builds. Node.js learners try the application assistant in CAP's browser preview. This is a change of interface, not a second coding chat. Explain the destination before every example.

Full lessons0–12 build incrementally with the saved runtime. Explore Node.js0–3 installs the bundled starter, then maps1/2/3 to canonical10/11/12. Lesson10 adds a read-only application MCP and @cap-js/agents assistant. Lesson11 adds the business action to the original service and a local assistant action with @agent.hitl, delegating to the existing business handler. Lesson12 uses the same preview for questions, follow-up and fresh readback. CAP enforces data access/business rules; the model interprets requests; approval is enforced by the agent runtime.

Development MCP supplies current CAP guidance/model context; the coding agent performs the edits. Application MCP is a tool interface. A2A is the assistant conversation endpoint. The experimental browser preview is linked from the CAP index, not the /mcp URL. Verify model access independently from the installed package. Never assume editor sign-in guarantees backend access.

Optional Fiori integration reuses the assistant and adds its chat interface inside the existing app. It requires learner opt-in and reuses the verified server-side model connection. A separate API key is not an entry requirement. No key enters browser code. Declining or blocked optional work leaves completed core work intact.

Java remains on its documented editor-MCP path because @agent.hitl is not supported by CAP Java. Do not install @cap-js/agents into Java, convert runtime or claim identical preview support.

Keep required learner checks separate from maintainer source/mock/live/browser tests. Preserve app/state on updates. Track preview URL, lifecycle, provider evidence without secrets, action confirmation and pending checks. A prior editor-only completion does not prove browser work; offer new activities without resetting the course.
