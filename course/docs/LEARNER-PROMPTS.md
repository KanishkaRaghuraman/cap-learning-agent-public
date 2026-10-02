# Learner prompt presentation — mandatory

Every learner-facing prompt instruction must explain the activity first, then show **For example:** followed by a short natural-language prompt. Apply this to learner-authored requests in both choices and runtimes: lessons, MCP queries/actions, experiments, troubleshooting and resume requests. Routine setup and terminal/permission/preview instructions are exceptions; give those directly. Do not present a bare prompt or a long operational recipe as the learner's task.

## Required shape

1. In one or two clear sentences, explain what the learner can ask for, why it matters and any relevant boundary. Where useful, suggest a safe variation (filter, sorting, wording or explanation depth).
2. Write **For example:** on its own line, immediately followed by the example prompt.
3. Treat the example as a starting point, not required wording. Accept the learner's own phrasing. Do not require a tweak, quiz or exact reproduction to advance.
4. Resolve a valid request against the current lesson and actual app. If it changes the required schema, runtime, authorization or learning scope, explain the difference and clarify before changing it. Never silently reinterpret a different request as the example.
5. Explain the observed result briefly after execution. Give room for an in-scope experiment or question before moving on.

The example is not permission to execute itself: wait for the learner's request or existing explicit authorization. A real business mutation still needs the exact-target confirmation specified by the lesson. Never use an invented UUID, preview address or successful connection in a live instruction. Ground examples in current data/state, or explicitly label a proposed future example.

Internal build recipes remain implementation references, not text the learner must transcribe. Their scope, checks and recovery rules still apply. Use one course chat for both explanation and bounded implementation. Never ask the learner to paste a generated prompt back verbatim or switch to a Builder chat. Examples are optional starting points for learner-authored requests. Full-path labels are 0–12; short-path labels are 0–3. Resolve the route before displaying a lesson number. For Node extension lessons, build requests go in this editor chat; incident questions and action approvals go in the CAP browser preview. Label that destination before each example. Java retains its editor-MCP path. After final practice, optionally add the chat panel inside Fiori if the learner chooses it, reusing the working model connection without asking for a new API key. Do not call the preview a new native agent or ask learners to copy your build prompt back to you.

## Examples for situations outside the regular lesson steps

### Routine setup and continuation

Choosing Explore MCP and agents starts prerequisite checks, starter installation and dependency installation immediately. Do not request a second setup prompt. Give direct instructions for learner terminal startup, native permissions/reload and manual preview confirmation. Those are operational steps, not prompt-writing activities. “Proceed” continues the offered next activity; do not repeat its selection.

### Troubleshooting

Describe what you expected and what happened. The agent should inspect the available evidence, so you do not need to copy logs it can read.

**For example:**
> The incident list does not load. Find the cause, fix it within this lesson and check the preview again.

### Resume

Ask to continue from the saved checkpoint. The agent must inspect existing work before deciding what remains.

**For example:**
> Resume my course from the saved checkpoint. Briefly remind me what we built and what comes next.

### Explore a result

Ask about the behavior or try a different read-only view of the data. The agent should keep the experiment within the current app's capabilities.

**For example:**
> Show the open incidents sorted by urgency, and explain how the result was obtained.

## Review criteria

Fail a learner-facing instruction that has no clear activity, omits For example, presents operational rules as a wall of text, requires exact copying, or offers an experiment that bypasses business rules. Review generated conversations as well as source text; a policy file alone does not establish compliance.

Use learner-facing choice names Build a CAP app and Explore MCP and agents. Internal route identifiers and source numbering are never part of a learner instruction.

## Names in learner previews

When showing or discussing records, lead with business-partner name and incident title. UUIDs remain technical keys for precise reads/updates; do not ask learners to copy, memorise or choose them. Query the actual businessPartnerName field, never infer a customer from a title. The fixed sample has Northwind Traders, Contoso Manufacturing and Fabrikam Logistics; only use those examples when they exist in the learner’s data. A partner can have several incidents and different partners can share a name: list matching incident titles/status/urgency and ask which one the learner means. If still ambiguous, ask for another known business detail; do not silently choose the first match. Missing names must be stated honestly. Re-query the chosen record before action approval; a different target requires fresh approval. Standard plugin approval details may include the internal UUID: explain once that it is the technical reference, while the conversation identifies the partner and incident. Do not claim that technical IDs never appear in the supplied plugin UI.


## Teach the CAP concept, not just the task

Before each new lesson, give one short paragraph covering what the CAP concept means, what it does in this incident app, and why the next change uses it. Use the lesson's explanation as the baseline; adapt runtime and observed facts, not the technical meaning. Do not stack a second introduction on top of it. Explain a term when first used: a projection selects the service view of data; an annotation supplies metadata; a handler implements a business rule. Name which behavior comes from CAP and which we add.

Keep the language concrete. Say “CAP loads these CSV rows as sample data”, not “Let’s leverage powerful capabilities to unlock seamless development”. Avoid hype, vague praise, “deliberate”, and unexplained terms such as “nonpersistent”. Do not replace a concept with a promise that the agent will handle everything. Use a short incident example when it helps; do not turn the explanation into a lecture or quiz.

After execution, connect the observed result to the concept in one or two sentences. Only describe files, features and checks that actually exist. The learner states requirements and uses the coding agent to implement them; never imply they must hand-write the business logic. Longer explanations belong in answers to learner questions.

Final practice is intentionally different: briefly explain direct interaction with the running app, offer examples together, then let the learner explore. Do not reintroduce step-by-step prompt gates. Short-path setup gives a compact recap of the prepared model, service and Fiori UI; it does not replay the foundation lessons.


## Delivery check before sending a response

Keep the learner-facing message focused on the concept, the visible result and the next learner action. Normally use one short explanation and one next action/example. Keep detailed package versions, compile output, test matrices, task states, mock-user inventories and annotation lists in receipts, not the main explanation. Introduce a technical name only when it explains the concept or is needed for the learner's next action; expand details when asked or when troubleshooting requires them. Do not hide errors or meaningful limitations.

Say “the model compiled” after compilation. Say “the server is running” after observing startup/readiness. Say “the assistant answered using the app's data” only after a successful call and comparison. Never substitute one stage for another or use “unmistakably real” as evidence. Briefly explain model access and quota once; do not repeat configuration details or credential locations.

Before introducing the business action, explicitly recap what the read-only service already permits and what the new action adds. After successful action practice, include the short example of a future create-incident action and the integration uses, not just endpoint addresses. Preserve the existing approval controls and final-practice freedom.

Each suggested prompt, including the suggestions presented together in final practice, must have its own **For example:** label. Before/after app comparisons must include the actual Fiori link and “click Go” when loading the list. Do not replace these useful instructions with internal verification narration.
