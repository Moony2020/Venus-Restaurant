import { useEffect, useMemo, useRef, useState } from 'react';
import AdminHeader from '../layout/AdminHeader';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../lib/api';
import toast from 'react-hot-toast';

const REFRESH_MS = 12000;

const formatUptime = (seconds) => {
  const s = Number(seconds || 0);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

const formatDate = (value) => {
  if (!value) return 'Never';
  return new Date(value).toLocaleString('sv-SE');
};
const formatDuration = (seconds) => {
  const s = Number(seconds || 0);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
};

const statusClass = (status) => {
  if (status === 'ok') return 'text-green-400 border-green-500/30 bg-green-900/20';
  if (status === 'critical') return 'text-red-400 border-red-500/30 bg-red-900/20';
  return 'text-yellow-300 border-yellow-500/30 bg-yellow-900/20';
};

const cardLabelClass = 'text-[10px] uppercase tracking-[0.16em] text-white/50';
const cardValueClass = 'mt-2 text-3xl font-display text-white';

const buildSparkline = (values = [], width = 220, height = 44, padding = 4) => {
  if (!values.length) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((value, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
      const y = padding + ((max - value) * (height - padding * 2)) / range;
      return `${x},${y}`;
    })
    .join(' ');
};
const getPerfStroke = (value) => {
  const v = Number(value || 0);
  if (v > 80) return '#f87171'; // red
  if (v >= 30) return '#facc15'; // yellow
  return '#4ade80'; // green
};
const getTrendStats = (series = [], windowSize = 6) => {
  if (!Array.isArray(series) || series.length < windowSize) {
    return { valid: false, growthRatio: 0, increasingTail: false, slopePositive: false };
  }
  const slice = series.slice(-windowSize).map(Number);
  const first = slice[0] || 0;
  const last = slice.at(-1) || 0;
  const growthRatio = first > 0 ? (last - first) / first : 0;
  const tail = slice.slice(-3);
  const increasingTail = tail[2] > tail[1] && tail[1] > tail[0];
  const slopePositive = last > first;
  return { valid: true, growthRatio, increasingTail, slopePositive };
};

const AdminSystem = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [incidentStats, setIncidentStats] = useState({
    todayCount: 0,
    avgDurationSeconds: 0,
    maxDurationSeconds: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responseTimeHistory, setResponseTimeHistory] = useState([]);
  const [isFrozenByIncident, setIsFrozenByIncident] = useState(false);
  const [manualResume, setManualResume] = useState(false);
  const lastAlertTimeRef = useRef(0);
  const lastReasonRef = useRef('');
  const audioRef = useRef(null);
  const incidentAudioPlayedRef = useRef(false);

  useEffect(() => {
    if (!token) return undefined;
    let mounted = true;
    let timer = null;

    const fetchMetrics = async () => {
      try {
        if (!mounted) return;
        setError('');
        const [metricsData, incidentsData, statsData] = await Promise.all([
          apiGet('/metrics', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          apiGet('/incidents?limit=10', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          apiGet('/incidents/stats?day=today', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        if (!mounted) return;
        setMetrics(metricsData);
        setIncidents(Array.isArray(incidentsData?.incidents) ? incidentsData.incidents : []);
        setIncidentStats({
          todayCount: Number(statsData?.todayCount || 0),
          avgDurationSeconds: Number(statsData?.avgDurationSeconds || 0),
          maxDurationSeconds: Number(statsData?.maxDurationSeconds || 0)
        });
        setResponseTimeHistory((prev) => {
          const nextValue = Number(metricsData?.performance?.avgResponseTimeMs || 0);
          const next = [...prev, nextValue];
          return next.length > 20 ? next.slice(next.length - 20) : next;
        });
      } catch {
        if (!mounted) return;
        setError('Unable to load metrics');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMetrics();
    if (!isFrozenByIncident) {
      timer = setInterval(fetchMetrics, REFRESH_MS);
    }

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [token, isFrozenByIncident]);
  useEffect(() => {
    if (!metrics) return;
    const currentStatus = String(metrics.status || 'ok');
    const topReason = String(metrics.topReason || metrics.reasons?.[0] || 'Critical system state');

    if (currentStatus !== 'critical') {
      lastReasonRef.current = '';
      incidentAudioPlayedRef.current = false;
      setManualResume(false);
      setIsFrozenByIncident(false);
      return;
    }

    setIsFrozenByIncident(!manualResume);

    const now = Date.now();
    const cooldownMs = 60000;
    const isSameReason = lastReasonRef.current === topReason;
    const inCooldown = now - lastAlertTimeRef.current < cooldownMs;

    if (isSameReason && inCooldown) return;

    toast.error('System critical: ' + topReason, { duration: 5000 });

    if (!incidentAudioPlayedRef.current) {
      if (!audioRef.current) {
        audioRef.current = new Audio('/alert.mp3');
        audioRef.current.volume = 0.35;
      }

      if (audioRef.current.paused) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      incidentAudioPlayedRef.current = true;
    }

    lastAlertTimeRef.current = now;
    lastReasonRef.current = topReason;
  }, [manualResume, metrics]);

  const derived = useMemo(() => {
    if (!metrics) return null;
    const system = metrics.system || {};
    const requests = metrics.requests || {};
    const errors = metrics.errors || {};
    const performance = metrics.performance || {};

    const heapUsedMB = system.memory?.heapUsedMB ?? 0;
    const heapTotalMB = system.memory?.heapTotalMB ?? 0;
    const heapPct = heapTotalMB > 0 ? (heapUsedMB / heapTotalMB) * 100 : 0;

    const trends = metrics.trends || { memory: [], responseTime: [] };
    const memoryTrend = Array.isArray(trends.memory) ? trends.memory.map(Number) : [];
    const responseTrend = Array.isArray(trends.responseTime) ? trends.responseTime.map(Number) : [];
    const uptimeSeconds = Number(system.uptimeSeconds || 0);
    const cacheHitRateRaw = Number(requests.cacheHitRate || 0);
    const slowRequests = Number(performance.slowRequestsOver100ms || 0);

    const activeIncidentEntry = incidents.find((entry) => !entry.endAt);
    let insights = [];
    let predictiveInsights = [];
    if (uptimeSeconds >= 120) {
      const isMemoryIncreasing =
        memoryTrend.length >= 5 && memoryTrend.at(-1) > memoryTrend.at(-5) * 1.05;
      const isPerformanceDegrading = (() => {
        if (responseTrend.length < 5) return false;
        const last = Number(responseTrend.at(-1) || 0);
        const prev = Number(responseTrend.at(-5) || 0);
        const degrading = last > prev * 1.2;
        const stillFast = last < 50;
        return degrading && !stillFast;
      })();
      const isCacheIneffective = (requests.totalRequests || 0) > 50 && cacheHitRateRaw < 20;
      const isLeakSuspected =
        memoryTrend.length >= 10 && memoryTrend.at(-1) > memoryTrend[0] * 1.3;
      const isSystemPressure = isMemoryIncreasing && isPerformanceDegrading;

      insights = [
        isLeakSuspected && {
          type: 'critical',
          text: 'Possible memory leak',
          action: 'Restart suggested'
        },
        isSystemPressure && {
          type: 'critical',
          text: 'System pressure increasing',
          action: 'Check DB and scale/restart worker'
        },
        isMemoryIncreasing && {
          type: 'warning',
          text: 'Memory increasing trend',
          action: 'Monitor usage'
        },
        isPerformanceDegrading && {
          type: 'warning',
          text: 'Response time increasing',
          action: 'Check slow endpoints'
        },
        isCacheIneffective && {
          type: 'info',
          text: 'Cache not effective',
          action: 'Review cache TTL'
        }
      ].filter(Boolean);

      const memoryTrendStats = getTrendStats(memoryTrend, 6);
      const perfTrendStats = getTrendStats(responseTrend, 6);
      const incidentsTodayCount = Number(incidentStats.todayCount || 0);

      const isMemoryLikelyCriticalSoon =
        heapPct >= 85 &&
        heapPct < 90 &&
        isMemoryIncreasing &&
        memoryTrendStats.valid &&
        memoryTrendStats.slopePositive &&
        memoryTrendStats.increasingTail &&
        memoryTrendStats.growthRatio >= 0.08;

      const isPerformanceLikelyDegradingSoon =
        perfTrendStats.valid &&
        perfTrendStats.slopePositive &&
        perfTrendStats.increasingTail &&
        perfTrendStats.growthRatio >= 0.25 &&
        Number(responseTrend.at(-1) || 0) < 50;

      const isInstabilityLikely =
        incidentsTodayCount >= 3 ||
        (incidentsTodayCount >= 2 && (isMemoryIncreasing || isPerformanceDegrading));

      const confidence = (base, conditions = []) => {
        const bonus = conditions.filter(Boolean).length * 8;
        return Math.min(95, base + bonus);
      };

      predictiveInsights = [
        isMemoryLikelyCriticalSoon && {
          type: 'warning',
          text: 'Memory likely to reach critical soon',
          action: 'Inspect heavy operations and monitor heap growth',
          confidence: confidence(70, [heapPct >= 87, memoryTrendStats.growthRatio >= 0.12, incidentsTodayCount > 0])
        },
        isPerformanceLikelyDegradingSoon && {
          type: 'warning',
          text: 'Performance degrading trend detected',
          action: 'Review endpoint latency before user impact',
          confidence: confidence(68, [perfTrendStats.growthRatio >= 0.4, slowRequests > 0])
        },
        isInstabilityLikely && {
          type: incidentsTodayCount >= 4 ? 'critical' : 'warning',
          text: 'System instability increasing',
          action: 'Review incident timeline and isolate repeating trigger',
          confidence: confidence(72, [incidentsTodayCount >= 4, isSystemPressure, slowRequests > 0])
        }
      ].filter(Boolean);
    }

    return {
      status: metrics.status || 'ok',
      topReason: metrics.topReason || '',
      reasons: Array.isArray(metrics.reasons) ? metrics.reasons : [],
      trends,
      uptime: formatUptime(uptimeSeconds),
      uptimeSeconds,
      lastErrorTime: formatDate(errors.lastErrorTime),
      totalRequests: requests.totalRequests || 0,
      cacheHits: requests.cacheHits || 0,
      cacheMisses: requests.cacheMisses || 0,
      cacheHitRate: cacheHitRateRaw.toFixed(2),
      avgResponseTimeMs: Number(performance.avgResponseTimeMs || 0).toFixed(2),
      slowRequests,
      totalErrors: errors.totalErrors || 0,
      rssMB: system.memory?.rssMB || 0,
      heapUsedMB,
      heapTotalMB,
      heapPct: Number(heapPct.toFixed(1)),
      insights,
      predictiveInsights,
      activeIncident: activeIncidentEntry
        ? {
            reason: activeIncidentEntry.reason,
            startLabel: formatDate(activeIncidentEntry.startAt),
            liveDuration: formatDuration(
              Math.max(
                1,
                Math.floor((Date.now() - new Date(activeIncidentEntry.startAt).getTime()) / 1000)
              )
            )
          }
        : null,
      incidentHistory: incidents
        .filter((entry) => entry.endAt)
        .slice(0, 5)
        .map((entry) => ({
        ...entry,
        startLabel: formatDate(entry.startAt),
        endLabel: formatDate(entry.endAt),
        durationLabel: formatDuration(entry.durationSeconds)
      })),
      incidentIntelligence: {
        incidentsToday: Number(incidentStats.todayCount || 0),
        avgDurationSeconds: Number(incidentStats.avgDurationSeconds || 0),
        maxDurationSeconds: Number(incidentStats.maxDurationSeconds || 0),
        avgDurationLabel: formatDuration(Number(incidentStats.avgDurationSeconds || 0)),
        maxDurationLabel: formatDuration(Number(incidentStats.maxDurationSeconds || 0))
      }
    };
  }, [incidentStats, incidents, metrics]);

  return (
    <main className="min-h-screen bg-background text-white">
      <AdminHeader />
      <section className="mx-auto max-w-[1800px] px-6 py-12">
        {derived?.status === 'critical' ? (
          <div className="mb-5 rounded-lg border border-red-500/40 bg-red-900/20 px-4 py-3 text-sm text-red-200">
            {'\uD83D\uDEA8'} {derived.topReason || 'System under stress'} {'\u2014'} action required
            {isFrozenByIncident ? (
              <button
                type="button"
                onClick={() => {
                  setManualResume(true);
                  setIsFrozenByIncident(false);
                }}
                className="ml-3 rounded border border-red-300/40 px-2 py-1 text-[11px] uppercase tracking-[0.08em] text-red-100 hover:bg-red-800/30"
              >
                Resume Auto Refresh
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold font-bold">Admin Portal</p>
            <h1 className="font-display text-4xl sm:text-5xl">System Monitoring</h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">
            {isFrozenByIncident ? 'Auto refresh paused (incident mode)' : `Auto refresh: ${Math.floor(REFRESH_MS / 1000)}s`}
          </p>
        </div>

        {error && <div className="mt-5 border border-red-400/30 bg-red-900/20 p-3 text-sm text-red-200 rounded-lg">{error}</div>}

        {loading && !metrics ? (
          <div className="mt-8 border border-white/10 bg-panel p-8 rounded-xl text-white/50">Loading metrics...</div>
        ) : null}

        {derived ? (
          <>
            <div className="mt-8 grid gap-4 grid-cols-1 lg:grid-cols-3">
              <div className="border border-white/10 bg-panel p-5 rounded-xl">
                <p className={cardLabelClass}>Status</p>
                <p className={`${cardValueClass} inline-flex items-center rounded-full border px-3 py-1 text-xl ${statusClass(derived.status)}`}>
                  {derived.status.toUpperCase()}
                  {derived.topReason.toLowerCase().includes('memory') ? ' (Memory)' : ''}
                </p>
                <p className="mt-3 text-xs text-white/50">Uptime: {derived.uptime}</p>
                {derived.reasons.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {derived.reasons.map((reason) => (
                      <span
                        key={reason}
                        className="rounded-full border border-yellow-500/30 bg-yellow-900/20 px-2 py-1 text-[10px] text-yellow-200"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-green-300">No active issues</p>
                )}
                {derived.insights.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {derived.insights.map((insight) => {
                      const toneClass =
                        insight.type === 'critical'
                          ? 'border-red-500/30 bg-red-900/20 text-red-200'
                          : insight.type === 'warning'
                          ? 'border-yellow-500/30 bg-yellow-900/20 text-yellow-200'
                          : 'border-blue-500/30 bg-blue-900/20 text-blue-200';

                      return (
                        <div key={`${insight.type}-${insight.text}`}>
                          <span className={`rounded-full border px-2 py-1 text-[10px] ${toneClass}`}>
                            {insight.text}
                          </span>
                          {insight.type !== 'info' && insight.action ? (
                            <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-white/45">
                              {insight.action}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {derived.predictiveInsights?.length > 0 ? (
                  <div className="mt-3 border-t border-white/10 pt-2 space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">Predictive</p>
                    {derived.predictiveInsights.map((insight) => {
                      const toneClass =
                        insight.type === 'critical'
                          ? 'border-red-500/30 bg-red-900/20 text-red-200'
                          : 'border-yellow-500/30 bg-yellow-900/20 text-yellow-200';

                      return (
                        <div key={`predictive-${insight.text}`}>
                          <span className={`rounded-full border px-2 py-1 text-[10px] ${toneClass}`}>
                            {insight.text}
                          </span>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-white/45">
                            {insight.action}
                          </p>
                          <p className="mt-1 text-[10px] text-white/35">
                            Confidence: {insight.confidence}%
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                <p className="mt-1 text-xs text-white/50">Last error: {derived.lastErrorTime}</p>
              </div>

              <div className="border border-white/10 bg-panel p-5 rounded-xl">
                <p className={cardLabelClass}>Requests</p>
                <p className={cardValueClass}>{derived.totalRequests}</p>
                <p className="mt-2 text-xs text-white/60">
                  Hits: {derived.cacheHits} {'\u2022'} Misses: {derived.cacheMisses}
                </p>
                <p className="mt-1 text-xs text-gold">Hit rate: {derived.cacheHitRate}%</p>
              </div>

              <div className="border border-white/10 bg-panel p-5 rounded-xl">
                <p className={cardLabelClass}>Performance</p>
                <p className={cardValueClass}>{derived.avgResponseTimeMs} ms</p>
                <p className="mt-2 text-xs text-white/60">Slow requests (&gt;100ms): {derived.slowRequests}</p>
                <p className={`mt-1 text-xs ${derived.slowRequests > 10 ? 'text-yellow-300' : 'text-green-400'}`}>
                  {derived.slowRequests > 10 ? 'Warning level' : 'Healthy level'}
                </p>
                <svg viewBox="0 0 220 44" className="mt-3 h-10 w-full">
                  <polyline
                    fill="none"
                    stroke={getPerfStroke(derived.avgResponseTimeMs)}
                    strokeWidth="2"
                    points={buildSparkline(responseTimeHistory)}
                  />
                </svg>
              </div>
            </div>

            <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
              <div className="border border-white/10 bg-panel p-5 rounded-xl">
                <p className={cardLabelClass}>Memory RSS</p>
                <p className="mt-2 text-2xl font-display text-white">{derived.rssMB} MB</p>
              </div>
              <div className="border border-white/10 bg-panel p-5 rounded-xl">
                <p className={cardLabelClass}>Heap Used</p>
                <p className="mt-2 text-2xl font-display text-white">{derived.heapUsedMB} MB</p>
                <svg viewBox="0 0 220 44" className="mt-3 h-10 w-full">
                  <polyline
                    fill="none"
                    stroke="#c6ab63"
                    strokeWidth="2"
                    points={buildSparkline(derived.trends.memory)}
                  />
                </svg>
              </div>
              <div className="border border-white/10 bg-panel p-5 rounded-xl">
                <p className={cardLabelClass}>Heap Total</p>
                <p className="mt-2 text-2xl font-display text-white">{derived.heapTotalMB} MB</p>
              </div>
              <div className="border border-white/10 bg-panel p-5 rounded-xl">
                <p className={cardLabelClass}>Heap Usage</p>
                <p className={`mt-2 text-2xl font-display ${derived.heapPct > 85 ? 'text-red-400' : derived.heapPct > 70 ? 'text-yellow-300' : 'text-green-400'}`}>
                  {derived.heapPct}%
                </p>
              </div>
            </div>

            <div className="mt-6 border border-white/10 bg-panel p-5 rounded-xl">
              <p className={cardLabelClass}>Errors</p>
              <p className="mt-2 text-2xl font-display text-white">{derived.totalErrors}</p>
              <p className="mt-1 text-xs text-white/50">Last error time: {derived.lastErrorTime}</p>
              {derived.activeIncident || derived.incidentHistory.length > 0 ? (
                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">Recent incidents</p>
                  <div className="mt-2 space-y-2">
                    {derived.activeIncident ? (
                      <div className="rounded border border-red-500/35 bg-red-900/20 px-3 py-2">
                        <p className="text-[11px] text-red-200">{derived.activeIncident.reason}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-red-300/90">
                          Active {'\u2022'} Started {derived.activeIncident.startLabel} {'\u2022'} Duration {derived.activeIncident.liveDuration}
                        </p>
                      </div>
                    ) : null}
                    {derived.incidentHistory.map((incident, idx) => (
                      <div key={`${incident.startAt}-${incident.endAt}-${idx}`} className="rounded border border-red-500/25 bg-red-900/10 px-3 py-2">
                        <p className="text-[11px] text-red-200">{incident.reason}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-white/40">
                          {incident.startLabel} {'\u2192'} {incident.endLabel} {'\u2022'} {incident.durationLabel}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 border-t border-white/10 pt-3 text-[10px] uppercase tracking-[0.12em] text-white/55">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>Today: {derived.incidentIntelligence.incidentsToday}</span>
                      <span>Avg: {derived.incidentIntelligence.avgDurationLabel}</span>
                      <span>Max: {derived.incidentIntelligence.maxDurationLabel}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
};

export default AdminSystem;




