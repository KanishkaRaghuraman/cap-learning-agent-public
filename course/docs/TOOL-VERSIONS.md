# Tool versions and verification scope

Observed 2026-09-24 on macOS. These are dated observations, not a promise that every future package combination is compatible. Inspect the generated project's dependency ranges and current official documentation before changing versions.

| Component | Version | Evidence |
|---|---|---|
| Node.js | 24.19.0 | Executed local tools and HTTP fixture |
| CAP development kit (`@sap/cds-dk`) | 10.1.0 | Installed locally for renewal; no global installation performed |
| Fiori generator (`@sap/generator-fiori`) | 1.32.0 | Actual Java and Node Fiori generation; isolated npm global-style prefix |
| CAP MCP package (`@cap-js/mcp-server`) | 0.0.6 | Started, listed tools, returned documentation |
| Fiori MCP package (`@sap-ux/fiori-mcp-server`) | 1.13.0 | Started, listed tools, returned documentation |
| UI5 MCP package (`@ui5/mcp-server`) | 0.3.0 | Started, listed tools, returned guidelines |
| CAP Node runtime (`@sap/cds`) | 10.1.1 | Fresh ESM app; 43 HTTP business/draft/constraint/criticality checks passed |
| SQLite adapter (`@cap-js/sqlite`) | 3.1.1 | Fresh Node app, in-memory fixtures and real HTTP checks |
| CAP Java | 5.0.1 | Generated app, Maven build, 40 HTTP checks and Fiori browser flow |
| Eclipse Temurin JDK | 25.0.4.1+1 | Isolated official runtime; checksum verified |
| Apache Maven | 3.9.16 | Isolated official installation; checksum verified |
| Spring Boot | 4.1.0 | Selected by actual Java scaffold |
| Java project CDS toolkit | 10.0.5 | Generated project build; its plugin used Node 24.18.0 |
| SAPUI5 Java preview | 1.148.10 | Real Java UI, compatible Manifest2, build and lint |
| SAPUI5 native Node distribution | 1.148.11 | Browser distribution verified; constituent core1.148.9 and FE1.148.8 recorded separately |
| UI5 CLI / cds-plugin-ui5 | 4.0.69 / 0.17.4 | Actual Node build/preview; unresolved development audit findings in validation |
| VS Code | 1.137.0 | Native instructor and maintenance tests |
| Codex VS Code extension | 26.917.62051 | Existing ChatGPT sign-in, GPT-6 Astra; real tool calls |

The CAP MCP server advertised protocol server version 0.1.0 during initialization. That is distinct from its installed npm package version 0.0.6; use the package version in installation examples.

The static examples record the package versions above. Automated setup resolves latest stable compatible CDS/Fiori versions and records the actual concrete values. Tested versions do not require downgrading a newer supported installation. Fiori MCP declares Node >=22.x; UI5 MCP declares Node ^20.17.0 or >=22.9.0. Node 24.19.0 met those tested requirements. Review package engine requirements again when updating the pins. The install reported pending scripts for two transitive packages; no installation protections were disabled, and the three read-only MCP probes succeeded. Actual course Fiori generation was subsequently exercised. This still does not prove every optional generator feature works.

For Java, the current CAP Java 5 migration documentation states minimum JDK 21, default generated JDK 25 and Maven 3.9.14 or newer. The lesson checks the actual generated POM and installed tools instead of assuming an older Java baseline. The Java scaffold, build, handlers, generated UI and browser flow were executed with the versions above; this is runtime evidence, not a complete Java learner/agent session. See [minimum versions](https://cap.cloud.sap/docs/java/migration#minimum-versions) and [default JDK](https://cap.cloud.sap/docs/java/migration#default-jdk-version).

Package references: [CAP MCP](https://github.com/cap-js/mcp-server), [Fiori MCP](https://github.com/SAP/open-ux-tools/tree/main/packages/fiori-mcp-server), [UI5 MCP](https://github.com/UI5/mcp-server). All were consulted on the observation date. See [validation](VALIDATION.md) for the boundaries of these tests.
