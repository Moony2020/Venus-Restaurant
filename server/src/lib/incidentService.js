import Incident from '../models/Incident.js';

const detectType = (reason = '') => {
  const lower = String(reason).toLowerCase();
  if (lower.includes('memory') || lower.includes('heap')) return 'memory';
  if (lower.includes('slow') || lower.includes('response') || lower.includes('latency')) return 'performance';
  return 'system';
};

export const handleIncidentStart = async (payload = {}) => {
  const now = new Date();
  const incident = await Incident.create({
    type: detectType(payload.reason),
    severity: payload.severity || 'critical',
    reason: payload.reason || 'Critical system state',
    startAt: now,
    meta: {
      heapUsedMB: payload.heapUsedMB,
      heapPct: payload.heapPct,
      responseTimeMs: payload.responseTimeMs
    }
  });

  return incident._id.toString();
};

export const handleIncidentResolve = async (payload = {}) => {
  const { incidentId } = payload;
  if (!incidentId) return;

  const incident = await Incident.findById(incidentId);
  if (!incident || incident.endAt) return;

  const endAt = new Date();
  const durationSeconds = Math.max(1, Math.floor((endAt.getTime() - incident.startAt.getTime()) / 1000));

  incident.endAt = endAt;
  incident.durationSeconds = durationSeconds;
  await incident.save();
};

