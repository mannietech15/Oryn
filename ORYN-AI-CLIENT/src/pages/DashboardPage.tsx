import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  runCommand, fetchBriefing, fetchAlerts, fetchGoals,
  fetchGoalAction, fetchHealthScore,
} from '../api/dashboard';
import type {
  CommandResult, DashboardBriefing, DashboardAlert,
  DashboardGoal, HealthScore,
} from '../types';

const barHeights = [40, 55, 48, 65, 72, 60, 78, 85, 100];

/* ─── Shared Components ───────────────────────────────────── */
function Card({ title, subtitle, children, style = {}, delay = 0, action }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      className="glass-panel"
      style={{
        borderRadius: 16, padding: '24px',
        display: 'flex', flexDirection: 'column',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--shadow-subtle)',
        position: 'relative', overflow: 'hidden',
        ...style
      }}
    >
      {title && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.3px' }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-body)' }}>
                {subtitle}
              </div>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.div>
  );
}

function SparkLine() {
  const W = 400, H = 100, pad = 10;
  const max = Math.max(...barHeights);
  const pts = barHeights.map((h, i) => ({
    x: pad + (i / (barHeights.length - 1)) * (W - pad * 2),
    y: H - pad - (h / max) * (H - pad * 2),
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible', marginTop: 10 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaGrad)" />
      <path d={line} fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <React.Fragment key={i}>
          <line x1={p.x} y1={pad} x2={p.x} y2={H - pad} stroke="var(--glass-bg-subtle)" strokeWidth="1" />
          {i === pts.length - 1 && (
            <circle cx={p.x} cy={p.y} r={4} fill="var(--bg)" stroke="var(--accent-primary)" strokeWidth="2" />
          )}
        </React.Fragment>
      ))}
    </svg>
  );
}

function HealthGauge({ score, grade }: { score: number; grade: string }) {
  const r = 56, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const scoreColor = score >= 85 ? 'var(--success)' : score >= 65 ? 'var(--warn)' : 'var(--danger)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--glass-bg-subtle)" strokeWidth="8" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={scoreColor} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${scoreColor}40)`, transition: 'stroke-dasharray 1.2s ease' }} />
        <text x="70" y="66" textAnchor="middle" fontSize="28" fontWeight="700"
          fill="var(--text-primary)" fontFamily="var(--font-display)"
          style={{ transform: 'rotate(90deg)', transformOrigin: '70px 70px' }}>{score}</text>
        <text x="70" y="84" textAnchor="middle" fontSize="12" fontWeight="600"
          fill={scoreColor} fontFamily="var(--font-display)"
          style={{ transform: 'rotate(90deg)', transformOrigin: '70px 70px' }}>{grade}</text>
      </svg>
    </div>
  );
}

function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    const t = setInterval(() => {
      setDisplayed(text.slice(0, ++i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return displayed;
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function DashboardPage({ orgProfile }: { orgProfile?: any }) {
  /* Clock */
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const clockStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr  = time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const hour = time.getHours();
  const greeting = hour < 12 ? 'Good Morning,' : hour < 18 ? 'Good Afternoon,' : 'Good Evening,';

  /* Workspace / Business context */
  const businessName = orgProfile?.name || 'ORYN Core';

  // Contextual, explainable KPI metrics
  const contextualKPIs = [
    {
      label: 'Monthly Recurring Revenue (MRR)',
      value: '$284,000',
      change: '+18.4% vs last 30 days',
      trend: 'up',
      period: 'Trailing 30-day billing volume',
      source: 'Stripe Gateway (Live Sync)',
      updated: 'Synced 4m ago',
      prompt: 'Analyze revenue growth breakdown across customer tiers for this month.'
    },
    {
      label: 'Active Workspace Users',
      value: '1,842',
      change: '+9.2% weekly active growth',
      trend: 'up',
      period: 'Last 7 days (Unique authenticated sessions)',
      source: 'Activity Telemetry',
      updated: 'Live stream',
      prompt: 'Identify the primary usage drivers for new active users this week.'
    },
    {
      label: 'Automated Action Throughput',
      value: '3,291',
      change: '+34.0% execution volume',
      trend: 'up',
      period: 'Current calendar month to date',
      source: 'Workflow Runner Engine',
      updated: 'Synced 1m ago',
      prompt: 'Break down automated actions by workflow: email vs data synthesis.'
    },
    {
      label: 'User Retention Rate',
      value: '91.0%',
      change: '+3.0 pts vs 90d baseline',
      trend: 'up',
      period: 'Cohort 30-day retention curve',
      source: 'Cohort Analytics',
      updated: 'Calculated at 00:00 UTC',
      prompt: 'Show cohort churn risk analysis and clients nearing renewal.'
    },
  ];

  // Active Background Workflows (Real technical daemon feel)
  const activeWorkflows = [
    {
      name: 'Inbound Lead Enrichment Worker',
      status: 'Processing',
      task: 'Enriching 14 pending CRM webhook records',
      load: 75,
      trigger: 'CRM Webhook',
      color: 'var(--success)'
    },
    {
      name: 'Support Sentiment Classifier',
      status: 'Monitoring',
      task: 'Scanning Zendesk ticket queue (p95 latency: 210ms)',
      load: 35,
      trigger: 'Ticket Event',
      color: 'var(--accent-primary)'
    },
    {
      name: 'Weekly Sales Report Generator',
      status: 'Scheduled',
      task: 'Next run: Friday at 17:00 UTC via Custom SMTP',
      load: 10,
      trigger: 'Cron (Weekly)',
      color: 'var(--text-secondary)'
    },
    {
      name: 'Enterprise Account Health Auditor',
      status: 'Active',
      task: 'Scanning 3 accounts flagged with zero 14-day activity',
      load: 60,
      trigger: 'Daily Check',
      color: 'var(--warn)'
    },
  ];

  // Operational Integrations
  const operationalIntegrations = [
    { name: 'Custom SMTP', status: 'Connected', badge: 'Active in 2 workflows', detail: 'Port 587 TLS verified', icon: '📧', isConnected: true },
    { name: 'Stripe Billing', status: 'Connected', badge: 'Telemetry active', detail: 'customer.subscription.* events', icon: '💳', isConnected: true },
    { name: 'Slack Alerts', status: 'Connected', badge: 'Channel #ops-briefings', detail: 'Incoming webhook configured', icon: '💬', isConnected: true },
    { name: 'Google Calendar', status: 'Available', badge: 'Requires OAuth', detail: 'Meeting briefing sync', icon: '📅', isConnected: false },
    { name: 'Zendesk Support', status: 'Degraded', badge: 'Timeout Warning', detail: 'Webhook latency > 4000ms', icon: '🎫', isConnected: false },
    { name: 'Notion Workspace', status: 'Available', badge: 'Token required', detail: 'Automated executive doc export', icon: '📝', isConnected: false },
  ];

  /* ── Feature state ── */
  const [cmdInput, setCmdInput]           = useState('');
  const [cmdLoading, setCmdLoading]       = useState(false);
  const [cmdResult, setCmdResult]         = useState<CommandResult | null>(null);
  const [cmdError, setCmdError]           = useState('');

  const [briefing, setBriefing]           = useState<DashboardBriefing | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(true);

  const [alerts, setAlerts]               = useState<DashboardAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const [goals, setGoals]                 = useState<DashboardGoal[]>([]);
  const [goalsLoading, setGoalsLoading]   = useState(true);
  const [goalAdvice, setGoalAdvice]       = useState<Record<string, string>>({});
  const [goalLoading, setGoalLoading]     = useState<Record<string, boolean>>({});

  const [health, setHealth]               = useState<HealthScore | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  const cmdInputRef = useRef<HTMLInputElement>(null);
  const briefingText = useTypewriter(briefing?.summary ?? '');

  /* ── Load all data on mount ── */
  useEffect(() => {
    fetchBriefing().then(setBriefing).catch(console.error).finally(() => setBriefingLoading(false));
    fetchAlerts().then(setAlerts).catch(console.error).finally(() => setAlertsLoading(false));
    fetchGoals().then(setGoals).catch(console.error).finally(() => setGoalsLoading(false));
    fetchHealthScore().then(setHealth).catch(console.error).finally(() => setHealthLoading(false));
  }, []);

  /* ── Command Bar ── */
  const handleCommand = useCallback(async (q?: string) => {
    const query = (q ?? cmdInput).trim();
    if (!query) return;
    setCmdLoading(true); setCmdError(''); setCmdResult(null);
    try {
      const result = await runCommand(query);
      setCmdResult(result);
    } catch {
      setCmdError('Telemetry service unreachable. Please ensure the ORYN backend daemon is running.');
    } finally {
      setCmdLoading(false);
    }
  }, [cmdInput]);

  const prefillCommand = (prompt: string) => {
    setCmdInput(prompt);
    setCmdResult(null);
    setTimeout(() => {
      cmdInputRef.current?.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const handleGoalAction = async (id: string) => {
    if (goalAdvice[id]) { setGoalAdvice(p => ({ ...p, [id]: '' })); return; }
    setGoalLoading(p => ({ ...p, [id]: true }));
    try {
      const { recommendation } = await fetchGoalAction(id);
      setGoalAdvice(p => ({ ...p, [id]: recommendation }));
    } catch {
      setGoalAdvice(p => ({ ...p, [id]: 'Could not generate strategic target analysis.' }));
    } finally {
      setGoalLoading(p => ({ ...p, [id]: false }));
    }
  };

  const alertBadgeTheme: Record<string, { color: string, bg: string, label: string }> = {
    critical: { color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)', label: 'CRITICAL ANOMALY' },
    warning: { color: 'var(--warn)', bg: 'rgba(234, 179, 8, 0.1)', label: 'ATTENTION REQUIRED' },
    opportunity: { color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.1)', label: 'OPPORTUNITY' },
    info: { color: 'var(--accent-primary)', bg: 'rgba(249, 115, 22, 0.1)', label: 'SYSTEM ADVISORY' },
  };

  return (
    <div className="dashboard-container" style={{ flex: 1, overflowY: 'auto', padding: '36px 40px', background: 'var(--bg)', position: 'relative' }}>
      {/* Background Subtle Technical Grid */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(var(--glass-bg-subtle) 1px, transparent 1px)', backgroundSize: '28px 28px', zIndex: 0 }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 28 }}>
        
        {/* ── Credible Header with Workspace Status ── */}
        <div className="mobile-stack" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              {/* Subtle System Status Pill */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '3px 10px', borderRadius: 6,
                background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)',
                fontSize: 11, fontWeight: 600, color: 'var(--success)', fontFamily: 'monospace'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                TELEMETRY ENGINE: ONLINE
              </div>

              {/* Sample Workspace Tag */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '3px 10px', borderRadius: 6,
                background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)',
                fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace'
              }}>
                DEMO DATASET · SAMPLE WORKSPACE
              </div>
            </div>

            <div className="dashboard-header-text" style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-script)', fontSize: 36, fontWeight: 400, color: 'var(--text-primary)' }}>{greeting}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.5 }}>{businessName}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              Enterprise Operations & Financial Telemetry Center
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{clockStr}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{dateStr} · UTC+1</div>
          </div>
        </div>

        {/* ── Command Bar ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative' }}>
          <div className="mobile-command-bar" style={{ 
            background: 'var(--card-bg)', backdropFilter: 'blur(16px)', 
            border: '1px solid var(--glass-border)', borderRadius: 14, 
            padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(249, 115, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              ref={cmdInputRef}
              className="mobile-command-input"
              value={cmdInput}
              onChange={e => setCmdInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCommand()}
              placeholder="Query enterprise telemetry (e.g. 'Analyze Q2 MRR churn risk' or 'Show late payments')..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 14,
                padding: '4px 0', minWidth: 0
              }}
            />
            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <kbd style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', background: 'var(--glass-bg-hover)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--card-border)' }}>Enter ↵</kbd>
            </div>
            <button
              onClick={() => handleCommand()}
              disabled={cmdLoading || !cmdInput.trim()}
              style={{
                background: 'var(--accent-primary)', color: 'white', border: 'none',
                borderRadius: 8, padding: '8px 18px', fontFamily: 'var(--font-display)', 
                fontSize: 13, fontWeight: 600, cursor: cmdLoading || !cmdInput.trim() ? 'not-allowed' : 'pointer',
                opacity: cmdInput.trim() ? 1 : 0.6, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              {cmdLoading ? (
                <><div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> <span>Processing</span></>
              ) : (
                <span>Execute Query</span>
              )}
            </button>
          </div>

          <AnimatePresence>
            {(cmdResult || cmdError) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginTop: 12 }}>
                <div style={{ padding: '20px', borderRadius: 12, background: cmdError ? 'rgba(239, 68, 68, 0.08)' : 'rgba(249, 115, 22, 0.04)', border: `1px solid ${cmdError ? 'rgba(239, 68, 68, 0.25)' : 'rgba(249, 115, 22, 0.2)'}` }}>
                  {cmdError ? (
                    <div style={{ color: 'var(--danger)', fontSize: 13 }}>{cmdError}</div>
                  ) : cmdResult && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)', background: 'rgba(249, 115, 22, 0.12)', padding: '2px 8px', borderRadius: 4 }}>
                          {cmdResult.type.toUpperCase()}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Target: {cmdResult.metric}</span>
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{cmdResult.answer}</div>
                      {cmdResult.action && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--glass-bg-subtle)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--glass-bg-hover)' }}>
                          <span style={{ fontSize: 14 }}>⚡</span>
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>RECOMMENDED ACTION</div>
                            <div style={{ fontSize: 13, color: 'var(--accent-primary)', fontWeight: 500, marginTop: 2 }}>{cmdResult.action}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Bento Grid ── */}
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20 }}>
          
          {/* Row 1: Executive Briefing & Health Score */}
          <div className="span-8" style={{ gridColumn: 'span 8' }}>
            <Card delay={0.05} title="Operational Briefing" subtitle="Synthesized from active Stripe billing & telemetry events (Cached: 1h)" style={{ height: '100%' }}>
            {briefingLoading ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Synthesizing telemetry data for {businessName}...</div>
            ) : briefing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.35 }}>
                  {briefing.headline}
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65, flex: 1 }}>
                  {briefingText}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(249, 115, 22, 0.04)', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(249, 115, 22, 0.15)' }}>
                  <div style={{ fontSize: 14, color: 'var(--accent-primary)', marginTop: 2 }}>💡</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.3px' }}>RECOMMENDED IMMEDIATE ACTION</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-primary)', marginTop: 2, lineHeight: 1.45 }}>{briefing.tip}</div>
                  </div>
                </div>
              </div>
            ) : null}
            </Card>
          </div>

          <div className="span-4" style={{ gridColumn: 'span 4' }}>
            <Card delay={0.1} title="System Operations Health" subtitle="Composite index across 5 subsystem telemetry feeds" style={{ alignItems: 'center', height: '100%' }}>
             {healthLoading ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Calculating telemetry vectors...</div>
             ) : health ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 18, marginTop: 4 }}>
                  <HealthGauge score={health.score} grade={health.grade} />
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {health.breakdown.map(b => (
                      <div key={b.label} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{b.label}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'monospace' }}>{b.value}%</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--glass-bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${b.value}%`, background: b.color, borderRadius: 2 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                    {health.summary}
                  </div>
                 </div>
              ) : null}
            </Card>
          </div>

          {/* Row 2: Contextual, Explainable KPIs */}
          {contextualKPIs.map((k, i) => (
            <motion.div key={k.label}
              className="span-3"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 + (i * 0.05) }}
              style={{ 
                gridColumn: 'span 3', padding: '18px 20px', borderRadius: 14,  
                background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: 'var(--shadow-subtle)'
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(249, 115, 22, 0.4)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--card-border)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              onClick={() => prefillCommand(k.prompt)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{k.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{k.period}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 26, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{k.value}</div>
                <div style={{ fontSize: 11.5, color: 'var(--success)', fontWeight: 600, marginTop: 2 }}>{k.change}</div>
              </div>

              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: 8, marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{k.source}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{k.updated}</span>
              </div>
            </motion.div>
          ))}

          {/* Row 3: Active Background Workflows & Connected Infrastructure */}
          <div className="span-7" style={{ gridColumn: 'span 7' }}>
            <Card delay={0.25} title="Active Background Workflows" subtitle="Autonomous tasks executing against connected data pipelines" style={{ height: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activeWorkflows.map((agent, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--glass-bg-subtle)', borderRadius: 10, border: '1px solid var(--card-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: agent.color }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{agent.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{agent.task}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--accent-primary)', background: 'rgba(249, 115, 22, 0.08)', padding: '2px 6px', borderRadius: 4 }}>
                        {agent.trigger}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Load: {agent.load}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="span-5" style={{ gridColumn: 'span 5' }}>
            <Card delay={0.3} title="Data Pipeline Integrations" subtitle="Status of connected enterprise endpoints" style={{ height: '100%' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
              {operationalIntegrations.map((g, i) => (
                <div key={i}
                  style={{ 
                    padding: '12px', background: g.isConnected ? 'rgba(34, 197, 94, 0.03)' : 'var(--glass-bg-subtle)', 
                    border: `1px solid ${g.isConnected ? 'rgba(34, 197, 94, 0.2)' : 'var(--card-border)'}`, 
                    borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 6, transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 16 }}>{g.icon}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, fontFamily: 'monospace',
                      color: g.status === 'Connected' ? 'var(--success)' : g.status === 'Degraded' ? 'var(--danger)' : 'var(--text-muted)'
                    }}>
                      {g.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{g.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{g.detail}</div>
                  </div>
                </div>
              ))}
              </div>
            </Card>
          </div>

          {/* Row 4: Historical Volume & Evidence-Based Alerts */}
          <div className="span-8" style={{ gridColumn: 'span 8' }}>
            <Card delay={0.35} title="Revenue Telemetry Trajectory" subtitle="Trailing 9-period volume aggregate (Stripe sample dataset)">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>$284,000</div>
                <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, paddingBottom: 2 }}>+18.4% growth vs prior cycle</div>
              </div>
              <SparkLine />
            </Card>
          </div>

          <div className="span-4" style={{ gridColumn: 'span 4' }}>
            <Card delay={0.4} title="Operational Anomaly Alerts" subtitle="Evaluated across live data feeds" style={{ height: '100%' }}>
            {alertsLoading ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Scanning feeds...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', paddingRight: 2 }}>
                {alerts.map(a => {
                  const th = alertBadgeTheme[a.type] ?? alertBadgeTheme.info;
                  return (
                    <div key={a.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 12px', background: 'var(--glass-bg-subtle)', borderRadius: 10, border: '1px solid var(--card-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: th.color, background: th.bg, padding: '2px 6px', borderRadius: 4 }}>
                          {th.label}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.time}</span>
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>{a.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{a.detail}</div>
                      <div style={{ fontSize: 11, color: 'var(--accent-primary)', fontWeight: 500, borderTop: '1px solid var(--card-border)', paddingTop: 4, marginTop: 2 }}>
                        Action: {a.action}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </Card>
          </div>

          {/* Row 5: Strategic Milestones & Targets */}
          <div className="span-12" style={{ gridColumn: 'span 12' }}>
            <Card delay={0.45} title="Strategic Operational Milestones" subtitle="Target progression tracking with algorithmic gap analysis">
            {goalsLoading ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Loading targets...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
                {goals.map(g => {
                  const pct = Math.round((g.current / g.target) * 100);
                  const fmt = (n: number) => g.unit === '$' ? `$${(n / 1000).toFixed(0)}K` : `${n.toLocaleString()}${g.unit}`;
                  return (
                    <div key={g.id} style={{ background: 'var(--glass-bg-subtle)', padding: '16px', borderRadius: 12, border: '1px solid var(--card-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 600 }}>{g.label}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>Current: {fmt(g.current)} · Target: {fmt(g.target)}</div>
                        </div>
                        <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 700, color: pct >= 80 ? 'var(--success)' : 'var(--accent-primary)' }}>
                          {pct}%
                        </div>
                      </div>
                      <div style={{ height: 6, background: 'var(--glass-bg-hover)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent-primary)', borderRadius: 3 }} />
                      </div>
                      <button
                        onClick={() => handleGoalAction(g.id)}
                        disabled={goalLoading[g.id]}
                        style={{
                          width: '100%', background: 'transparent', border: '1px solid var(--card-border)', borderRadius: 6,
                          padding: '6px 10px', color: 'var(--text-secondary)', fontSize: 11.5, fontWeight: 500,
                          cursor: goalLoading[g.id] ? 'wait' : 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-primary)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--card-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
                      >
                        {goalLoading[g.id] ? 'Synthesizing...' : goalAdvice[g.id] ? 'Hide Strategy Recommendation' : 'Run Gap Analysis'}
                      </button>
                      {goalAdvice[g.id] && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(249, 115, 22, 0.05)', border: '1px solid rgba(249, 115, 22, 0.15)', borderRadius: 6, fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          {goalAdvice[g.id]}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
