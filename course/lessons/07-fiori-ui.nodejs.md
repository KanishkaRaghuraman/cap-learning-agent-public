# Lesson 7 — Prompt for a Fiori Elements UI (Node.js)

## Learner activity and example

Ask for a Fiori interface to browse incidents and open their details. You can ask how the interface uses the CAP service.

**For example:**
> Generate and verify the course Fiori incident list and detail pages using the existing service.

Apply `course/docs/LEARNER-PROMPTS.md` to **every** subsequent prompt instruction in this lesson, including follow-ups and recovery. The technical recipes below guide implementation; present each learner task with its own brief explanation and example rather than copying the recipe verbatim.

> **Internal one-chat pacing (do not read source labels aloud):** Follow AGENTS.md and course/BUILDER.md. Full path uses this canonical lesson; short path reuses canonical10/11/12 as display1/2/3. Its setup uses prerequisites and the bundled starter per course/docs/SHORT-STARTER.md, never lesson replay. Explain each learner-authored activity with a concise **For example:** prompt; routine setup, terminal startup and preview instructions need no copied prompt; implement the learner’s request, verify and explain actual results. The recipes below are internal guidance.

## Step 7.1 — Describe the UI you want

### [TEACH]

“A Fiori elements List Report shows incidents; an Object Page shows one incident and its conversation. The service model supplies the data, while annotations describe how those pages present it. Your build prompt specifies the visible outcome.”

Ask the course agent for this activity; adapt the example to what you want to explore.

**For example:**
> Generate and verify the course Fiori incident list and detail pages using the existing service.

### Internal implementation recipe — not a learner prompt

Create a Fiori elements incidents List Report with title, urgency and status visible from source annotations in a fresh session. Add an incident Object Page with its title as a meaningful header, details and a conversation table; if child navigation exists, its detail page must show message and author. Use the actual CAP service/navigation and the official Fiori MCP generation/modification workflow. Inspect existing UI first, avoid duplicates, install any newly generated dependencies, run both the model/application build and a UI5 application build (discover the generated scripts or documented local UI5 CLI build), run lint/manifest validation, and verify the running UI. Record each as a separate actual command/result; a dev server or CDS compile is not a UI5 build. Verify from a new browser session as well as the current one: required columns/labels must come from current service metadata, not a cached session or personalization. Align the configured framework and served preview resources to a coherent supported UI5 version using the installed tooling documentation; do not mix a pinned local framework with an unversioned CDN as a guessed repair. Discover CLI commands through package scripts or installed help before using them. Fix generated omissions within this requested scope. Return actual paths, preview URL and observed checks. Do not add urgency colors or partner-picker changes yet. If lint requests a manifest-version migration, read the official target-version migration guide before editing; check removed properties, asynchronous loading and actual UI5 compatibility. Never treat a version-number-only edit as sufficient without those checks and a rendered UI test.

For browser navigation checks, click the actual visible row/navigation control and verify the destination, then check conversation navigation where available. A deep link or programmatic router call may help diagnose a failure but cannot count as a passing click-flow test.

For any change to an existing or just-generated Fiori app, first call list_functionality, then get_functionality_details for the relevant operation, then execute_functionality. A just-generated app is now an existing app. Only use a minimal direct annotation edit when live functionality discovery proves no suitable operation and official guidance supports the edit; record that evidence.

Apply shared grounding, ownership and evidence safeguards in course/BUILDER.md.

### [CHECK]

Implement the bounded learner request in this course chat. No reportback or copied logs. Explain actual results before the next checkpoint.

## Step 7.2 — Builder generation and verification contract

Require lesson 6's actual runtime checks. Inspect the model via MCP, real metadata and actual navigation (`messages` in the course model, not the target entity name). Use the discovered initial-generation tool schema; never invent operation IDs or parameters. For an existing app, follow `list_functionality` → `get_functionality_details` → `execute_functionality`. If a connected server has no suitable operation for a required annotation, obtain exact official annotation guidance and apply the minimal source correction allowed by `course/BUILDER.md`; a disconnected connector is not permission to bypass it.

Verify generator discovery in the configured npm prefix. Inspect generated manifest, component/bootstrap, annotation and configuration files. Verify service data source, List Report/Object Page routes, annotations loaded into metadata, readable Title/Urgency/Status labels, incident columns and the conversation facet plus child form. The incident header must show its title rather than just its UUID; verify the documented `UI.HeaderInfo` with `Title.Value: title` against current CAP guidance before adding a missing annotation. Preserve a correct existing header. A route alone is not a table facet. Install project dependencies added by the generator and recheck engine compatibility now; lesson 0 cannot pre-install dependencies that the generator has not selected yet. Use latest stable compatible fresh dependencies via current sources, not blind upgrades or frozen historical pins. Preserve the accepted toolchain and ask before machine-wide changes.

Run model/app build and UI5 lint. If manifest migration is actually required, inspect the actual target's official migration guide, removed properties and synchronous configuration before changing the version. Do not patch a version string blindly. If files are missing, diagnose target/process/error, then retry generation only when it cannot overwrite work. Do not claim an unobserved Windows-specific timing bug.

For Node.js, inspect the generated app scripts and serving configuration. A direct index may render with unsupported preload/LREP requests; use the actual documented preview route/proxy if needed, with `/odata` mapped to the backend, not the preview's own port.

### [VERIFY] Agent-owned UI checks

- Actual service data and metadata available; application loads without blocking console/network errors.
- Fresh list shows title, urgency and status from source. Do not “fix” absent columns using personal table settings.
- Selecting an incident opens its Object Page with the readable incident title and expected conversation records.
- Navigable message detail shows message/author, not only UUID and Edit.
- Any demonstrated draft/save flow works against the actual service.

Use browser tools for required visual checks when available. API success alone is not a rendered-screen result. If browser access is unavailable, record that exact missing technical capability; do not replace it with mandatory learner data transcription or claim an unseen UI passed. An optional learner screenshot can be labelled learner-reported. Preserve and distinguish nonblocking upstream tooling diagnostics; never suppress logs to make a claim of zero errors.

## Step 7.3 — Review the application

### [TEACH]

Point to the actual manifest's service/navigation and annotation source controlling the pages. Offer the working preview link for exploration. No file-location quiz, extra acknowledgement, or manual server command is required. Explain how the prompt's visible requirements map to what was generated.

## [SAVE PROGRESS] Course checkpoint

Inspect supporting files/results directly. Missing checks remain pending; repair within scope and never invent completion. Explain the actual outcome briefly.

Save and read back `memory-bank/activeContext.md` then `memory-bank/progress.md` under the root contract, preserving runtime/platform, actual paths, current step, next action and pending technical checks. The same course agent saves state after evidence review. Foundation preparation grants no studied-lesson credit. Skipped optional exploration/questions do not create pending checks. A required unavailable tool or failed functional check does. Summarize the concept and actual result in a few sentences, then stop.

At a verified checkpoint invite the next bounded activity.

**For example:**
> Continue to the next step.

## For more detail

- [Official reference 1](https://cap.cloud.sap/docs/guides/uis/fiori#fiori-annotations)
- [Official reference 2](https://github.com/SAP-docs/sapui5/blob/main/docs/04_Essentials/migration-information-for-upgrading-the-manifest-file-a110f76.md)
- [Official reference 3](https://cap.cloud.sap/docs/cds/aspects#all-in-one-models)

These links are reference entry points, not evidence that a live lookup or learner test succeeded.

For learner preview and exploration, use business-partner names and incident titles. Keep UUIDs in technical mappings and automated checks, not as something the learner must copy. If several incidents match a partner, ask which title they mean.
