const cds = require('@sap/cds');

const { SELECT, UPDATE } = cds.ql;

module.exports = class IncidentAgentService extends cds.ApplicationService {
  async init() {
    const incidents = await cds.connect.to('IncidentsService');
    const { Incidents } = incidents.entities;

    this.on('raiseUrgency', async req => {
      const ID = req.data.incident;
      const stored = await incidents.run(
        SELECT.one.from(Incidents).columns('ID', 'title', 'status', 'urgency', 'businessPartner.name as businessPartnerName').where({ ID })
      );
      if (!stored) return req.reject(404, 'Incident not found');
      if (stored.status === 'closed') return req.reject(409, 'Cannot modify a closed incident');
      const draft = await cds.run(SELECT.one.from(Incidents.drafts).columns('ID').where({ ID }));
      if (draft) return req.reject(409, 'Save or discard the draft before raising urgency');
      if (stored.urgency === 'high') return stored;

      // Use the existing application service: its validation and draft locks still run.
      await incidents.run(UPDATE(Incidents).set({ urgency: 'high' }).where({ ID }));
      return incidents.run(
        SELECT.one.from(Incidents).columns('ID', 'title', 'status', 'urgency', 'businessPartner.name as businessPartnerName').where({ ID })
      );
    });
    return super.init();
  }
}
