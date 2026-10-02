> Current interaction: one course chat; Build a CAP app or Explore MCP and agents. Source checks do not prove learner-flow success; user testing is pending. See AGENTS.md.

# Set up the learning workspace

Use the same course in a coding agent that can read project instructions, work with local files, run permitted commands and use MCP tools. The editor alone does not supply those capabilities. The course does not provide model access or require a particular model vendor.

## 1. Open the course and configure model access

Open the course root—the folder containing `AGENTS.md`, `course/lessons/` and `course/BUILDER.md`. Choose and authenticate your agent/model using its supported public account settings. Keep credentials in the client's credential settings, not course files. Check your account's costs and usage limits.

- **Cursor Agent:** root AGENTS.md is supported. Use its agent chat and a model with the required tool support. [Instructions](https://cursor.com/docs/rules)
- **VS Code:** select the actual coding agent, such as Copilot, Codex or Claude Code. Instruction and tool loading depend on that agent, not just VS Code. [Instructions](https://code.visualstudio.com/docs/agent-customization/custom-instructions)
- **Claude Code:** CLAUDE.md imports AGENTS.md; it is not a separate course engine. [Instruction loading](https://code.claude.com/docs/en/memory)
- **Other agents/editors:** explicitly ask the agent to read AGENTS.md. Confirm workspace, terminal and MCP support before proceeding. Automatic compatibility is not assumed.

Use one course chat under AGENTS.md. Build a CAP app has lessons0–12 and chooses Java/Node.js after the introduction; Explore MCP and agents has lessons0–3 and installs the Node.js starter after prerequisites using SHORT-STARTER.md. Explain each learner-authored activity with **For example:** and a concise adaptable prompt; routine operational instructions need no copied prompt. Native checks remain required. Final12 is hands-on application MCP in both runtimes, without an additional API key; never convert runtime silently. Optional Node.js Fiori embedding requires learner choice and reuses the already verified model connection; no separate API key is required when that connection works.

Ask the agent to start after workspace/account setup.

**For example:**
> Read AGENTS.md and start the CAP learning journey.

If VS Code opens the folder in Restricted Mode, review the course files and trust only this course folder to enable terminals and coding extensions. Confirm that the actual agent is signed in before starting; installing an extension does not provide model access.

## 2. Prerequisites and change scope

Both tracks need Node.js/npm for CAP development tooling and the MCP servers. Use a supported Node.js LTS meeting the dependency engine requirements; Node 24 is this candidate's initial verification environment. Java additionally needs a supported JDK and Maven. Follow [CAP's current initial setup](https://cap.cloud.sap/docs/get-started/#initial-setup) and the chosen CAP Java release's prerequisites. Do not assume an old minimum still satisfies a newly installed release.

Full lesson0 and the short starter task use the same setup requirements: check versions and latest stable compatible releases first, then perform agreed routine workspace setup. Short setup precedes bundled-starter installation, never a hidden lesson replay. It offers the exact system/global changes and their scope when needed. Existing supported versions can be retained. It does not overwrite existing configuration or silently change global packages. The CLI and Fiori generator may be global npm installations; model credentials remain client-managed; the MCP configuration below is project-scoped. `npx` may download packages to the npm cache on first use.

Candidate commands and versions are listed in [TOOL-VERSIONS.md](TOOL-VERSIONS.md). A registry version is not a statement that every course/client combination has passed testing.

## 3. Configure the development MCP servers

The credential-free examples in `course/docs/mcp/` define:

| Server | Package | Purpose |
|---|---|---|
| cds-mcp | `@cap-js/mcp-server` | CAP documentation and current model lookup |
| fiori-mcp | `@sap-ux/fiori-mcp-server` | Fiori elements generation and modification |
| ui5-mcp | `@ui5/mcp-server` | UI5 guidance and checks |

These are development tools, not an LLM provider or the application-service MCP adapter.

**Choose one configuration route for your actual agent. Do not install the same server in every available scope.** Review the JSON, back up any existing file and merge only missing server entries. If an existing entry differs, inspect it and agree which definition to use; do not silently replace it.

| Client | Example | Destination |
|---|---|---|
| Cursor Agent | [portable.json](mcp/portable.json) | `.cursor/mcp.json` in the course root |
| VS Code agent supporting workspace MCP | [vscode.json](mcp/vscode.json) | `.vscode/mcp.json` in the course root |
| Claude Code | [portable.json](mcp/portable.json) | `.mcp.json` in the course root |
| Codex in VS Code | [codex.toml](mcp/codex.toml) | `.codex/config.toml` in the course root; trusted project |

For another VS Code extension or a different agent, use its documented MCP configuration format. Do not copy the `servers` object where `mcpServers` is required, or assume a JSON file works in a TOML client. Codex setup is documented [here](https://learn.chatgpt.com/docs/extend/mcp?surface=cli); the TOML example uses the same server commands. Restart its extension after merging settings and verify actual tools. VS Code workspace MCP JSON is not automatically shared with every extension.

Review and enable the servers using the client's own trust/permission controls. No configuration example disables approvals, inserts credentials or changes global rules. The course reads `course/BUILDER.md` locally.

On native Windows, if the client cannot launch `npx`, the server publishers document using `cmd` with `/c`. Adapt each entry's command to `cmd` and prepend `/c`, `npx` to its existing argument list, then test it. Do not apply this wrapper on macOS/Linux/WSL. The native Windows Node route and live MCP probes were exercised on JD; see the dated Windows feedback validation report for scope.

### Keep the Fiori generator in an isolated npm prefix

Fiori MCP 1.13.0 discovers the generator through the npm global package root. Merely installing it under an arbitrary local `node_modules` folder is insufficient. Use a course-local prefix by default. npm’s `--global` flag below selects its directory layout; the explicit `--prefix` keeps files inside this workspace and does not alter the machine’s normal global installation. Resolve the current stable compatible version before installing; the version below is a dated example:

```sh
npm install --global --prefix "$PWD/.course-tools" @sap/generator-fiori@1.32.0
npm_config_prefix="$PWD/.course-tools" npm list --global @sap/generator-fiori --depth=0
```

This uses npm's global directory layout inside `.course-tools/`; it does not change your normal global prefix. In the **Fiori MCP server's** environment configuration, set `npm_config_prefix` to the absolute `.course-tools` path from this command. In Codex, add an `[mcp_servers."fiori-mcp".env]` table; in JSON clients, add an `env` object to that server entry. Merge rather than replace existing settings, then restart the connection. The course agent writes the actual local path into the selected client’s project configuration; do not commit that machine-specific configuration.

Verify the server and generator use the same prefix. This route was exercised using an isolated test prefix and actual Fiori generation. A package-presence check alone still cannot replace the lesson's generated-file and UI checks.

## 4. Verify real connections

Have the agent discover its available tools and run a small read-only operation from each server:

1. CAP: search official docs for the selected runtime's project setup; confirm a substantive result with an official source URL. The tool schema must be discovered, not guessed.
2. Fiori: retrieve its documentation or capability list and details. No application exists yet; do not generate one during this check.
3. UI5: retrieve the server's guidelines. Confirm a real response rather than a configured name.

Record the observed server/tool availability in the local active context. Once a model exists, verify CAP model search targets the generated app. Once the Fiori lesson runs, verify actual generated files and browser results. A connected label is only a connection check.

If any required operation fails, follow [troubleshooting](TROUBLESHOOTING.md). Do not mark setup complete or invent replacement output. After restarting a server/client, reissue the failed read-only probe and resume from saved state.

## 5. Undo setup changes

Restore backed-up project configuration or remove only the server entries added for this course. Preserve unrelated entries. No global rule copy needs removal. If you explicitly installed a new global npm package for the course, record its prior state; uninstall it only if it was not previously used, or restore the prior version. Keep your generated app and progress unless you choose to reset them.

## Sources

Opened 2026-09-24: [CAP server](https://github.com/cap-js/mcp-server), [Fiori server](https://github.com/SAP/open-ux-tools/tree/main/packages/fiori-mcp-server), [UI5 server](https://github.com/UI5/mcp-server), [Cursor MCP](https://cursor.com/docs/mcp), [VS Code MCP](https://code.visualstudio.com/docs/agent-customization/mcp-servers), [Claude Code MCP](https://code.claude.com/docs/en/mcp).

Configuration formats were checked against these sources. Editor-specific end-to-end setup remains a separate validation task; see [VALIDATION.md](VALIDATION.md).

## Automated setup and diagnosis

On a fresh checkout, the course agent first runs `npm ci` from the course root to install the locked helper dependencies. This workspace-local bootstrap does not install global tools or configure MCP. The course agent can then run `npm run setup -- claude --plan` to inspect current registry versions, engines and configured scopes without changing them. The selected client setup resolves current stable CDS/Fiori packages once, writes concrete versions and preserves existing files as `.suggested` alternatives. Do not leave conflicting duplicate definitions unexplained. The installed UI5 dependency uses a tested, hash-checked schema workaround until upstream is verified. Latest stable does not mean ignoring an incompatible engine or unverified dependency.

The course agent may use `course/scripts/probe-mcp.mjs` for direct configured-server diagnostics. Direct process probes are distinct from the coding client's active connection; also inspect actual tools in that client. An import-only project before lesson 3 may have no root-resolvable model yet. Verify the imported file and official recipe, then search the model after creating the first scripted schema.

## Current presentation and server ownership

Offer Build a CAP app or Explore MCP and agents. The latter starts routine prerequisite/install work immediately after selection. Follow SHORT-STARTER.md: install dependencies, provide local terminal commands, wait for the learner to start CAP, check HTTP and request manual preview. Never start an agent-owned preview server for this setup. Show only learner-facing lesson numbers; canonical/full/short source terms above are internal. Example prompts apply to learner-authored requests, not routine terminal or permission instructions.
