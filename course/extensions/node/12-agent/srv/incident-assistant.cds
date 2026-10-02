using { incident.mgmt as mgmt } from '../db/schema';

/** Help the learner work with incidents using the stored data.
 * Identify incidents by businessPartnerName and title; keep UUIDs out of answers unless asked.
 * Query the actual businessPartnerName; never infer a partner from the title.
 * If the name is missing, say it is unavailable. If several incidents match, ask which title.
 * A new_ status does not establish ownership. Rank only by stored urgency, not invented impact.
 * Before an action, state the partner and title and wait for the approval step.
 */
@agent
@agent.connect: 'none'
@requires: 'IncidentReader'
service IncidentAssistant {
  /** Read active incidents. Status: new_, assigned, closed. Urgency: high, medium, low. */
  @readonly
  entity Incidents as projection on mgmt.Incidents {
    ID, title, status, urgency, businessPartner.name as businessPartnerName
  };
}
