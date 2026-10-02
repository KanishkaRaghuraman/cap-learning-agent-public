# After adding chat: where to go next

Share this briefly after successful Fiori integration, then conclude the course. Do not start deployment or request credentials during the wrap-up.

Your Fiori panel uses the same CAP assistant as the preview. Other web clients can also call its A2A endpoint, and other CAP agents can use it as a subagent. Each integration needs its own UI or client setup and appropriate authentication; adding a model credential does not create that integration.

For a deployed application, explore SAP AI Core as the model connection. You need an AI Core service instance, authorized model access and server-side credentials/service binding supported by your installed CAP agents version. Check the current documentation through CDS MCP before configuring it. Keep credentials out of the browser, prompts and Git. The local connection used in this course is not proof of cloud access.

Resources (opened 2026-10-01):
- [CAP agents configuration](https://cap.cloud.sap/docs/guides/ai/cap-agents#configuration) — SAP AI Core model configuration and development credential discovery.
- [Subagents via A2A](https://cap.cloud.sap/docs/guides/ai/cap-agents#subagents-via-a2a) — communication between CAP agents, with the XTravels example.
- [CAP agents](https://cap.cloud.sap/docs/guides/ai/cap-agents) — preview, approvals and runtime capabilities. These features are version-sensitive; follow the installed version.

Then follow COURSE-WRAP-UP.md and finish with Happy Building!!!!
