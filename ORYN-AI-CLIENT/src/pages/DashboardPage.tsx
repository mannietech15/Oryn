import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import DashboardScene from '../components/DashboardScene';
import {
  runCommand, fetchBriefing, fetchAlerts, fetchGoals,
  fetchGoalAction, fetchHealthScore,
} from '../api/dashboard';
import type {
  CommandResult, DashboardBriefing, DashboardAlert,
  DashboardGoal, HealthScore,
} from '../types';

/* ─── Static KPI data ───────────────────────────────────── */
const kpis = [
  { label: 'Revenue MTD',    value: '$284K', change: '+18.4%', icon: '💰', color: 'var(--accent)',  glow: 'rgba(249, 115, 22,0.35)',  prompt: 'How is my revenue trending and what should I do to reach $500K this quarter?' },
  { label: 'Active Users',   value: '1,842', change: '+9.2%',  icon: '👥', color: 'var(--violet)',  glow: 'rgba(138,43,226,0.35)', prompt: 'How can I grow active users faster and reduce churn risk?' },
  { label: 'AI Tasks Done',  value: '3,291', change: '+34%',   icon: '⚡', color: 'var(--accent-cyan)',    glow: 'rgba(249, 115, 22,0.35)',  prompt: 'My AI task completion is at 3291 and growing 34%. How do I sustain this momentum?' },
  { label: 'Retention Rate', value: '91%',   change: '+3pts',  icon: '🎯', color: 'var(--success)', glow: 'rgba(0,255,170,0.35)',  prompt: 'How do I push my retention rate from 91% to 95%?' },
];

const months     = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
const barHeights = [40, 55, 48, 65, 72, 60, 78, 85, 100];

const integrations = [
  { icon: '📧', name: 'Gmail',    connected: true  },
  { icon: '📅', name: 'Calendar', connected: true  },
  { icon: '📊', name: 'Sheets',   connected: true  },
  { icon: '💬', name: 'Slack',    connected: false },
  { icon: '🗂',  name: 'Notion',  connected: false },
  { icon: '⚡', name: 'Zapier',  connected: true  },
];

/* ─── Alert theme map ────────────────────────────────────── */
const alertTheme: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  critical:    { bg: 'rgba(255,51,102,0.08)',  border: 'rgba(255,51,102,0.35)',  badge: '#ff3366', text: 'CRITICAL'    },
  warning:     { bg: 'rgba(255,170,0,0.08)',   border: 'rgba(255,170,0,0.35)',   badge: '#ffaa00', text: 'WARNING'     },
  opportunity: { bg: 'rgba(0,255,170,0.07)',   border: 'rgba(0,255,170,0.30)',   badge: '#00ffaa', text: 'OPPORTUNITY' },
  info:        { bg: 'rgba(249, 115, 22,0.07)',   border: 'rgba(249, 115, 22,0.25)',   badge: '#f97316', text: 'INFO'        },
};

/* ─── SVG Sparkline ──────────────────────────────────────── */
function SparkLine() {
  const W = 420, H = 110, pad = 12;
  const max = Math.max(...barHeights);
  const pts = barHeights.map((h, i) => ({
    x: pad + (i / (barHeights.length - 1)) * (W - pad * 2),
    y: H - pad - (h / max) * (H - pad * 2),
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {[0.25, 0.5, 0.75, 1].map(r => (
        <line key={r} x1={pad} y1={pad + (1 - r) * (H - pad * 2)} x2={W - pad} y2={pad + (1 - r) * (H - pad * 2)} stroke="rgba(249, 115, 22,0.08)" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#areaGrad)" />
      <path d={line} fill="none" stroke="var(--accent-cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 5 : 3.5}
          fill={i === pts.length - 1 ? 'var(--accent-cyan)' : 'var(--bg)'}
          stroke="var(--accent-cyan)" strokeWidth="2"
          style={i === pts.length - 1 ? { filter: 'drop-shadow(0 0 6px var(--accent-cyan))' } : {}}
        />
      ))}
      {months.map((m, i) => (
        <text key={m} x={pts[i].x} y={H + 4} textAnchor="middle" fontSize="9"
          fontFamily="var(--font-display)" fontWeight="600" letterSpacing="1"
          fill={i === months.length - 1 ? 'var(--accent-cyan)' : 'var(--text-secondary)'}>{m}</text>
      ))}
    </svg>
  );
}

/* ─── Radial Ring ────────────────────────────────────────── */
function Ring({ value, color, label }: { value: number; color: string; label: string }) {
  const r = 28, circ = 2 * Math.PI * r, dash = (value / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 5px ${color})`, transition: 'stroke-dasharray 1s ease' }} />
        <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700"
          fill="white" fontFamily="var(--font-display)"
          style={{ transform: 'rotate(90deg)', transformOrigin: '36px 36px' }}>{value}%</text>
      </svg>
      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', letterSpacing: 0, textTransform: 'none' }}>{label}</span>
    </div>
  );
}

/* ─── Glass Card ─────────────────────────────────────────── */
function Card({ title, accent, children, style, delay = 0 }: { title: string; accent?: string; children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      className="glass-panel"
      style={{
        borderRadius: 16, padding: '26px 26px 22px',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 18, ...style,
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: accent ?? 'var(--accent-primary)',
        opacity: 0.8 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
          letterSpacing: 0, color: accent ?? 'var(--accent-cyan)', textTransform: 'none',
          textShadow: `0 0 10px ${accent ?? 'var(--accent-cyan)'}60` }}><span className="color-circle"></span>{title}</div>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent ?? 'var(--accent-cyan)',
          boxShadow: `0 0 8px ${accent ?? 'var(--accent-cyan)'}` }} />
      </div>
      {children}
    </motion.div>
  );
}

/* ─── Typewriter hook ────────────────────────────────────── */
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

/* ─── Health Score Gauge ─────────────────────────────────── */
function HealthGauge({ score, grade }: { score: number; grade: string }) {
  const r = 56, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const scoreColor = score >= 85 ? 'var(--success)' : score >= 65 ? 'var(--warn)' : 'var(--danger)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={scoreColor} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${scoreColor})`, transition: 'stroke-dasharray 1.2s ease' }} />
        <text x="70" y="66" textAnchor="middle" fontSize="26" fontWeight="800"
          fill="white" fontFamily="var(--font-display)"
          style={{ transform: 'rotate(90deg)', transformOrigin: '70px 70px' }}>{score}</text>
        <text x="70" y="84" textAnchor="middle" fontSize="13" fontWeight="600"
          fill={scoreColor} fontFamily="var(--font-display)"
          style={{ transform: 'rotate(90deg)', transformOrigin: '70px 70px' }}>{grade}</text>
      </svg>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function DashboardPage() {
  /* Clock */
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const clockStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr  = time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

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
    setTimeout(() => cmdInputRef.current?.focus(), 50);
  };

  /* ── Goal AI Action ── */
  const handleGoalAction = async (id: string) => {
    if (goalAdvice[id]) { setGoalAdvice(p => ({ ...p, [id]: '' })); return; }
    setGoalLoading(p => ({ ...p, [id]: true }));
    try {
      const { recommendation } = await fetchGoalAction(id);
      setGoalAdvice(p => ({ ...p, [id]: recommendation }));
    } catch {
      setGoalAdvice(p => ({ ...p, [id]: 'Could not load AI advice. Ensure backend is running.' }));
    } finally {
      setGoalLoading(p => ({ ...p, [id]: false }));
    }
  };

  /* ── Mood color ── */
  const moodColor: Record<string, string> = { strong: 'var(--success)', growing: 'var(--accent-cyan)', steady: 'var(--accent)', caution: 'var(--warn)' };

  const cmdTypeColor: Record<string, string> = {
    insight: 'var(--accent-cyan)', warning: 'var(--warn)', opportunity: 'var(--success)', analysis: 'var(--violet)',
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px 56px', display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
      <DashboardScene />

      {/* ─── Hero Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, letterSpacing: 0, color: 'var(--text-secondary)', textTransform: 'none', marginBottom: 8 }}>Live Intelligence Overview</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: 0, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            <span style={{ color: 'var(--accent-cyan)', textShadow: '0 0 20px rgba(249, 115, 22,0.7)' }}>ORYN</span>{' '}Dashboard
          </div>
        </div>
        <div className="glass-panel" style={{ borderRadius: 12, padding: '12px 20px', textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--accent-cyan)', letterSpacing: 0, fontVariantNumeric: 'tabular-nums', textShadow: '0 0 12px rgba(249, 115, 22,0.6)' }}>{clockStr}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: 0, marginTop: 2 }}>{dateStr}</div>
        </div>
      </div>

      {/* ─── ORYN Command Bar ─── */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} style={{ position: 'relative', zIndex: 1 }}>
        <div className="glass-panel" style={{
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          {/* Bar header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 22px', borderBottom: '1px solid var(--glass-border)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-primary)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🧠</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 0 }}>ORYN Command Bar</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--text-secondary)', letterSpacing: 0 }}>ASK ANYTHING ABOUT YOUR BUSINESS</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,255,170,0.08)', border: '1px solid rgba(0,255,170,0.2)', borderRadius: 8, padding: '4px 10px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 6px var(--success)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--success)', letterSpacing: 0 }}>AI LIVE</span>
            </div>
          </div>

          {/* Input row */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 12 } as any}>
            <input
              ref={cmdInputRef}
              value={cmdInput}
              onChange={e => setCmdInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCommand()}
              placeholder='e.g. "How is my revenue trending?" or "What should I focus on today?"'
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 14,
              }}
            />
            <button
              onClick={() => handleCommand()}
              disabled={cmdLoading || !cmdInput.trim()}
              style={{
                background: cmdLoading ? 'rgba(249, 115, 22,0.08)' : 'var(--accent-primary)',
                border: 'none', borderRadius: 10, padding: '10px 20px', color: 'white',
                fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: 0,
                cursor: cmdLoading || !cmdInput.trim() ? 'not-allowed' : 'pointer',
                opacity: cmdInput.trim() ? 1 : 0.5,
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
              }}
            >
              {cmdLoading ? (
                <>
                  <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Thinking…
                </>
              ) : '⟁ Ask ORYN'}
            </button>
          </div>

          {/* Suggested prompts */}
          {!cmdResult && !cmdLoading && (
            <div style={{ display: 'flex', gap: 8, padding: '0 16px 14px', flexWrap: 'wrap' }}>
              {["What's my biggest opportunity today?", "Which team member is underperforming?", "How do I improve retention by 4%?"].map(s => (
                <button key={s} onClick={() => { setCmdInput(s); setTimeout(() => handleCommand(s), 0); }}
                  style={{ background: 'rgba(249, 115, 22,0.06)', border: '1px solid rgba(249, 115, 22,0.15)', borderRadius: 8, padding: '5px 12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, letterSpacing: 0, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(249, 115, 22,0.4)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-cyan)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(249, 115, 22,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
                >{s}</button>
              ))}
            </div>
          )}

          {/* Result card */}
          {(cmdResult || cmdError) && (
            <div style={{ margin: '0 16px 16px', padding: '18px 20px', borderRadius: 12, background: cmdError ? 'rgba(255,51,102,0.06)' : `${cmdTypeColor[cmdResult?.type ?? 'insight']}0d`, border: `1px solid ${cmdError ? 'rgba(255,51,102,0.25)' : `${cmdTypeColor[cmdResult?.type ?? 'insight']}40`}` }}>
              {cmdError ? (
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--danger)' }}>⚠ {cmdError}</div>
              ) : cmdResult && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, letterSpacing: 0, textTransform: 'none', color: cmdTypeColor[cmdResult.type], background: `${cmdTypeColor[cmdResult.type]}18`, borderRadius: 5, padding: '3px 8px' }}>{cmdResult.type}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--text-secondary)', letterSpacing: 0 }}>↪ {cmdResult.metric}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)', lineHeight: 1.65, marginBottom: cmdResult.action ? 14 : 0 }}>{cmdResult.answer}</div>
                  {cmdResult.action && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '10px 14px', background: `${cmdTypeColor[cmdResult.type]}10`, borderRadius: 8, border: `1px solid ${cmdTypeColor[cmdResult.type]}25` }}>
                      <span style={{ fontSize: 14 }}>⚡</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: cmdTypeColor[cmdResult.type], letterSpacing: 0 }}>Next action: {cmdResult.action}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── KPI Row ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, position: 'relative', zIndex: 1 }}>
        {kpis.map(k => (
          <motion.div key={k.label}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="glass-panel"
            style={{ padding: '14px 18px', borderRadius: 12, borderTop: `3px solid ${k.color}`, backdropFilter: 'blur(16px)', boxShadow: `0 6px 24px rgba(0,0,0,0.3), 0 0 24px ${k.glow} inset`, position: 'relative', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 32px rgba(0,0,0,0.4), 0 0 36px ${k.glow} inset`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 6px 24px rgba(0,0,0,0.3), 0 0 24px ${k.glow} inset`; }}
          >
            <div style={{ position: 'absolute', top: -16, right: -16, width: 55, height: 55, borderRadius: '50%', background: k.color, opacity: 0.1, filter: 'blur(16px)' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: 0, color: 'var(--text-secondary)', textTransform: 'none' }}>{k.label}</div>
              <span style={{ fontSize: 15 }}>{k.icon}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 8, textShadow: `0 0 16px ${k.color}60` }}>{k.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: `${k.color}18`, borderRadius: 5, padding: '3px 8px', fontSize: 11, fontWeight: 700, color: k.color, textShadow: `0 0 8px ${k.color}80` }}>
                <span>▲</span>{k.change}
              </div>
              <button
                onClick={() => prefillCommand(k.prompt)}
                style={{ background: 'rgba(249, 115, 22,0.06)', border: '1px solid var(--glass-border)', borderRadius: 6, padding: '3px 8px', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, letterSpacing: 0, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-cyan)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(249, 115, 22,0.4)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glass-border)'; }}
              >Ask ORYN ▶</button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Daily Briefing + Health Score ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, position: 'relative', zIndex: 1 }}>
        {/* Briefing */}
        <Card delay={0.1} title="ORYN Daily Briefing" accent="var(--accent-cyan)" style={{ minHeight: 160 }}>
          {briefingLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 13 }}>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(249, 115, 22,0.3)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ORYN is generating your briefing…
            </div>
          ) : briefing ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, flex: 1 }}>{briefing.headline}</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: moodColor[briefing.mood] ?? 'var(--accent-cyan)', textShadow: `0 0 15px ${moodColor[briefing.mood] ?? 'var(--accent-cyan)'}` }}>{briefing.highlight}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, letterSpacing: 0, color: moodColor[briefing.mood] ?? 'var(--accent-cyan)', textTransform: 'none', background: `${moodColor[briefing.mood] ?? 'var(--accent-cyan)'}15`, padding: '2px 8px', borderRadius: 4 }}>{briefing.mood}</div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)', lineHeight: 1.65 }}>{briefingText}</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: 'rgba(249, 115, 22,0.06)', border: '1px solid var(--glass-border)', borderRadius: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, letterSpacing: 0, color: 'var(--accent-cyan)', textTransform: 'none', marginBottom: 4 }}>AI Recommended Action Today</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>{briefing.tip}</div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Could not load briefing — check your backend connection.</div>
          )}
        </Card>

        {/* Health Score */}
        <Card delay={0.2} title="Business Health Score" accent="var(--success)" style={{ minWidth: 260, alignItems: 'center' }}>
          {healthLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 13 }}>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(0,255,170,0.3)', borderTopColor: 'var(--success)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Calculating…
            </div>
          ) : health ? (
            <>
              <HealthGauge score={health.score} grade={health.grade} />
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {health.breakdown.map(b => (
                  <div key={b.label} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: 0 }}>{b.label}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: b.color }}>{b.value}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${b.value}%`, background: b.color, borderRadius: 2, boxShadow: `0 0 6px ${b.color}` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--success)', letterSpacing: 0, textAlign: 'center' }}>{health.trend}</div>
            </>
          ) : null}
        </Card>
      </div>

      {/* ─── Main Chart + Smart Alerts ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, position: 'relative', zIndex: 1 }}>
        {/* Revenue Chart */}
        <Card delay={0.3} title="Monthly Revenue Trend" accent="var(--accent-cyan)">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: -6 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>$284K</div>
              <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, marginTop: 2 }}>▲ +18.4% this month</div>
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ width: 20, height: 2, background: 'var(--accent-cyan)', display: 'inline-block', borderRadius: 1 }} />Revenue
            </span>
          </div>
          <SparkLine />
        </Card>

        {/* Smart Alert Feed */}
        <Card delay={0.4} title="Smart Alert Feed" accent="var(--warn)">
          {alertsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 13 }}>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,170,0,0.3)', borderTopColor: 'var(--warn)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              AI is scanning for alerts…
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alerts.map((a) => {
                const th = alertTheme[a.type] ?? alertTheme.info;
                return (
                  <div key={a.id} style={{ background: th.bg, border: `1px solid ${th.border}`, borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.2 }}>{a.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: 8, fontWeight: 800, letterSpacing: 0, textTransform: 'none', color: th.badge, background: `${th.badge}18`, padding: '2px 6px', borderRadius: 4 }}>{th.text}</span>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, color: 'var(--text-secondary)', letterSpacing: 0 }}>{a.time}</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{a.title}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{a.detail}</div>
                        <div style={{ marginTop: 6, fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 600, color: th.badge }}>⚡ {a.action}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ─── Goal Tracker + Integrations ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, position: 'relative', zIndex: 1 }}>
        {/* Goal / OKR Tracker */}
        <Card delay={0.5} title="Goal & OKR Tracker" accent="var(--accent)">
          {goalsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 13 }}>
              <div style={{ width: 16, height: 16, border: '2px solid rgba(249, 115, 22,0.3)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Loading goals…
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {goals.map(g => {
                const pct = Math.round((g.current / g.target) * 100);
                const fmt = (n: number) => g.unit === '$' ? `$${(n / 1000).toFixed(0)}K` : `${n.toLocaleString()}${g.unit}`;
                return (
                  <div key={g.id}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 0 }}>{g.label}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--text-secondary)', letterSpacing: 0, marginTop: 2 }}>{fmt(g.current)} / {fmt(g.target)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: g.color, textShadow: `0 0 10px ${g.color}` }}>{pct}%</div>
                        <button
                          onClick={() => handleGoalAction(g.id)}
                          disabled={goalLoading[g.id]}
                          style={{ background: `${g.color}15`, border: `1px solid ${g.color}40`, borderRadius: 7, padding: '5px 10px', color: g.color, fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, letterSpacing: 0, cursor: goalLoading[g.id] ? 'wait' : 'pointer', transition: 'all 0.2s' }}
                        >
                          {goalLoading[g.id] ? '…' : goalAdvice[g.id] ? 'Hide ✕' : '💡 AI Advice'}
                        </button>
                      </div>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: g.color, borderRadius: 4, boxShadow: `0 0 10px ${g.color}80`, transition: 'width 0.8s ease' }} />
                    </div>
                    {goalAdvice[g.id] && (
                      <div style={{ marginTop: 10, padding: '10px 14px', background: `${g.color}0d`, border: `1px solid ${g.color}25`, borderRadius: 10, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text)', lineHeight: 1.6 }}>
                        {goalAdvice[g.id]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Integrations */}
        <Card delay={0.6} title="Connected Integrations" accent="var(--violet)">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {integrations.map(g => (
              <div key={g.name}
                style={{ padding: '12px 14px', background: 'var(--card-bg)', border: `1px solid ${g.connected ? 'var(--glass-border)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = g.connected ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.15)'; d.style.background = g.connected ? 'rgba(249, 115, 22,0.07)' : 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = g.connected ? 'var(--glass-border)' : 'rgba(255,255,255,0.05)'; d.style.background = 'var(--card-bg)'; }}
              >
                <span style={{ fontSize: 18 }}>{g.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: g.connected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{g.name}</div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: 0, textTransform: 'none', marginTop: 2, color: g.connected ? 'var(--success)' : 'rgba(255,255,255,0.25)', textShadow: g.connected ? '0 0 6px var(--success)' : 'none' }}>
                    {g.connected ? '● Live' : '○ Off'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ─── AI Health Metrics ─── */}
      <Card delay={0.7} title="AI Engine Health" accent="var(--success)" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[{ label: 'Accuracy', value: 97, color: 'var(--accent-cyan)' }, { label: 'Throughput', value: 84, color: 'var(--accent)' }, { label: 'Uptime', value: 99, color: 'var(--success)' }].map(m => <Ring key={m.label} {...m} />)}
          </div>
          <div style={{ padding: '16px 20px', background: 'rgba(0,255,170,0.06)', border: '1px solid rgba(0,255,170,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)', flexShrink: 0, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: 'var(--success)', fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: 0 }}>All systems operational · No incidents detected</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[{ label: 'Requests / min', val: '284', color: 'var(--accent-cyan)' }, { label: 'Avg Latency', val: '1.2s', color: 'var(--accent)' }, { label: 'Error Rate', val: '0.03%', color: 'var(--success)' }].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: 'rgba(4,14,31,0.5)', border: '1px solid rgba(249, 115, 22,0.08)', borderRadius: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--text-secondary)', letterSpacing: 0 }}>{s.label}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: s.color, textShadow: `0 0 8px ${s.color}` }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
