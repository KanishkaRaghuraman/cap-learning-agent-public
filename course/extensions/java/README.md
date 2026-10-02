# Java reference: lessons 10–11

The existing course Java track is retained. The application MCP extension requires CAP Java **5.1.1**; the earlier tested course5.0.1 BOM does not manage the MCP adapter. Review this deliberate minor-version prerequisite with the learner. Do not invent a5.0.1 adapter version or skip authentication to make a request work.

## Lesson 10: read stage

In the completed application's root `pom.xml`, set its existing `cds.services.version` to `5.1.1`. In `srv/pom.xml`, add these dependencies inside the existing dependencies element:

```xml
<dependency>
  <groupId>com.sap.cds</groupId>
  <artifactId>cds-adapter-mcp</artifactId>
  <scope>runtime</scope>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

Copy `course/extensions/java/10-read-only/srv/incident-agent-service.cds` into the application's `srv` directory after reviewing the five selected fields (including the synthetic business partner display name). Merge the following `security` block into the existing default-profile `cds` section in `srv/src/main/resources/application.yaml` (do not create duplicate YAML keys or replace existing remote-service settings):

```yaml
  security:
    mock:
      defaultUsers: false
      users:
        - name: alice
          roles: [IncidentReader, IncidentManager]
        - name: bob
          roles: [IncidentReader]
        - name: mallory
          roles: []
```

Build/run using the existing course command `mvn spring-boot:run`. Connect the existing client to the endpoint shown on the CAP index page: `http://localhost:8080/mcp/IncidentAgentService` on the default port. Use Streamable HTTP and HTTP Basic mock identity alice with an empty password. These are local mock roles only, never deployment credentials.

From the course repository, verify the real endpoint:

```sh
node course/extensions/node/verify.mjs read-stage http://localhost:8080 /mcp/IncidentAgentService
```

## Lesson 11: action stage

Replace the read-only CDS file with `course/extensions/java/11-action/srv/incident-agent-service.cds`. Copy the supplied `IncidentAgentHandler.java` into `srv/src/main/java/customer/incidentmanagement/`. The course scaffold uses this package; if the learner deliberately changed it, inspect the actual project first and change the package consistently rather than inventing another scaffold. Review the handler with the learner.

Ask the learner to restart/rebuild in their terminal using the same course command, explaining the in-memory reset first. If authentication changes UI access, ask them to confirm the existing preview still works; use the documented local mock identity if prompted, never disable authentication. Complete the native action and readback in lesson 11. Declining is supported without a required cancellation drill.

### Optional maintainer verification — outside the learner journey

Only on explicit request, review the exact mutation target before running this suite. It is not a lesson completion gate.

```sh
# Set COURSE_TARGET_ID to the exact reviewed synthetic UUID first.
node course/extensions/node/verify.mjs action-stage http://localhost:8080 /mcp/IncidentAgentService
```

The verification discovers real seed rows and raises only the exact open incident supplied through `COURSE_TARGET_ID` to high urgency, rejects missing/closed targets and reader-role calls, and verifies a repeated request has the same result. Refresh the existing UI and inspect the actual changed ID. Maintainer testing also covers outstanding draft rejection; this is not a required learner demonstration. A client approval/denial is a separate interactive check, not a server-managed approval workflow.

The handler explicitly addresses the active entity's compound draft key (ID plus IsActiveEntity), checks HasDraftEntity before even an already-high no-op, and delegates the write to the original application service. It does not write directly to persistence.

## Verified scope

CAP Java5.1.1, existing Spring Boot4.1.0 course scaffold and local JDK25 were built and exercised. The existing synthetic seed IDs differ from Node's; inspect and confirm a real existing UUID and supply it through `COURSE_TARGET_ID`; never substitute a Node fixture ID. Java may advertise `call` to a reader but denies its execution; Node filters the tool out. Always test execution authorization, not visibility alone.

[cds-mcp: MCP adapter plugin → Java `com.sap.cds:cds-adapter-mcp` runtime dependency](https://cap.cloud.sap/docs/guides/ai/cap-mcp#add-the-mcp-plugin)

[cds-mcp: Java mock users → mock users initialize only with spring-boot-starter-security; local default profile mock users](https://cap.cloud.sap/docs/java/security#mock-users)

[cds-mcp: Implement Event Handler → generated action context gives parameters/result and @On supplies business logic](https://cap.cloud.sap/docs/java/cqn-services/application-services#implement-event-handler)

[cds-mcp: Updating Individual Entities → matching filters compound keys; missing filters update all rows](https://cap.cloud.sap/docs/java/working-with-cql/query-api#update-individual-entities)

[cds-mcp: Reading Drafts → READ calculates HasDraftEntity; direct active updates are blocked by draft locks](https://cap.cloud.sap/docs/java/fiori-drafts#reading-drafts)

Maven Central published-artifact metadata confirmed adapter5.1.1; no release date is inferred. These steps do not claim production security for the unchanged base UI service or cloud deployment validation.
