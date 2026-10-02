# Lesson 0 — Set Up the Development Environment (Java)

## Learner activity and example

Ask the agent to check the development tools and MCP connections for your selected runtime. You can ask what a tool is for before agreeing to any required setup change.

**For example:**
> Check my development environment for the selected course runtime. Explain what is missing, then help me set up and verify the required tools.

Apply `course/docs/LEARNER-PROMPTS.md` to **every** subsequent prompt instruction in this lesson, including follow-ups and recovery. The technical recipes below guide implementation; present each learner task with its own brief explanation and example rather than copying the recipe verbatim.

> **Internal one-chat pacing (do not read source labels aloud):** Follow AGENTS.md and course/BUILDER.md. Full path uses this canonical lesson; short path reuses canonical10/11/12 as display1/2/3. Its setup uses prerequisites and the bundled starter per course/docs/SHORT-STARTER.md, never lesson replay. Explain each learner-authored activity with a concise **For example:** prompt; routine setup, terminal startup and preview instructions need no copied prompt; implement the learner’s request, verify and explain actual results. The recipes below are internal guidance.

## Step 0.1 — Inspect and choose compatible current tools

### [TEACH]

“CAP uses a CDS model to describe your data and services, then its runtime handles common application behavior. The CDS command-line tools help create and run the project. We’ll also connect the CAP, Fiori and UI5 development tools so the coding agent can consult their documentation and generators while you build.”

### [BUILD PROMPT]

Identify the real OS/shell without assuming Node is already present. Inspect Node, npm, CDS CLI and Fiori generator availability/version; check PATH and the npm prefix used by the active MCP server. Check both project and user MCP scopes for duplicate names and effective precedence before altering configuration. Preserve unrelated/global entries. Also inspect `java --version` and `mvn --version`, the intended JDK on PATH, and current CAP Java generation/build requirements. Select the latest stable supported JDK/Maven combination compatible with current CAP tooling; do not pick the highest JDK major merely because it exists. Preserve an existing compatible installation if the learner declines an optional update. Check the generated POM again in lesson 1. Java uses the JVM for the backend and Node.js for CDS/MCP/Fiori tooling.

Before invoking the course setup helper on a fresh checkout, run `npm ci` in the course root to install its locked dependencies. Do not run the helper before dependencies exist; keep package-script protections enabled.

Use current official setup documentation and authoritative package metadata to resolve the **latest stable compatible** versions for fresh installations. Prefer a supported Node LTS satisfying all selected package engines. A date in `course/docs/TOOL-VERSIONS.md` is historical test evidence, not a required version or reason to downgrade a newer compatible machine. Do not install prereleases or force every package to its highest number regardless of compatibility. If installed tools are older, show the current/available versions and ask once whether to update; respect a compatible keep-existing choice. Explain a genuine incompatibility and its minimal required change separately.

## Step 0.2 — Install and connect

### [BUILD PROMPT]

Perform the agreed missing-tool installations/updates using current official routes. Keep application dependencies workspace-local. The CDS CLI is a command-line prerequisite in both routes: follow https://cap.cloud.sap/docs/tools/cds-cli and install a stable compatible @sap/cds-dk globally with npm install -g @sap/cds-dk after the learner agrees to its machine-level scope. Reuse an existing compatible CLI. A project-local dependency alone does not satisfy this prerequisite. Before any global installation or user-level configuration change, explain its scope and obtain a specific learner choice. Record previous versions and recovery scope; a global install affects other projects. Do not bypass permission or package-script protections. Recheck actual executable versions afterward; resolve PATH/restart needs. The learner does not need to copy terminal commands or paste their output.

Configure the selected coding client's workspace MCP connections using `course/docs/AGENT-SETUP.md`, after reconciling its examples with current stable package metadata and client schemas. Preserve other servers and credentials. Check generator discovery under the same npm prefix as Fiori MCP; an arbitrary local package is not proof the generator is discoverable. Inspect the UI5 server's current validator support and any documented local patch against its actual version; do not apply a historical patch blindly. Do not change the learner's machine-global MCP configuration without an explicit choice.

If MCP is not installed yet, official installation documentation/package metadata can establish the connection. This bootstrap exception does not authorize application implementation without the required live development MCP. Ask the learner only for secure sign-in or a client reload the agent cannot perform; explain exactly what that user-only action enables.

## Step 0.3 — Verify and summarize

### [VERIFY]

In a fresh terminal with the same shell and Node version the learner will use, verify `cds --version` and `cds watch --help` resolve successfully. On macOS/Linux inspect `command -v cds`; on Windows inspect `Get-Command cds` and `where.exe cds`. Check the active npm global prefix and PATH if missing; reopen the editor terminal after a supported PATH repair. Do not disable PowerShell execution policy. Do not mark setup complete while `cds` is unavailable or silently substitute npx. Explain any unresolved terminal restriction and keep this prerequisite pending. Once an app exists, its normal start/restart command is `cds watch`.

Discover the actual CAP, Fiori and UI5 tool schemas. Verify a relevant CAP setup documentation response, Fiori documentation/capability details with generator discoverability, and UI5 guidelines/tool availability. Refine an irrelevant search without a confusing monologue about a tool “working but not working.” Preserve actual errors and diagnose them. Do not run model search on a nonexistent local application; validate it when lesson 3 creates `db/schema.cds`.

Inspect declared tool engines and dependency resolution; no ignored engine error or unapproved machine change. Never equate a saved config or handshake with a successful probe. A persistent required connector failure stays blocked with its exact evidence; do not send a guessed install/code recipe to get past it.

### [TEACH]

Give a short factual summary: what was installed/updated or kept, why each component matters, and which three connections actually passed. Do not claim all future generator features work from a read-only probe. Explain that this same chat handles the next bounded activity. Short-route setup is included in the single foundation task, not a sequence of lessons.

### [SAVE PROGRESS]

The course agent records actual runtime/platform, versions and native connection results, reviews evidence, then saves/readbacks state. Mark setup complete only when required checks pass. The full route pauses before project creation; short foundation continues within its already authorized specification scope, never a lesson replay.

For more detail: [CAP setup](https://cap.cloud.sap/docs/get-started/), [CAP Java prerequisites](https://cap.cloud.sap/docs/java/migration#minimum-versions).

## Setup activity in this course chat

Ask the agent to inspect and set up the required tools and native connections for your saved runtime. It handles supported installations and checks; you handle only genuine account, trust or reload choices.

**For example:**
> Set up and verify the course tools for my chosen runtime, preserving my existing settings. Explain any decision I need to make.

Complete only setup, record actual results and native reload status, review evidence and save progress. Do not create the guided app or advance to project creation yet.

## Explore setup transition (internal)

Choosing Explore MCP and agents starts prerequisite work immediately; do not request another setup prompt. For Node.js continue with course/docs/SHORT-STARTER.md after prerequisite checks. The learner starts their own preview terminal; the agent never starts an Explore setup server. Wait for startup, run HTTP readiness, and wait for manual preview confirmation before lesson1. Existing Java sessions retain Java; do not overwrite or silently convert them.
