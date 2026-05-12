import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['memory', 'performance', 'system'],
      default: 'system'
    },
    severity: {
      type: String,
      enum: ['warning', 'critical'],
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    startAt: {
      type: Date,
      required: true,
      index: true
    },
    endAt: {
      type: Date,
      default: null
    },
    durationSeconds: {
      type: Number,
      default: null
    },
    meta: {
      heapUsedMB: Number,
      heapPct: Number,
      responseTimeMs: Number
    }
  },
  { timestamps: true }
);

incidentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

export default mongoose.model('Incident', incidentSchema);

