import Incident from '../models/Incident.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const getIncidents = asyncHandler(async (req, res) => {
  const rawLimit = Number(req.query.limit || 5);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 5;

  const incidents = await Incident.find({})
    .sort({ startAt: -1 })
    .limit(limit)
    .lean();

  res.json({
    incidents
  });
});

export const getIncidentStats = asyncHandler(async (req, res) => {
  const day = String(req.query.day || 'today').toLowerCase();

  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);

  if (day === 'today') {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else {
    // Fallback to today until we introduce additional ranges.
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  const stats = await Incident.aggregate([
    {
      $match: {
        startAt: { $gte: start, $lte: end },
        endAt: { $ne: null },
        durationSeconds: { $ne: null }
      }
    },
    {
      $group: {
        _id: null,
        todayCount: { $sum: 1 },
        avgDurationSeconds: { $avg: '$durationSeconds' },
        maxDurationSeconds: { $max: '$durationSeconds' }
      }
    }
  ]);

  const row = stats[0] || {};

  res.json({
    day,
    todayCount: Number(row.todayCount || 0),
    avgDurationSeconds: Math.round(Number(row.avgDurationSeconds || 0)),
    maxDurationSeconds: Number(row.maxDurationSeconds || 0)
  });
});
