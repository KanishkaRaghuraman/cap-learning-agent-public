package customer.incidentmanagement;

import org.springframework.stereotype.Component;
import java.util.Map;
import org.springframework.beans.factory.annotation.Qualifier;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.services.ErrorStatuses;
import com.sap.cds.services.ServiceException;
import com.sap.cds.services.cds.CqnService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import cds.gen.incidentagentservice.RaiseUrgencyContext;
import cds.gen.incidentagentservice.Incidents;

@Component
@ServiceName("IncidentAgentService")
public class IncidentAgentHandler implements EventHandler {
    private final CqnService incidents;
    public IncidentAgentHandler(@Qualifier("IncidentsService") CqnService incidents) {
        this.incidents = incidents;
    }

    @On(event = "raiseUrgency")
    public void raiseUrgency(RaiseUrgencyContext context) {
        String id = context.getIncident();
        var query = Select.from("IncidentsService.Incidents")
            .columns(i -> i.get("ID"), i -> i.get("title"), i -> i.get("status"), i -> i.get("urgency"), i -> i.get("HasDraftEntity"), i -> i.get("businessPartner.name").as("businessPartnerName")).matching(Map.of("ID", id, "IsActiveEntity", true));
        var stored = incidents.run(query).first(Incidents.class)
            .orElseThrow(() -> new ServiceException(ErrorStatuses.NOT_FOUND, "Incident not found"));
        if ("closed".equals(stored.getStatus())) {
            throw new ServiceException(ErrorStatuses.CONFLICT, "Cannot modify a closed incident");
        }
        if (Boolean.TRUE.equals(stored.get("HasDraftEntity"))) {
            throw new ServiceException(ErrorStatuses.CONFLICT, "Save or discard the draft before raising urgency");
        }
        if (!"high".equals(stored.getUrgency())) {
            // Preserve existing validation and draft locks by using the application service.
            incidents.run(Update.entity("IncidentsService.Incidents").data("urgency", "high").matching(Map.of("ID", id, "IsActiveEntity", true)));
            stored = incidents.run(query).single(Incidents.class);
        }
        stored.remove("HasDraftEntity");
        stored.remove("criticality");
        context.setResult(stored);
    }
}
