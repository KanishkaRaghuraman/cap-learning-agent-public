> Current interaction: one course chat; full0–12 or short0–3. Source checks do not prove learner-flow success; user testing is pending. See AGENTS.md.

# Windows test setup

This repository contains the learning course, not a prebuilt application. You direct a course agent through short prompts while the course agent explains the concepts. Licence and metadata clearance are unresolved; keep this repository private.

## PowerShell setup

Install Git and a current supported Node.js LTS compatible with the course using official installers; retain an existing supported compatible installation if preferred. Open a new PowerShell terminal and check `git --version`, `node --version`, and `npm.cmd --version`.

```powershell
git clone https://github.com/KanishkaRaghuraman/cap-learning-agent.git
cd cap-learning-agent
npm.cmd ci
npm.cmd run setup -- codex
```

Use `vscode` for a VS Code agent using native workspace MCP, `cursor` for Cursor, or `claude` for Claude Code instead of `codex`. Run only your chosen route. GitHub may ask you to authenticate for this private repository. Do not put a token in the clone URL.

Setup generates local paths for this clone and wraps npx in cmd on native Windows. It preserves existing configuration and writes a .suggested file if settings already exist; merge missing entries and remove that suggestion afterward. No global settings or credentials are copied from the Mac. Setup, live development MCP probes and the Claude launcher were exercised on JD Windows on 2026-09-26.

The script applies a hash-checked workaround to the pinned UI5 MCP0.3.1 installed source. It corrects the draft-06 HTTP/HTTPS schema identity mismatch without disabling validation. Re-run setup after npm ci, which reinstalls the package. Unexpected package content causes the patch to refuse. The server remains the official package with this explicit local modification; the patch is not an upstream release.

## Start learning

Open the cloned folder in your Windows coding client, enable the configured MCP servers and start one course chat. Ask it to begin.

**For example:**
> Read AGENTS.md and start the CAP learning journey.

Expect a CAP introduction and choice1/full or2/short. Full then asks Java/Node.js; Explore announces Node.js and immediately begins prerequisite checks and starter setup. Check real native CAP/Fiori/UI5 responses after any client reload. Both paths remain in this same chat. Required final12 is native application MCP practice in both runtimes; no additional API key. Only optional Node.js Fiori embedding needs a supported key and explicit choice.

## Known boundaries

- Historical checks on an earlier course revision: Mac VS Code maintainer and app E2E tests passed. These do not validate the redesigned single-chat course. JD learner transcripts and the resulting Windows app were reviewed; feedback regression tests cover setup, prompts, application APIs and browser workflows. A completely fresh lesson0–11 replay inside native Windows VS Code was not performed by this test.
- Stable UI5 CLI dependencies retain reported development audit findings. A separately tested CLI5 alpha plus pacote override was clean, but this course does not silently force that experimental combination. The validator patch above is independent of this dependency issue.
- Vendor preview warnings may appear. A functioning app is not a claim of a clean console.
- No sample solution, local databases, personal learner progress, screenshots, test logs, access tokens or machine configuration are included.
- Keep LICENSE unchanged and repository private until redistribution rights are cleared.

Record failures with lesson/step, agent/model, Node/npm versions, exact redacted error and what you expected. Never commit credentials or learner session state.

## Resume after the feedback update

Open the existing clone in one course chat and ask it to reconcile saved progress. The app/data/runtime remain intact; migration backs up state and pending action confirmation is never replayed.

**For example:**
> Read AGENTS.md and resume my existing course.

The terminal route `npm.cmd run learn` resolves both a native Claude executable and the official npm package's declared binary without executing its shell wrapper. `npm.cmd run learn -- --version` checks that launch path without starting a course.
