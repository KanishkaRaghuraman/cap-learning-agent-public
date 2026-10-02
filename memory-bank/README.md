# Learner progress

The instructor creates `progress.md` and `activeContext.md` here from `templates/` after you choose a learning path and runtime. They are ignored by Git. Keep them when returning to the course; do not copy another learner's state.

`progress.md` owns course status (`not-started`, `in-progress`, `completed`) and the list of completed lessons. `activeContext.md` owns `runtime` (`nodejs` or `java`), `platform` (`darwin`, `win32`, `linux`), lesson number 0–11, exact current step heading, last completed step, last verified result and next action. `pendingChecks` records verification deliberately deferred to a later lesson, such as handler HTTP checks at first preview. A passed file check is not a passed runtime test.

Both carry `stateVersion: 1` and `courseRevision: feedback-123-2026-09-26`. Keep these in sync. Save active context first and progress second, then read both back. A partial save must be reported; reconcile against actual app files on resume. Do not advance or reinstall based on stale state.

Say **pause** to save or **resume** in a new session. Before switching clients, save and stop the old writer. With two chats, only the teacher writes progress; only the builder writes the app. Unknown revision/schema values need review rather than automatic reinterpretation.

Say **start over** to discuss reset options. Archive your two state files and generated app before resetting; the instructor must not delete them without your explicit choice. For an existing course, first copy the old state files as backups, preserve the selected runtime and completed lessons, and fill the missing version/step fields from observable workspace evidence. Uncertain completion stays pending. This format is intentionally plain Markdown, not a new learning platform.


## Learning paths and prepared prerequisites

`learningPath` is `guided` or `application-mcp` (`unselected` only in templates). `preparationStatus` is `not-started`, `in-progress`, `blocked` or `verified`. `preparedLessons` is `none` or the verified ordered lesson numbers. Keep these fields in both state files. The preparation journal is `preparation.json`; the route helper creates/updates it with per-lesson receipts and hashes. It is a checkpoint index, not independent proof: the teacher inspects real outputs before recording a pass.

Both paths learn through lesson 11. `coreStatus` describes the readiness of the foundation (0–9), not learner mastery. `extensionStatus` describes progress in 10–11; both use `not-started`, `in-progress`, `completed`. On guided lesson 9 the learner may say **next** (or legacy **extend**) to continue. On route 2, after successful preparation, set coreStatus completed and preparationStatus verified, list preparedLessons 0–9, and start lesson 10. Leave checkboxes for unstudied lessons 1–9 unchecked and label them “prepared by agent; not studied”. Lesson 0 may be checked only for setup actually completed together. Course completion for route 2 means its selected learning path 10–11 completed with a verified foundation; it never claims lessons 1–9 were studied.

Do not advance to 10 if required prerequisite evidence is failed, missing, stale or unverified. Keep the exact pending phase and last successful evidence on pause/failure. A recipe/runtime change or missing/changed app artifact requires comparison and revalidation; do not delete app or replay setup automatically.

## Upgrade a saved course

Known revisions `local-renewal-2026-09-24`, `mcp-extension-2026-09-25` and `agentic-feedback-2026-09-26` migrate additively. Before changes, back up both records with non-overwriting dated names. Preserve runtime, platform, app, current lesson/step, completed checkboxes, existing extension progress and pending technical checks. Add `learningPath: guided`, `preparationStatus: not-started`, `preparedLessons: none` only where absent. Existing users do not receive a new welcome or preparation run. A previously completed core-only course can remain paused at 9 until **next** or **extend**; do not silently reopen it.

A pending quiz becomes an optional explanation at the same step, never a technical pass. Add missing core/extension fields and unchecked lessons only when absent. Update both revisions to `feedback-123-2026-09-26` only after applying the merged-extension mapping and reconciling evidence, active context first and progress second, then read back. A partial save, inconsistent fields or unknown revision requires reconciliation at the existing checkpoint. Never reset or reinstall to resolve a mismatch.

Switching routes on an existing app requires inspecting the current checkpoint, explaining which remaining foundation phases need verification, then an explicit route choice. Reuse verified existing work. Never interpret an ambiguous `2`, `next` or runtime switch midway through another lesson as authorization to rebuild.

## Builder evidence

The builder saves receipts at `receipts/<runtime>-<lesson>-<step>.md` and does not edit the two teacher-owned state files. A receipt names changed files, actual checks/results, official sources and pending failures. The teacher reads relevant evidence directly. Learners do not have to copy terminal output or record IDs between chats. Optional reflections never block progress or appear as failed technical checks.

## Merged-extension revision

For feedback-123-2026-09-26, follow AGENTS.md section 10 before modifying old progress. Old 10+11 map to new 10, old 12 to new 11. Never promote a completed query exercise to a completed action exercise. Retain both original state records in a backup and retain every pending technical check and unapproved action. New short routes use Node.js; saved Java short-route learners keep their runtime.

Every new receipt must include `courseRevision: feedback-123-2026-09-26`. Preserve legacy receipts under their original revision during migration; do not accept an old numeric lesson-11 query receipt as evidence of the new action lesson.

### Migration helper

Stop the builder before migrating; only the teacher owns this operation. Run `node scripts/migrate-progress.mjs --dry-run` from the course root to inspect the mapping without writes. If the known revision and observed checkpoint agree, run `node scripts/migrate-progress.mjs --apply`. It backs up both records and all receipts, archives old extension receipts under their source revision, preserves foundation evidence paths, and stages a review-pending checkpoint. It does not inspect application correctness or confer a new pass.

During review, read the archived original state, mapped candidates and supporting results. Preserve incomplete checks and unapproved actions. Do not execute a previously confirmed mutation again simply to migrate. Reconcile completion candidates against real evidence; only then set `migrationReview: completed` and `courseRevision: feedback-123-2026-09-26` in both records, with an evidence-based next step and accurate course status. Keep the backup. Unknown/inconsistent state and archive collisions stop for inspection; do not overwrite them or manually renumber without reconciliation. A lock or partial-save error requires examining the existing backup and both files before proceeding.
