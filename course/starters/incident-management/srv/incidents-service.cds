using { incident.mgmt as mgmt } from '../db/schema';

service IncidentsService {

  @odata.draft.enabled
  entity Incidents as projection on mgmt.Incidents {
    *,
    virtual null as criticality : Integer
  };

  entity ConversationMessages as projection on mgmt.ConversationMessages;

  @readonly
  entity BusinessPartners as projection on mgmt.BusinessPartners;
}
