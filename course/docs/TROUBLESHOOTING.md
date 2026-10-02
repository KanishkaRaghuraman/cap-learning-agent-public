# Troubleshooting without losing the learning session

At a failure, stop advancing. Preserve the current app and checkpoint. Record the lesson/step, selected runtime, actual command/tool, working directory, installed versions and redacted error. Avoid repeated blind retries.

| Symptom | Check and recovery | Evidence to continue |
|---|---|---|
| Agent builds ahead | Stop it. Load AGENTS.md and resume the last verified checkpoint. Use the client's controls to restrict edits while teaching if needed. | One bounded build prompt followed by a verified checkpoint. |
| Wrong language/runtime | Check activeContext runtime and the chosen lesson filename. Load only that variant; do not regenerate the app automatically. | Correct runtime-specific commands and existing workspace preserved. |
| Node/npm missing | Use OS/terminal information first; do not run JavaScript to detect an absent Node. Install an appropriate supported LTS from the public setup source; reopen terminal. | `node --version` and `npm --version` succeed. |
| Incompatible engine warning | Compare actual Node and dependency requirements. Select a supported combination using official docs; do not dismiss EBADENGINE or upgrade everything. | Clean relevant install/build under recorded versions. |
| MCP configured but no tools | Check correct client, schema, config scope, server enablement, permissions and executable PATH. Restart the affected server. | Real tool discovery and a successful read-only probe. |
| CAP model search cannot access app | Check workspace roots and the actual `IncidentManagement/` directory. Before lesson 3 an import-only external model may not be discoverable from the project root. Inspect the actual phase before diagnosing a server failure. | Correct model results, or an explicit reported tool failure before permitted local-file inspection. |
| MCP network/certificate error | Inspect server logs and configured trust/network settings. Use the organization's supported certificate setup if applicable; do not disable TLS checks. | Original request succeeds without bypassing TLS. |
| MCP package install scripts blocked | Read the package manager's named pending-script report; review those packages under local policy. Do not turn off all script protections. Rebuild only the required approved package, or report the blocker. | Server starts and its actual tools execute. |
| Business Partner download unavailable | Use the documented local fallback only if present and valid for this local copy. No made-up EDMX or records. | XML/import validation and expected artifacts. |
| Empty scaffold has no HTTP page | Inspect the running process and model availability; lesson 1 can legitimately wait for a model. | Correct scaffold; test the real service after modelling. |
| Fiori tool says success, files absent | Inspect expected files. Diagnose target root and perform one bounded retry. | Actual files, dependencies, fresh server and working UI. Otherwise stop. |
| Java accessor missing | Update the CDS source and regenerate through the verified build. Never edit generated Java classes. | Expected accessor plus successful compile. |
| Partial or inconsistent progress | Read both working state files and compare with the app. Ask before replaying a potentially destructive step. | Agreed current step and coherent saved files. |
| Session repeats itself | Stop the repeated response, state the unresolved result and ask one focused question. | New evidence or an explicit blocker, not a third identical retry. |

The course agent diagnoses and fixes failures within the accepted current bounded request; no two failed manual learner attempts are required. Explain the result and return to teaching. When required MCP tooling remains unavailable, save the checkpoint and stop the dependent step rather than silently changing the exercise.

## Optional: isolated cds-dk resolves in build but not watch

This applies only when cds-dk is already installed in a separate local toolchain. It is not a prerequisite for a normal supported global or project-local installation.

In the tested isolated setup, `cds build` identified cds-dk10.1.0, but the watcher child caused cds-plugin-ui5 0.17.4 to report `cds-dk@undefined` and misleadingly call it “too old”. The plugin first checks its process entry point, then CommonJS module resolution, then npm's global root. Adding the toolchain binary folder to PATH made the command available but did not make its package discoverable from that child process.

Verify the actual package location/version and the plugin's failure first. If this exact resolution problem applies, set `CAP_COURSE_TOOLCHAIN` to the absolute folder containing the **existing, trusted** toolchain's `node_modules`. Run a process-local command from the generated app:

```sh
NODE_PATH="${CAP_COURSE_TOOLCHAIN:?Set this to the existing toolchain folder}/node_modules${NODE_PATH:+:$NODE_PATH}" \
PATH="$CAP_COURSE_TOOLCHAIN/node_modules/.bin:$PATH" \
cds watch --livereload false
```

This preserves existing NODE_PATH entries and does not write shell profiles, install globally, edit the plugin or change application dependencies. Confirm the watcher now reports the real toolkit version and the service still starts. If it remains undefined, record the actual resolution result; do not suppress the warning. Local `node_modules` dependencies remain preferable to relying on NODE_PATH as a general package-management strategy.

Evidence: verified against the installed plugin's `getCDSDKVersion` resolution and a running watcher on 2026-09-24. Node documents the CommonJS fallback search in [Loading from the global folders](https://nodejs.org/api/modules.html#loading-from-the-global-folders). This is process-local module discovery, not a CAP runtime setting.


### Maintainer verification update (2026-09-24)

The UI5 MCP0.3.0/0.3.1 manifest compiler failure was reproduced and corrected in an isolated local server copy by canonicalizing an external draft-06 meta-schema URI. Actual MCP checks accept the valid app manifest, reject invalid data and pass repeat calls. This is a local workaround, not a published package fix. Existing editor sessions need a restart/reconnect after configuration changes.

An experimental UI5 CLI5 alpha plus scoped pacote override produced a zero-finding full-app audit, successful UI build/HTTP serving and passing backend regression tests. It remains outside the stable course setup and must not be represented as a supported stable upgrade. The stable dependency findings and optional vendor preview diagnostics remain documented limitations.

## Feedback-specific recovery

- **Repeated quizzes:** say `skip`. The course agent explains briefly and continues when app checks pass. Do not store a skipped question as a technical blocker.
- **Only title visible:** inspect compiled UI.LineItem, current viewport and the selected table variant. A fresh standard view on JD exposed all three columns; do not rewrite the model based only on saved personalization. Review/reset only the affected view with the learner if needed.
- **Generator omitted a required section:** the course agent completes that section within the existing prompt through discovered Fiori functionality or documented fallback, then verifies dependencies, build and UI. The learner need not approve the same outcome again.
- **Concurrent writes:** stop competing app writers; keep one course chat responsible for the bounded change and its evidence review.
- **Status typo:** `new_`, `assigned`, `closed` are the sample's actual enum values. A value such as `new_,` should be rejected; correct the input, preserve server validation. This sample does not add an enum dropdown merely by declaring a CDS enum.


## Native preview findings — 2026-09-27

These are observations from the Mac Java learner run, not universal version claims or a reason to upgrade an existing app blindly. The tested frontend used SAPUI5 1.152.0, matching `framework.version` and the `fiori-tools-proxy` UI5 version, with the real Java backend mapped under `/odata`. `flp.useNewSandbox: true` and `flp.navigateToApp: true` were present in the working configuration. Keep the actual supported versions and source evidence in the receipt.

- A successful build does not prove a fresh preview works. Test a fresh load and real list-row navigation, not only a direct object-page URL. A narrow window may collapse columns; inspect the responsive UI before editing annotations.
- After an external MCP update, refresh the actual UI. Navigating to the identical hash URL can preserve stale data. For network diagnostics, attach listeners before a real browser reload and remove only your own listeners afterward; an empty same-URL navigation capture is not a clean-network result.
- The installed preview middleware's `sandbox1Init.ts` requested `i18n/i18n.properties` relative to `/test/flp.html`, producing `/test/i18n/i18n.properties`404 while the actual app bundle `/i18n/i18n.properties` returned200. The tested root-level `flp.path: /flp.html` alternative resolved that bundle request but broke `fioriSandboxAppConfig.json` loading and app navigation; it was reverted. Do not prescribe that failed workaround or create dummy files to hide the error.
- A local `/sap/bc/ui2/flp;sap-metrics-only` request also returned404. Its purpose and general impact were not established from an authoritative source in this run. Do not call it universally harmless or documented merely from its URL.
- The working preview retained browser diagnostics, including missing development preload files and sandbox messages. The tested list/detail/value-help and action readback flows passed; this does not mean every warning is resolved or every feature was tested. Record exact diagnostics separately from the passing checks and preserve them across handoffs.

If the installed version differs, inspect its actual configuration, source and current official MCP guidance before adapting a workaround. Do not alter global settings or disable TLS, authentication or native approvals to obtain a clean-looking run.
