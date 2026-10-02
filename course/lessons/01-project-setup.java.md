# Lesson 1 — Scaffold the Application (Java)

## Learner activity and example

Ask the agent to create the initial CAP project for your selected runtime. You can ask it to explain the generated folders.

**For example:**
> Create the Incident Management CAP project for my selected runtime and explain the purpose of its main folders.

Apply `course/docs/LEARNER-PROMPTS.md` to **every** subsequent prompt instruction in this lesson, including follow-ups and recovery. The technical recipes below guide implementation; present each learner task with its own brief explanation and example rather than copying the recipe verbatim.

> **Internal one-chat pacing (do not read source labels aloud):** Follow AGENTS.md and course/BUILDER.md. Full path uses this canonical lesson; short path reuses canonical10/11/12 as display1/2/3. Its setup uses prerequisites and the bundled starter per course/docs/SHORT-STARTER.md, never lesson replay. Explain each learner-authored activity with a concise **For example:** prompt; routine setup, terminal startup and preview instructions need no copied prompt; implement the learner’s request, verify and explain actual results. The recipes below are internal guidance.

## Step 1.1 — Understand the starting point

### [TEACH]

“A CAP project separates the data model in `db`, services and business logic in `srv`, and the UI in `app`. The model describes the application rather than spelling out every database or HTTP operation. We’ll create the project for your chosen runtime; the business model and UI will come in later lessons.”

Ask the course agent for this activity; adapt the example to what you want to explore.

**For example:**
> Create the Incident Management CAP project for my selected runtime and explain the purpose of its main folders.

### Internal implementation recipe — not a learner prompt

Create IncidentManagement as a CAP Java project using the official Java scaffold. Preserve any existing project. Inspect the generated Maven modules, JDK target, Spring Boot configuration and embedded H2 setup. Install/resolve project dependencies and perform a build plus startup smoke check. Do not add the incident model or sample app yet.

Apply shared grounding, ownership and evidence safeguards in course/BUILDER.md.

### [CHECK]

Implement the bounded learner request in this course chat. No reportback or copied logs. Explain actual results before the next checkpoint.

## Step 1.2 — Internal implementation and checks

The agent works in the actual course root for scaffolding and in `IncidentManagement/` for application commands. Resolve current compatible stable packages through live sources for fresh dependencies; preserve the accepted existing toolchain and lockfile. Do not create a second app if resuming.

Use the grounded `cds init IncidentManagement --java` recipe. Inspect actual `pom.xml`, service module and runtime configuration, not a remembered tree. Use the generated Maven wrapper when available or verified Maven. A compile smoke build such as `mvn clean install -DskipTests` is not evidence of passing application tests. Start using the project's documented Spring Boot command from the application root (`mvn spring-boot:run`). With the generated CAP Java 5 reactor, selecting only `-pl srv` can fail ReactorModuleConvergence because its parent is omitted. If selecting the service module, include its reactor dependencies with `-pl srv --also-make`; never disable the enforcer to hide the failure. Require evidence from the actual generated POM and current MCP guidance before changing this recipe. For startup verification, require a live listener and HTTP response at its observed URL. Maven can print BUILD SUCCESS even after an application startup failure: inspect `Application run failed` and process liveness. The default port is 8080, but use the actual port. After later CDS changes, rebuild generated resources before restart; do not assume Java class reload watches CDS. H2 is embedded; do not install SQLite for the Java backend.

Stop only a smoke process the agent started, and preserve other running work. Record its PID/process tree before stopping it and verify the command belongs to this workspace. Never use a port-wide command such as `kill $(lsof -ti:8080)`; a port number alone is not proof of ownership. Report the generated structure and actual checks without copying a long terminal log into the teaching chat.

## Step 1.3 — Review the result

### [TEACH]

Point to the actual generated folders and runtime manifest in the agent's output. The Java scaffold may contain only db/ and srv/; describe app/ as the UI layer added later if it does not yet exist. Do not call the Spring Boot entry point a third CAP layer. Explain that this is a scaffold, not a business application yet. The learner may browse those files in their **code editor**; no directory-listing answer or manual command is required.

## [SAVE PROGRESS] Course checkpoint

Inspect supporting files/results directly. Missing checks remain pending; repair within scope and never invent completion. Explain the actual outcome briefly.

Save and read back `memory-bank/activeContext.md` then `memory-bank/progress.md` under the root contract, preserving runtime/platform, actual paths, current step, next action and pending technical checks. The same course agent saves state after evidence review. Foundation preparation grants no studied-lesson credit. Skipped optional exploration/questions do not create pending checks. A required unavailable tool or failed functional check does. Summarize the concept and actual result in a few sentences, then stop.

At a verified checkpoint invite the next bounded activity.

**For example:**
> Continue to the next step.
