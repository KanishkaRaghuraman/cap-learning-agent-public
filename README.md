# CAP Learning Agent

> Release candidate licensed under Apache-2.0, copyright 2026 SAP SE. SAP API metadata is not bundled; full-path learners download it from SAP Business Accelerator Hub. See [release checklist](RELEASE-CHECKLIST.md).

Build an Incident Management app and learn how CAP, application MCP and an embedded agent fit together. One course chat explains each activity, gives a short adaptable example, implements your request and explains the checked result. You can experiment, ask why, pause and resume.

## Start

Open this entire folder in your coding environment. Follow [agent/MCP setup](course/docs/AGENT-SETUP.md), then ask your course agent to start.

**For example:**
> Read AGENTS.md and start the CAP learning journey.

Choose **1 — Build a CAP app** or **2 — Explore MCP and agents**. The first option introduces CAP, explains runtime differences and then asks Java or Node.js. The second option uses Node.js and prerequisite checks followed by installing a bundled app. You start it in your terminal, then the agent checks its HTTP endpoints and asks you to preview it; it does not replay the full course.

| Build a CAP app | Explore MCP and agents |
|---|---|
| 0 setup;1 project;2 metadata import;3 model/service;4 sample data;5 rules;6 run;7 Fiori;8 annotations;9 value help | 0 prerequisites, install starter, HTTP readiness and manual preview |
| 10 connect/query application MCP | 1 connect/query application MCP |
| 11 controlled business action | 2 controlled business action |
| 12 use your agent with application MCP | 3 use your agent with application MCP |

Node.js extensions use the CAP browser assistant: connect/read, approve a business action, then practise questions and check the answers. The preview needs verified model access; compatible local Claude/OpenCode credentials may work, but a subscription alone is not enough. Afterward, optionally add the same chat inside Fiori if you want to, reusing the model connection already working in the preview; no new API key is required. Java retains the editor-MCP exercises because CAP Java does not yet support the preview action approval used here. See course/docs/BROWSER-ASSISTANT.md and course/docs/JAVA-MCP-PATH.md. Finish either branch with resources and Happy Building!!!!.

The app lives in IncidentManagement/ with synthetic local data. Imported SAP metadata is not a live SAP connection. Model access, native tool trust and account settings remain your own; never paste credentials into course files.

Ask to resume your saved app in the same course chat or a new chat opened on this folder.

**For example:**
> Read AGENTS.md and resume my existing course.

[AGENTS.md](AGENTS.md) is the teaching/state contract; [course/BUILDER.md](course/BUILDER.md) contains internal implementation guidance. [Route details](course/docs/TWO-ROUTES.md), [extension guide](course/docs/EXTENSION-GUIDE.md) and [short starter setup](course/docs/SHORT-STARTER.md) explain the shared sources.

This distribution excludes downloaded SAP API specifications. The single-chat revision has source-level checks; user-led learner-flow testing is pending. Historical evidence in [validation](course/docs/VALIDATION.md) and [Windows feedback](course/docs/WINDOWS-FEEDBACK.md) does not establish the revised flow. See [release status](course/docs/RELEASE-STATUS.md).

## Folder layout

- `course/` — lessons, guidance, extension recipes, starter app, setup helpers and maintainer tests.
- `IncidentManagement/` — your working application (created during the course).
- `memory-bank/` — your saved progress and evidence; kept in place for existing sessions.
- `AGENTS.md` and `CLAUDE.md` — agent entry points.
- `package.json`, lockfile and `LICENSE` — installation and licence metadata.

Installed dependencies and CAP caches are hidden in VS Code Explorer but remain available to the tools.


## Install from a clean download

Open the extracted repository folder in your editor. Install its development dependencies with `npm ci` (or `npm.cmd ci` in Windows PowerShell). Then follow [agent setup](course/docs/AGENT-SETUP.md). For the automated setup helper, choose only your actual agent: `npm run setup -- claude`, `npm run setup -- codex`, `npm run setup -- vscode`, or `npm run setup -- cursor`. Review the generated project configuration and verify the tools in your client. The helper may create machine-local paths on your computer; do not commit that configuration.

No dependencies, generated application, account credentials or learner progress are distributed. The IncidentManagement folder is created during the course. Both routes require compatible Node.js/npm and a working CDS CLI; Java additionally requires a compatible JDK and Maven. See the setup guide for current requirements. The package currently requires Node.js 24.15 or newer; select a supported LTS satisfying all installed packages.

## Support boundaries

The coding agent must support local files, terminal commands and MCP tools; compatibility with every editor/model is not claimed. Node.js includes the CAP browser assistant and optional Fiori panel. Java uses the documented editor-MCP path and does not include that Node browser/HITL integration. Model access must be verified; a subscription alone is not proof. This is a local learning application with synthetic data and development authentication, not a production deployment template.

## License

Copyright 2026 SAP SE. Licensed under [Apache-2.0](LICENSE). See [NOTICE](NOTICE) for attribution.
