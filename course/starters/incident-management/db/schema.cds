namespace incident.mgmt;
using { cuid, managed } from '@sap/cds/common';

type Urgency : String enum { high; medium; low; }
type Status  : String enum { new_; assigned; closed; }

entity Incidents : cuid, managed {
  title           : String(200);
  urgency         : Urgency @assert.range: true;
  status          : Status  @assert.range: true;
  businessPartner : Association to BusinessPartners;
  messages        : Composition of many ConversationMessages on messages.incident = $self;
}

entity ConversationMessages : cuid, managed {
  message  : String(2000);
  author   : String(100);
  incident : Association to Incidents;
}

entity BusinessPartners : cuid {
  businessPartnerId : String(40);
  name              : String(200);
}
