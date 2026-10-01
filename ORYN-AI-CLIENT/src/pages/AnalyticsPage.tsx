import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, Activity, Target, Search, 
  BarChart3, ShieldCheck, Zap, Download, Clock
} from 'lucide-react';

const contextualAnalyticsKpis = [
  {
    icon: <TrendingUp size={22} />,
    value: '+18.4%',
    label: 'Revenue Growth',
    period: 'Past 30 days vs baseline',
    source: 'Stripe Billing Gateway',
    accent: 'var(--accent-primary)',
    trend: 'up',
    detail: 'Enterprise tier additions'
  },
  {
    icon: <Activity size={22} />,
    value: '3,291',
    label: 'Workflow Executions',
    period: 'Current month to date',
    source: 'Automation Engine',
    accent: 'var(--text-primary)',
    trend: 'up',
    detail: '99.3% execution success'
  },
  {
    icon: <Zap size={22} />,
    value: '185ms',
    label: 'System Latency (P95)',
    period: 'Last 24 hours ingress',
    source: 'Gateway Telemetry',
    accent: 'var(--text-secondary)',
    trend: 'down',
    detail: 'Zero threshold breaches'
  },
  {
    icon: <Target size={22} />,
    value: '91.0%',
    label: 'Target Progress',
    period: 'Q2 Strategic Milestones',
    source: 'Operations Tracker',
    accent: 'var(--text-primary)',
    trend: 'up',
    detail: '4 of 4 targets on track'
  },
];

const domainBreakdown = [
  { label: 'Customer Intelligence & CRM', pct: 42, color: 'var(--accent-primary)' },
  { label: 'Workflow Automations & Dispatch', pct: 28, color: 'var(--text-primary)' },
  { label: 'Semantic Document Search', pct: 18, color: 'var(--text-secondary)' },
  { label: 'Document Forensics (Vision)', pct: 12, color: 'var(--text-muted)' },
];

function AnCard({ title, subtitle, children, colSpan, style, delay = 0 }: { title: string; subtitle?: string; children: React.ReactNode; colSpan?: number; style?: React.CSSProperties, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      style={{ 
        background: 'var(--card-bg)', 
        border: '1px solid var(--card-border)', 
        borderRadius: 20, 
        padding: '28px', 
        boxShadow: 'var(--shadow-subtle)', 
        gridColumn: colSpan ? `span ${colSpan}` : undefined,
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 12, 
          fontWeight: 700, 
          letterSpacing: 1.5, 
          color: 'var(--text-secondary)', 
          textTransform: 'uppercase', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 10 
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }} />
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {subtitle}
          </div>
        )}
      </div>
      {children}
    </motion.div>
  );
}

function OperationalInsightSummary() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ 
        position: 'relative',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 16,
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: 'var(--shadow-subtle)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--card-border)', paddingBottom: 12 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }} />
          OPERATIONAL INSIGHT · EVIDENCE-ORIENTED SUMMARY
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          EVALUATED AT: 14:00 UTC · DATASET: STRIPE_BILLING_STREAM
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Step 1: Observation */}
        <div style={{ background: 'var(--glass-bg-subtle)', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>
            1. OBSERVATION
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            Revenue increased <strong style={{ color: 'var(--success)' }}>18.4%</strong> over the last 30 days, totaling <strong style={{ color: 'var(--text-primary)' }}>$284,000</strong> gross volume.
          </div>
        </div>

        {/* Step 2: Evidence */}
        <div style={{ background: 'var(--glass-bg-subtle)', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>
            2. EVIDENCE
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            Stripe billing telemetry confirms the growth was concentrated in Enterprise contract expansions (+34% YoY) with zero churn.
          </div>
        </div>

        {/* Step 3: Action */}
        <div style={{ background: 'rgba(249, 115, 22, 0.05)', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(249, 115, 22, 0.2)' }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--accent-primary)', fontWeight: 700, marginBottom: 4 }}>
            3. RECOMMENDED ACTION
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            Prioritize enterprise expansion outreach for the 2 accounts currently entering late-stage renewal negotiations.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AskORYN() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 720, margin: '0 auto' }}>
      <motion.div
        animate={{
          borderColor: isFocused ? 'var(--accent-primary)' : 'var(--card-border)'
        }}
        style={{
          borderRadius: 24,
          background: 'var(--card-bg)',
          border: '1px solid',
          display: 'flex',
          alignItems: 'center',
          padding: '6px 20px',
          boxShadow: 'var(--shadow-subtle)',
          transition: 'border-color 0.2s ease'
        }}
      >
        <Search size={18} color={isFocused ? 'var(--accent-primary)' : 'var(--text-muted)'} />
        <input 
          type="text" 
          placeholder="Ask ORYN to query specific operational metrics, cohort trends, or telemetry..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          style={{
            flex: 1,
            padding: '12px 14px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            outline: 'none',
          }}
        />
        {query && (
          <button 
            style={{ 
              background: 'var(--accent-primary)', color: '#fff', border: 'none', 
              borderRadius: 8, padding: '6px 14px', fontSize: 12.5, fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Execute
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {(isFocused && !query) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{ 
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 10, 
              background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12,
              padding: 16, zIndex: 100, boxShadow: '0 16px 32px rgba(0,0,0,0.4)'
            }}
          >
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 700, letterSpacing: 1, fontFamily: 'monospace' }}>
              SUGGESTED TELEMETRY QUERIES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { text: 'Compare 30-day enterprise renewal rate against Q1 baseline', icon: <TrendingUp size={14} /> },
                { text: 'Analyze API latency distribution across regional worker nodes', icon: <Activity size={14} /> },
                { text: 'Show accounts flagged for churn risk in the last 14 days', icon: <Target size={14} /> }
              ].map((s) => (
                <div 
                  key={s.text}
                  style={{ 
                    padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, 
                    display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)',
                    background: 'var(--glass-bg-subtle)'
                  }} 
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--glass-bg-hover)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--glass-bg-subtle)'}
                >
                  <span style={{ color: 'var(--accent-primary)' }}>{s.icon}</span>
                  {s.text}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PerformanceChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    let initialData: any[] = [];
    let currentActual = 40;
    
    for (let i = -12; i <= 4; i++) {
      if (i < 0) {
        currentActual += (Math.random() * 8 - 3);
        currentActual = Math.max(20, Math.min(90, currentActual));
        initialData.push({ time: i, actual: currentActual, forecast: null });
      } else if (i === 0) {
        currentActual += (Math.random() * 8 - 3);
        currentActual = Math.max(20, Math.min(90, currentActual));
        initialData.push({ time: i, actual: currentActual, forecast: currentActual });
      } else {
        let forecastVal = currentActual + i * 4;
        initialData.push({ time: i, actual: null, forecast: Math.max(0, Math.min(100, forecastVal)) });
      }
    }
    setData(initialData);
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 8, padding: '10px 14px', boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }}>
          <div style={{ color: 'var(--accent-primary)', fontWeight: 700, marginBottom: 4, letterSpacing: 0.5, fontSize: 11, fontFamily: 'monospace' }}>TELEMETRY POINT</div>
          {payload.map((p: any, i: number) => (
             p.value != null && (
               <div key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
                 {p.name === 'Actual' ? 'Recorded Volume' : 'Model Estimate (30d)'}: {p.value.toFixed(1)}k
               </div>
             )
          ))}
          <div style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 10 }}>Linear moving average extrapolation</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height: 260, position: 'relative', marginTop: 12 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--text-muted)" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="var(--text-muted)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
          <XAxis dataKey="time" hide />
          <YAxis hide domain={[0, 110]} />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="actual" 
            name="Actual" 
            stroke="var(--accent-primary)" 
            strokeWidth={2.5} 
            fillOpacity={1} 
            fill="url(#colorActual)" 
            isAnimationActive={false}
          />
          <Area 
            type="monotone" 
            dataKey="forecast" 
            name="Forecast" 
            stroke="var(--text-muted)" 
            strokeWidth={2} 
            strokeDasharray="4 4"
            fillOpacity={1} 
            fill="url(#colorForecast)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div style={{ position: 'absolute', top: -32, right: 0, display: 'flex', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-primary)', fontWeight: 500 }}>
          <div style={{ width: 10, height: 3, background: 'var(--accent-primary)', borderRadius: 2 }} /> Recorded Actual
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500 }}>
          <div style={{ width: 10, height: 3, background: 'var(--text-muted)', borderTop: '1px dashed var(--text-muted)' }} /> Projected Range (Model Estimate)
        </div>
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
        * Note: Projected metrics are algorithmic linear estimates based on 90-day moving variance, not guaranteed future financial outcomes.
      </div>
    </div>
  );
}

function LiveActivityFeed() {
  const [activities] = useState<any[]>([
    { id: 1, text: "Workflow 'Lead Enrichment' executed successfully (184ms, Status 200 OK)", type: 'success', time: '2m ago' },
    { id: 2, text: "Stripe webhook received: invoice.payment_succeeded ($18,400 MRR addition)", type: 'success', time: '6m ago' },
    { id: 3, text: "Gateway latency normalized at 182ms (P95 across all worker nodes)", type: 'info', time: '14m ago' },
    { id: 4, text: "Zendesk webhook timeout warning: latency peaked at 4,100ms", type: 'warning', time: '28m ago' },
  ]);

  return (
    <AnCard title="Operational Telemetry Log" subtitle="Real-time execution & gateway event stream" style={{ height: '100%' }} delay={0.3}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
        {activities.map((act) => (
          <div 
            key={act.id}
            style={{ 
              display: 'flex', flexDirection: 'column', gap: 4,
              padding: '10px 12px', borderRadius: 8,
              background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: 9.5, fontWeight: 700, fontFamily: 'monospace',
                color: act.type === 'success' ? 'var(--success)' : act.type === 'warning' ? 'var(--warn)' : 'var(--accent-primary)'
              }}>
                {act.type.toUpperCase()}
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{act.time}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}>{act.text}</div>
          </div>
        ))}
      </div>
    </AnCard>
  );
}

export default function AnalyticsPage() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px', background: 'var(--bg)', minHeight: '100%', position: 'relative' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 28 }}>
        
        {/* Header Area */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.2)', borderRadius: 6, fontSize: 11, fontWeight: 600, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                <Activity size={12} /> ENTERPRISE TELEMETRY
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 6, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                SAMPLE DATASET · 30-DAY WINDOW
              </div>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
              Business Telemetry & Intelligence
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, margin: '4px 0 0 0' }}>
              Real-time operational metrics, statistical forecasts, and subsystem telemetry for your workspace.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{ 
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', 
              borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--card-border)', 
              color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 500, cursor: 'pointer'
            }}>
              <Clock size={14} /> Last 30 Days
            </button>
            <button style={{ 
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', 
              borderRadius: 8, background: 'var(--accent-primary)', color: '#fff', 
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: 'none'
            }}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        <AskORYN />
        <OperationalInsightSummary />

        {/* Explainable Contextual KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {contextualAnalyticsKpis.map((k, i) => (
            <motion.div 
              key={k.label} 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              style={{
                padding: '18px 20px', background: 'var(--card-bg)', borderRadius: 14,
                border: '1px solid var(--card-border)', position: 'relative',
                display: 'flex', flexDirection: 'column', gap: 8,
                boxShadow: 'var(--shadow-subtle)', cursor: 'default'
              }} 
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{k.label}</span>
                <span style={{ color: k.accent }}>{k.icon}</span>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>{k.value}</div>
                <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600, marginTop: 2 }}>{k.period}</div>
              </div>
              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: 8, marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-muted)' }}>
                <span>{k.source}</span>
                <span>{k.detail}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts & Domain Distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20 }}>
          <div style={{ gridColumn: 'span 8' }}>
            <AnCard title="Revenue Trajectory & Model Estimate" subtitle="Historical gross volume with 30-day statistical forecast projection" delay={0.15}>
              <PerformanceChart />
            </AnCard>
          </div>

          <div style={{ gridColumn: 'span 4' }}>
            <AnCard title="Workflow Distribution by Domain" subtitle="Execution share across functional areas" delay={0.2}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
                {domainBreakdown.map((b) => (
                  <div key={b.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)' }}>
                      <span>{b.label}</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{b.pct}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--glass-bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${b.pct}%`, background: b.color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </AnCard>
          </div>
        </div>

        {/* Bottom Operational Telemetry & Infrastructure Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20 }}>
          <div style={{ gridColumn: 'span 7' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { title: "Gateway P95 Latency", value: "185ms", sub: "Distributed Edge Nodes", icon: <Zap size={22} />, color: "var(--accent-primary)" },
                { title: "Telemetry Integrity", value: "99.98%", sub: "Zero Packet Drops Detected", icon: <ShieldCheck size={22} />, color: "var(--success)" },
                { title: "Model Status", value: "NVIDIA Llama 3.2", sub: "Vision 11B Tier Active", icon: <BarChart3 size={22} />, color: "var(--text-secondary)" }
              ].map((item) => (
                <div 
                  key={item.title}
                  style={{ 
                    background: 'var(--card-bg)', border: '1px solid var(--card-border)', 
                    borderRadius: 14, padding: '18px', display: 'flex', flexDirection: 'column', gap: 8,
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.title}</span>
                    <span style={{ color: item.color }}>{item.icon}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ gridColumn: 'span 5' }}>
            <LiveActivityFeed />
          </div>
        </div>

      </div>
    </div>
  );
}
