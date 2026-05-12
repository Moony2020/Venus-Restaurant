let totalRequests = 0;
let cacheHits = 0;
let cacheMisses = 0;
let totalErrors = 0;
let lastErrorTime = null;
let totalResponseTime = 0;
let slowRequestsOver100ms = 0;

const MAX_TREND_POINTS = 20;
const memoryTrend = [];
const responseTrend = [];

let incidentHooks = {
  onIncidentStart: null,
  onIncidentResolve: null
};

let activeIncidentId = null;
let previousStatus = 'ok';

const toMB = (bytes) => bytes / 1024 / 1024;

export const recordRequest = () => {
  totalRequests += 1;
};

export const recordCacheHit = () => {
  cacheHits += 1;
};

export const recordCacheMiss = () => {
  cacheMisses += 1;
};

export const recordError = () => {
  totalErrors += 1;
  lastErrorTime = Date.now();
};

export const recordResponseTime = (ms) => {
  const value = Number(ms) || 0;
  totalResponseTime += value;
  if (value > 100) slowRequestsOver100ms += 1;

  responseTrend.push(value);
  if (responseTrend.length > MAX_TREND_POINTS) responseTrend.shift();
};

export const setIncidentHooks = ({ onIncidentStart, onIncidentResolve } = {}) => {
  incidentHooks = { onIncidentStart, onIncidentResolve };
};

const classifyStatus = ({ heapUsagePct, heapUsedMB, avgResponseMs }) => {
  const reasons = [];
  let status = 'ok';

  if (heapUsagePct > 90 && heapUsedMB > 128) {
    status = 'critical';
    reasons.push(`High memory usage (${heapUsagePct.toFixed(1)}%, large heap ${heapUsedMB.toFixed(2)}MB)`);
  } else if (heapUsagePct > 90) {
    status = 'warning';
    reasons.push(`High memory usage (${heapUsagePct.toFixed(1)}%, small heap ${heapUsedMB.toFixed(2)}MB)`);
  } else if (heapUsagePct >= 75) {
    status = 'warning';
    reasons.push(`Memory usage elevated (${heapUsagePct.toFixed(1)}%)`);
  }

  if (lastErrorTime && Date.now() - lastErrorTime < 5 * 60 * 1000) {
    if (status === 'ok') status = 'warning';
    reasons.push('Recent API error');
  }

  if (slowRequestsOver100ms > 10 || avgResponseMs > 80) {
    if (status === 'ok') status = 'warning';
    reasons.push('Slow responses detected');
  }

  if (!reasons.length) reasons.push('No active issues');

  return { status, reasons };
};

const maybeHandleIncidentTransition = ({ status, reason, meta }) => {
  const enteredCritical = previousStatus !== 'critical' && status === 'critical';
  const exitedCritical = previousStatus === 'critical' && status !== 'critical';
  previousStatus = status;

  if (enteredCritical && typeof incidentHooks.onIncidentStart === 'function') {
    Promise.resolve(
      incidentHooks.onIncidentStart({
        severity: 'critical',
        reason,
        ...meta
      })
    )
      .then((id) => {
        activeIncidentId = id || null;
      })
      .catch(() => {});
  }

  if (exitedCritical && activeIncidentId && typeof incidentHooks.onIncidentResolve === 'function') {
    const incidentId = activeIncidentId;
    activeIncidentId = null;
    Promise.resolve(incidentHooks.onIncidentResolve({ incidentId, ...meta })).catch(() => {});
  }
};

export const getMetrics = () => {
  const mem = process.memoryUsage();
  const heapUsedMB = toMB(mem.heapUsed);
  const heapTotalMB = toMB(mem.heapTotal);
  const rssMB = toMB(mem.rss);
  const heapUsagePct = heapTotalMB > 0 ? (heapUsedMB / heapTotalMB) * 100 : 0;
  const avgResponseMs = totalRequests > 0 ? totalResponseTime / totalRequests : 0;

  memoryTrend.push(Number(heapUsedMB.toFixed(2)));
  if (memoryTrend.length > MAX_TREND_POINTS) memoryTrend.shift();

  const { status, reasons } = classifyStatus({ heapUsagePct, heapUsedMB, avgResponseMs });
  const topReason = reasons[0] || '';

  maybeHandleIncidentTransition({
    status,
    reason: topReason,
    meta: {
      heapUsedMB: Number(heapUsedMB.toFixed(2)),
      heapPct: Number(heapUsagePct.toFixed(1)),
      responseTimeMs: Number(avgResponseMs.toFixed(2))
    }
  });

  return {
    status,
    topReason,
    reasons,
    system: {
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rssMB: Number(rssMB.toFixed(2)),
        heapUsedMB: Number(heapUsedMB.toFixed(2)),
        heapTotalMB: Number(heapTotalMB.toFixed(2)),
        heapUsagePct: Number(heapUsagePct.toFixed(1))
      }
    },
    requests: {
      totalRequests,
      cacheHits,
      cacheMisses,
      cacheHitRate: totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0
    },
    errors: {
      totalErrors,
      lastErrorTime
    },
    performance: {
      avgResponseTimeMs: Number(avgResponseMs.toFixed(2)),
      slowRequestsOver100ms
    },
    trends: {
      memory: [...memoryTrend],
      responseTime: [...responseTrend]
    }
  };
};

