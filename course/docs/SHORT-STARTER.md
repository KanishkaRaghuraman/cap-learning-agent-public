# Explore MCP and agents — lesson 0

## Teaching flow

Choosing this option starts setup immediately. Say briefly that the prepared Node.js app lets the learner focus on MCP and agents. Do not request another setup prompt, ask “proceed” again or regenerate the app. Native permissions and genuine account/global-change choices still apply.

1. Inspect saved state and IncidentManagement/. Preserve existing app, data, runtime and progress; do not overwrite it.
2. Check actual OS, compatible Node/npm/CAP and relevant native development MCP connections. A saved configuration is not proof of a working connection. Follow lesson0 prerequisite recovery when needed. Require `cds --version` and `cds watch --help` in the learner’s terminal environment before copying the starter; a local dependency is not enough.
3. From the course root run `node course/scripts/install-starter.mjs` only for a fresh application. Stop on conflict. In IncidentManagement/ install locked dependencies using `npm ci` on macOS/Linux or `npm.cmd ci` on Windows.
4. Do not start the app in an agent-owned background process. Give the learner the actual application directory and commands below, using the observed absolute path instead of the placeholder. Explain that they keep this terminal open. Wait until they report startup before checking HTTP.

macOS/Linux terminal:
```sh
cd '/actual/course/path/IncidentManagement'
cds watch
```

Windows PowerShell:
```powershell
Set-Location -LiteralPath 'C:\actual\course\path\IncidentManagement'
cds watch
```

5. Discover the actual origin from startup evidence. Run `node course/scripts/check-starter.mjs --url <observedLocalOrigin> --output memory-bank/receipts/starter-readiness.json` from the course root. Read the result: metadata, incidents, partners, UI HTML and manifest. Diagnose a failed check from logs and current guidance, then rerun that check.
6. Share the real preview link and ask the learner to confirm incidents appear. After confirmation explain: “The prepared app has a CDS model for incidents and their partners, a CAP service that handles requests and business rules, and a Fiori elements UI built from service metadata. The sample records are local and synthetic. We’ll now expose a small part of that service to an agent through MCP.” Introduce lesson1 without replaying the foundation lessons. HTTP readiness is not browser rendering. No example prompt is needed for terminal instructions or this confirmation.

## Internal evidence and recovery

Record prerequisites, HTTP readiness, serverOwner: learner, actual origin and humanPreview: pending|reported separately. A pending required preview keeps lesson0 in progress. Before requesting any restart explain the in-memory database resets local changes, then let the learner restart their own terminal. Never terminate it automatically.

No browser automation, UI generation/build/lint, full foundation verifier or prepare-course record/finish belongs in this setup. Maintainer regression is separate. On resume repeat only checks justified by changes or failures. Do not replay the course, replace existing work or award studied credit for foundation lessons.
