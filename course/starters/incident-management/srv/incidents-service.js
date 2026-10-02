const cds = require('@sap/cds')
const { SELECT } = cds.ql // Do NOT destructure SELECT from cds directly; that property is undefined at runtime.

module.exports = cds.service.impl(function () {
  const { Incidents } = this.entities

  // ---- Business rule 1: a supplied title containing "urgent" (case-insensitive) forces high urgency.
  // Registered on the ACTIVE entity, so it fires on direct active writes and on draftActivate,
  // never for a request that omits the title.
  this.before(['CREATE', 'UPDATE'], Incidents, req => {
    const { title } = req.data
    if (typeof title === 'string' && title.toLowerCase().includes('urgent')) {
      req.data.urgency = 'high'
    }
  })

  // ---- Business rule 2: a stored, closed incident may not be changed or reopened.
  // Reads the stored state of the addressed row; an absent row is left for CAP to answer 404.
  this.before('UPDATE', Incidents, async req => {
    const stored = await SELECT.one.from(req.subject).columns('status')
    if (stored && stored.status === 'closed') {
      req.reject(409, 'Cannot modify a closed incident')
    }
  })

  // ---- Read enrichment: virtual criticality derived from urgency (high→1, medium→2, low→3, else 0).
  // Covers active and draft reads. Fetches urgency only when needed and strips the helper when the
  // client did not ask for it, so excluded selections never leak criticality or its dependency.
  const criticalityReadState = Symbol('criticalityReadState')
  const incidentReadTargets = [Incidents, Incidents.drafts]

  this.before('READ', incidentReadTargets, req => {
    const columns = req.query?.SELECT?.columns
    const hasField = name => columns?.some(c => c?.ref?.length === 1 && c.ref[0] === name)
    const includesAll = !columns || columns.some(c => c === '*' || (c?.ref?.length === 1 && c.ref[0] === '*'))
    const requested = includesAll || hasField('criticality')
    const state = req[criticalityReadState] = { requested, addedUrgency: false }
    if (requested && columns && !includesAll && !hasField('urgency')) {
      columns.push({ ref: ['urgency'] })
      state.addedUrgency = true
    }
  })

  this.after('READ', incidentReadTargets, (result, req) => {
    const state = req[criticalityReadState]
    if (!state?.requested) return
    const incidents = Array.isArray(result) ? result : result ? [result] : []
    for (const incident of incidents) {
      switch (incident.urgency) {
        case 'high':   incident.criticality = 1; break
        case 'medium': incident.criticality = 2; break
        case 'low':    incident.criticality = 3; break
        default:       incident.criticality = 0
      }
      if (state.addedUrgency) delete incident.urgency
    }
  })
})
