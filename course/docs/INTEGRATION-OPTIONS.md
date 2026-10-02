# Where this assistant can be used

This is a uses overview, not a list of endpoint addresses. Name the editor-client, compatible external-client and optional Fiori possibilities in plain language; give a technical URL only when needed for an actual connection.

Briefly explain after the successful business-action recap:

“You have an MCP service for reading incidents and calling the business action. The browser preview talks to your CAP assistant, which uses those tools. You can also connect an MCP-compatible editor to the MCP service, let another compatible client talk to the assistant, or add its chat inside Fiori.”

Keep the protocols distinct: `/mcp/incident-agent` is the application MCP endpoint; `/a2a/incident-assistant` is the assistant's A2A endpoint; `/a2a/incident-assistant/preview/` is the browser UI. Use the current running origin, never an old port. External clients need support for the selected protocol and configured authentication/roles. Do not promise that any named agent framework works without its adapter/configuration being checked.

This overview does not install new clients or change course completion. Follow the current route's completion/optional-choice rules.
