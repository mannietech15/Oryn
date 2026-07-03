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

/* ─── Static Data ───────────────────────────────────── */
const kpis = [
  { label: 'Revenue MTD',    value: '$284K', change: '+18.4%', icon: '💰', prompt: 'Analyze my revenue drivers for this month.' },
  { label: 'Active Users',   value: '1,842', change: '+9.2%',  icon: '👥', prompt: 'How can I grow active users faster?' },
  { label: 'Time Saved by ORYN', value: '340 hrs', change: '+15%', icon: '⏳', prompt: 'Break down time saved by department.' },
  { label: 'Automated Actions', value: '12,492', change: '+34%', icon: '⚡', prompt: 'Which AI workflows are most active?' },
];

const barHeights = [40, 55, 48, 65, 72, 60, 78, 85, 100];

const integrations = [
  { icon: '📧', name: 'Gmail',    connected: true  },
  { icon: '📅', name: 'Calendar', connected: true  },
  { icon: '📊', name: 'Sheets',   connected: true  },
  { icon: '💬', name: 'Slack',    connected: false },
  { icon: '🗂',  name: 'Notion',  connected: false },
  { icon: '⚡', name: 'Zapier',  connected: true  },
];

const activeAgents = [
  { name: 'Sales Co-Pilot', status: 'Running', task: 'Qualifying 43 inbound leads', load: 85, color: 'var(--success)' },
  { name: 'Data Analyst', status: 'Idle', task: 'Awaiting new datasets', load: 10, color: 'var(--accent-primary)' },
  { name: 'Support Bot', status: 'Running', task: 'Handling 12 active tickets', load: 60, color: 'var(--warn)' },
  { name: 'Marketing Agent', status: 'Optimizing', task: 'A/B testing ad copy', load: 45, color: '#ec4899' },
];

/* ─── Shared Components ───────────────────────────────────── */
function Card({ title, children, style = {}, delay = 0, action }: any) {
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            {title}
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
          {/* Vertical grid lines */}
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
export default function DashboardPage() {
  /* Clock */
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const clockStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr  = time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const hour = time.getHours();
  const greeting = hour < 12 ? 'Good Morning,' : hour < 18 ? 'Good Afternoon,' : 'Good Evening,';

  /* Workspace / Business context */
  const [businessName, setBusinessName] = useState('Acme Corp');

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
      setCmdError('Could not reach ORYN server. Make sure the backend is running.');
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
      setGoalAdvice(p => ({ ...p, [id]: 'Could not load AI advice.' }));
    } finally {
      setGoalLoading(p => ({ ...p, [id]: false }));
    }
  };

  const alertTheme: Record<string, { color: string, badge: string }> = {
    critical: { color: 'var(--danger)', badge: 'CRITICAL' },
    warning: { color: 'var(--warn)', badge: 'WARNING' },
    opportunity: { color: 'var(--success)', badge: 'OPPORTUNITY' },
    info: { color: 'var(--accent-primary)', badge: 'INFO' },
  };

  return (
    <div className="dashboard-container" style={{ flex: 1, overflowY: 'auto', padding: '40px', background: 'var(--bg)', position: 'relative' }}>
      {/* ── Background Grid & Glows ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(var(--glass-bg-subtle) 1px, transparent 1px)', backgroundSize: '32px 32px', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: -300, right: -100, width: 800, height: 800, background: 'var(--accent-primary)', filter: 'blur(250px)', opacity: 0.04, borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: -200, left: -200, width: 600, height: 600, background: 'var(--accent-primary)', filter: 'blur(200px)', opacity: 0.03, borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div className="dashboard-header-sub" style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--accent-primary)', letterSpacing: 1 }}>WORKSPACE</div>
              <div style={{ padding: '6px 14px', background: 'var(--glass-bg-hover)', borderRadius: 20, border: '1px solid var(--glass-border-subtle)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                {businessName} <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>▼</span>
              </div>
            </div>
            <div className="dashboard-header-text" style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-script)', fontSize: 44, fontWeight: 400, color: 'var(--text-primary)' }}>{greeting}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.5 }}>{businessName}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{clockStr}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{dateStr}</div>
          </div>
        </div>

        {/* ── Command Bar (Massive & Centered) ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative' }}>
          <div style={{ 
            background: 'var(--card-bg)', backdropFilter: 'blur(16px)', 
            border: '1px solid var(--glass-border)', borderRadius: 16, 
            padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(249, 115, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <input
              ref={cmdInputRef}
              value={cmdInput}
              onChange={e => setCmdInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCommand()}
              placeholder={`Ask ORYN to analyze ${businessName}'s revenue, churn, or AI tasks...`}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 16,
                padding: '4px 0'
              }}
            />
            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-body)', color: 'var(--text-muted)', background: 'var(--glass-bg-hover)', padding: '4px 8px', borderRadius: 6 }}>Press Enter ↵</div>
            </div>
            <button
                onClick={() => handleCommand()}
                disabled={cmdLoading || !cmdInput.trim()}
                style={{
                  background: 'var(--accent-primary)', color: 'white', border: 'none',
                  borderRadius: 10, padding: '10px 24px', fontFamily: 'var(--font-display)', 
                  fontSize: 14, fontWeight: 600, cursor: cmdLoading || !cmdInput.trim() ? 'not-allowed' : 'pointer',
                  opacity: cmdInput.trim() ? 1 : 0.5, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                {cmdLoading ? (
                  <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Thinking</>
                ) : 'Ask ORYN'}
              </button>
          </div>

          <AnimatePresence>
            {(cmdResult || cmdError) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginTop: 16 }}>
                <div style={{ padding: '24px', borderRadius: 16, background: cmdError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(249, 115, 22, 0.05)', border: `1px solid ${cmdError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(249, 115, 22, 0.2)'}`, backdropFilter: 'blur(12px)' }}>
                  {cmdError ? (
                    <div style={{ color: 'var(--danger)', fontSize: 14 }}>{cmdError}</div>
                  ) : cmdResult && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: 'var(--accent-primary)', background: 'rgba(249, 115, 22, 0.1)', padding: '4px 10px', borderRadius: 6 }}>{cmdResult.type.toUpperCase()}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Analyzed: {cmdResult.metric}</div>
                      </div>
                      <div style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.6 }}>{cmdResult.answer}</div>
                      {cmdResult.action && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--glass-bg-subtle)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--glass-bg-hover)' }}>
                          <span style={{ marginTop: 2 }}>⚡</span>
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Recommended Action</div>
                            <div style={{ fontSize: 14, color: 'var(--accent-primary)', fontWeight: 500 }}>{cmdResult.action}</div>
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

        {/* ── Bento Box Grid ── */}
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }}>
          
          {/* Row 1: Briefing & Health */}
          <div className="span-8" style={{ gridColumn: 'span 8' }}>
            <Card delay={0.1} title="Executive Briefing" style={{ height: '100%' }}>
            {briefingLoading ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Generating briefing for {businessName}...</div>
            ) : briefing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
                  {briefing.headline}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>
                  {briefingText}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(249, 115, 22, 0.05)', padding: '16px', borderRadius: 12, border: '1px dashed rgba(249, 115, 22, 0.2)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(249, 115, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>💡</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--accent-primary)', fontWeight: 600, marginBottom: 2 }}>TOP PRIORITY</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{briefing.tip}</div>
                  </div>
                </div>
              </div>
            ) : null}
            </Card>
          </div>

          <div className="span-4" style={{ gridColumn: 'span 4' }}>
            <Card delay={0.15} title="Business Operations Health" style={{ alignItems: 'center', height: '100%' }}>
             {healthLoading ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Analyzing...</div>
             ) : health ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 24, marginTop: 10 }}>
                  <HealthGauge score={health.score} grade={health.grade} />
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {health.breakdown.map(b => (
                      <div key={b.label} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{b.label}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{b.value}%</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--glass-bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${b.value}%`, background: b.color, borderRadius: 2 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                 </div>
              ) : null}
            </Card>
          </div>

          {/* Row 2: KPIs */}
          {kpis.map((k, i) => (
            <motion.div key={k.label}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 + (i * 0.05) }}
              style={{ 
                gridColumn: 'span 3', padding: '20px', borderRadius: 16,  
                background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                display: 'flex', flexDirection: 'column', gap: 16, cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: 'var(--shadow-subtle)'
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--glass-border)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--card-border)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              onClick={() => prefillCommand(k.prompt)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{k.label}</div>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--glass-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{k.icon}</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{k.value}</div>
                <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500 }}>{k.change} vs last month</div>
              </div>
            </motion.div>
          ))}

          {/* Row 3: Agent Swarm & Active Integrations */}
          <div className="span-7" style={{ gridColumn: 'span 7' }}>
            <Card delay={0.25} title="Active AI Agents" style={{ height: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {activeAgents.map(agent => (
                  <div key={agent.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--glass-bg-subtle)', borderRadius: 12, border: '1px solid var(--glass-border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ position: 'relative', width: 10, height: 10 }}>
                        {agent.status === 'Running' && <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: agent.color, opacity: 0.5, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />}
                        <div style={{ position: 'relative', width: 10, height: 10, borderRadius: '50%', background: agent.color }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{agent.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{agent.task}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 120 }}>
                      <div style={{ height: 6, flex: 1, background: 'var(--glass-bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${agent.load}%`, background: agent.color, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', width: 30, textAlign: 'right' }}>{agent.load}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="span-5" style={{ gridColumn: 'span 5' }}>
            <Card delay={0.3} title="Data Pipeline Integrations" style={{ height: '100%' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
              {integrations.map(g => (
                <div key={g.name}
                  style={{ 
                    padding: '16px', background: g.connected ? 'rgba(249, 115, 22, 0.03)' : 'var(--glass-bg-subtle)', 
                    border: `1px solid ${g.connected ? 'rgba(249, 115, 22, 0.15)' : 'var(--glass-bg-subtle)'}`, 
                    borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s', cursor: 'pointer'
                  }}
                  onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.background = 'rgba(249, 115, 22, 0.08)'; d.style.borderColor = 'rgba(249, 115, 22, 0.3)'; }}
                  onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.background = g.connected ? 'rgba(249, 115, 22, 0.03)' : 'var(--glass-bg-subtle)'; d.style.borderColor = g.connected ? 'rgba(249, 115, 22, 0.15)' : 'var(--glass-bg-subtle)'; }}
                >
                  <span style={{ fontSize: 20 }}>{g.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{g.name}</div>
                    <div style={{ fontSize: 11, color: g.connected ? 'var(--accent-primary)' : 'var(--text-muted)', marginTop: 2 }}>
                      {g.connected ? 'Connected' : 'Configure'}
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </Card>
          </div>

          {/* Row 4: Chart & Alerts */}
          <div className="span-8" style={{ gridColumn: 'span 8' }}>
            <Card delay={0.35} title="Revenue Analytics" style={{ height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>$284K</div>
              <div style={{ fontSize: 13, color: 'var(--success)', fontWeight: 500, paddingBottom: 4 }}>+18.4%</div>
            </div>
            <SparkLine />
            </Card>
          </div>

          <div className="span-4" style={{ gridColumn: 'span 4' }}>
            <Card delay={0.4} title="Smart Alerts" style={{ height: '100%' }}>
            {alertsLoading ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Scanning...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', paddingRight: 4 }}>
                {alerts.map(a => {
                  const th = alertTheme[a.type] ?? alertTheme.info;
                  return (
                    <div key={a.id} style={{ display: 'flex', gap: 12, padding: '12px', background: 'var(--glass-bg-subtle)', borderRadius: 12, border: '1px solid var(--glass-bg-subtle)' }}>
                      <div style={{ fontSize: 16, marginTop: 2 }}>{a.icon}</div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{a.title}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.time}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 6 }}>{a.detail}</div>
                        <div style={{ fontSize: 11, color: th.color, fontWeight: 500 }}>Action: {a.action}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </Card>
          </div>

          {/* Row 5: Strategic Goals */}
          <div className="span-12" style={{ gridColumn: 'span 12' }}>
            <Card delay={0.45} title="Strategic AI Goals">
            {goalsLoading ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading goals...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                {goals.map(g => {
                  const pct = Math.round((g.current / g.target) * 100);
                  const fmt = (n: number) => g.unit === '$' ? `$${(n / 1000).toFixed(0)}K` : `${n.toLocaleString()}${g.unit}`;
                  return (
                    <div key={g.id} style={{ background: 'var(--glass-bg-subtle)', padding: '20px', borderRadius: 16, border: '1px solid var(--glass-border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div>
                          <div style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>{g.label}</div>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fmt(g.current)} / {fmt(g.target)}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)' }}>{pct}%</div>
                        </div>
                      </div>
                      <div style={{ height: 8, background: 'var(--glass-bg-hover)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent-primary)', borderRadius: 4 }} />
                      </div>
                      <button
                        onClick={() => handleGoalAction(g.id)}
                        disabled={goalLoading[g.id]}
                        style={{ width: '100%', background: 'var(--card-bg)', border: '1px solid var(--glass-bg-hover)', borderRadius: 8, padding: '10px', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: goalLoading[g.id] ? 'wait' : 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(249, 115, 22, 0.1)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(249, 115, 22, 0.2)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--card-bg)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glass-bg-hover)'; }}
                      >
                        {goalLoading[g.id] ? '...' : goalAdvice[g.id] ? 'Hide Advice' : 'Ask AI for Advice'}
                      </button>
                      {goalAdvice[g.id] && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(249, 115, 22, 0.05)', border: '1px solid rgba(249, 115, 22, 0.1)', borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
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
