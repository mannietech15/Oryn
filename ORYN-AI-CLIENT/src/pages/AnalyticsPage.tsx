import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, Target, Search, Sparkles, 
  BarChart3, PieChart, ShieldCheck, Zap, BrainCircuit, Download, Clock
} from 'lucide-react';

const anKpis = [
  { icon: <TrendingUp size={24} />, value: '+24.8%', label: 'Revenue Growth', accent: 'var(--accent-primary)', trend: 'up', aiNote: 'AI predicts +5% next month' },
  { icon: <BrainCircuit size={24} />, value: '4,812', label: 'AI Tasks Managed', accent: 'var(--text-primary)', trend: 'up', aiNote: 'Efficiency up 12%' },
  { icon: <Zap size={24} />, value: '0.8s', label: 'Avg Latency', accent: 'var(--text-secondary)', trend: 'down', aiNote: 'System optimization peak' },
  { icon: <Target size={24} />, value: '94.2%', label: 'Goal Alignment', accent: 'var(--text-primary)', trend: 'up', aiNote: 'On track for Q2' },
];

const breakdown = [
  { label: 'Neural Search', pct: 45, color: 'var(--accent-primary)' },
  { label: 'Agentic Tasks', pct: 28, color: 'var(--text-primary)' },
  { label: 'Data Synthesis', pct: 15, color: 'var(--text-secondary)' },
  { label: 'File Analysis', pct: 12, color: 'var(--text-muted)' },
];

function AnCard({ title, children, colSpan, style, delay = 0 }: { title: string; children: React.ReactNode; colSpan?: number; style?: React.CSSProperties, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      style={{ 
        background: 'var(--card-bg)', 
        border: '1px solid var(--card-border)', 
        borderRadius: 24, 
        padding: 32, 
        boxShadow: 'var(--shadow-subtle)', 
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        gridColumn: colSpan ? `span ${colSpan}` : undefined,
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
      whileHover={{ borderColor: 'rgba(249, 115, 22, 0.4)', y: -4, transition: { duration: 0.2 } }}
    >
      <div style={{ 
        fontFamily: 'var(--font-display)', 
        fontSize: 12, 
        fontWeight: 700, 
        letterSpacing: 2, 
        color: 'var(--text-muted)', 
        textTransform: 'uppercase', 
        marginBottom: 24, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12 
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 12px var(--accent-primary)' }} />
        {title}
      </div>
      {children}
    </motion.div>
  );
}

function AISummary() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ 
        position: 'relative',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 24,
        padding: '32px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        boxShadow: 'var(--shadow-subtle)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ 
        width: 64, height: 64, borderRadius: 16, 
        background: 'var(--glass-bg-subtle)', border: '1px solid var(--glass-border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent-primary)',
        flexShrink: 0
      }}>
        <Sparkles size={32} />
      </div>
      <div style={{ flex: 1, zIndex: 1, minWidth: 300 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 2, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', animation: 'pulse 2s infinite' }} />
          AI NARRATIVE INSIGHT
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 16, fontWeight: 400, opacity: 0.9, lineHeight: 1.6 }}>
          Growth is accelerating in <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Neural Search</span> categories. 
          ORYN predicts a <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>14% increase</span> in operational efficiency if current agentic workflows are maintained through Q3. 
          Anomaly detected in <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>API Latency</span> on Tuesday was resolved by auto-scaling.
        </div>
      </div>
      <motion.button 
        whileHover={{ scale: 1.05, backgroundColor: 'var(--glass-bg-strong)' }}
        whileTap={{ scale: 0.95 }}
        style={{ 
          padding: '14px 28px', borderRadius: 12, background: 'var(--glass-bg-hover)', 
          color: 'var(--white)', fontSize: 14, fontWeight: 600, border: '1px solid var(--glass-border-subtle)',
          cursor: 'pointer', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8
        }}
      >
        <BarChart3 size={18} />
        Generate Report
      </motion.button>
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
          boxShadow: isFocused ? '0 0 40px rgba(249, 115, 22, 0.15)' : 'var(--shadow-subtle)',
          borderColor: isFocused ? 'var(--accent-primary)' : 'var(--card-border)'
        }}
        style={{
          borderRadius: 32,
          background: 'var(--card-bg)',
          border: '1px solid',
          display: 'flex',
          alignItems: 'center',
          padding: '8px 24px',
          backdropFilter: 'blur(20px)',
          transition: 'border-color 0.3s ease'
        }}
      >
        <Search size={20} color={isFocused ? 'var(--accent-primary)' : 'var(--text-muted)'} style={{ transition: 'color 0.3s ease' }} />
        <input 
          type="text" 
          placeholder="Ask ORYN to analyze specific metrics or trends..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          style={{
            flex: 1,
            padding: '16px 16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--white)',
            fontSize: 16,
            fontFamily: 'var(--font-body)',
            outline: 'none',
            fontWeight: 500
          }}
        />
        {query && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              background: 'var(--accent-primary)', color: '#000', border: 'none', 
              borderRadius: 20, padding: '8px 16px', fontSize: 14, fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Analyze
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {(isFocused && !query) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{ 
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 16, 
              background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 20,
              padding: 24, zIndex: 100, backdropFilter: 'blur(24px)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, fontWeight: 600, letterSpacing: 1, fontFamily: 'var(--font-display)' }}>SUGGESTED QUERIES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { text: 'Compare revenue growth to last quarter', icon: <TrendingUp size={16} /> },
                { text: 'List top performing AI agents by domain', icon: <BrainCircuit size={16} /> },
                { text: 'Explain the API latency spike on Tuesday', icon: <Activity size={16} /> }
              ].map((s, i) => (
                <motion.div 
                  key={s.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 5, backgroundColor: 'var(--glass-bg-hover)' }}
                  style={{ 
                    padding: '12px 16px', borderRadius: 12, cursor: 'pointer', fontSize: 15, 
                    display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-primary)',
                    border: '1px solid transparent'
                  }} 
                >
                  <span style={{ color: 'var(--accent-primary)', opacity: 0.8 }}>{s.icon}</span>
                  {s.text}
                </motion.div>
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
    // Generate initial data points
    let initialData: any[] = [];
    let currentActual = 40;
    
    for (let i = -15; i <= 5; i++) {
      if (i < 0) {
        currentActual += (Math.random() * 12 - 5);
        currentActual = Math.max(10, Math.min(100, currentActual));
        initialData.push({ time: i, actual: currentActual, forecast: null });
      } else if (i === 0) {
        currentActual += (Math.random() * 12 - 5);
        currentActual = Math.max(10, Math.min(100, currentActual));
        // Connecting point where both actual and forecast exist
        initialData.push({ time: i, actual: currentActual, forecast: currentActual });
      } else {
        let forecastVal = currentActual + i * (Math.random() * 6 - 2);
        initialData.push({ time: i, actual: null, forecast: Math.max(0, Math.min(120, forecastVal)) });
      }
    }
    setData(initialData);

    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev];
        const lastActual = newData.find(d => d.time === 0)?.actual || 50;
        const nextActual = lastActual + (Math.random() * 12 - 5);
        const boundedNext = Math.max(10, Math.min(100, nextActual));

        // Shift times down by 1, and convert the previous time=1 forecast into the new time=0 actual
        return newData.map(point => {
          const newTime = point.time - 1;
          if (point.time === 1) {
            return { time: 0, actual: boundedNext, forecast: boundedNext };
          } else if (point.time <= 0) {
            return { time: newTime, actual: point.actual, forecast: null };
          } else {
            return { time: newTime, actual: null, forecast: point.forecast + (Math.random() * 4 - 2) };
          }
        }).concat([
           { 
             time: 5, 
             actual: null, 
             forecast: newData[newData.length - 1].forecast + (Math.random() * 6 - 3) 
           }
        ]).filter(d => d.time >= -15);
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border-subtle)', borderRadius: 12, padding: '12px 16px', backdropFilter: 'blur(10px)', boxShadow: '0 10px 24px rgba(0,0,0,0.2)' }}>
          <div style={{ color: 'var(--accent-primary)', fontWeight: 700, marginBottom: 4, letterSpacing: 1, fontSize: 12 }}>LIVE METRIC</div>
          {payload.map((p: any, i: number) => (
             p.value != null && <div key={i} style={{ color: p.color, fontSize: 16, fontWeight: 600 }}>{p.name}: {p.value.toFixed(1)}</div>
          ))}
          <div style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 12 }}>Updated every 1.5s</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height: 280, position: 'relative', marginTop: 24, marginLeft: -20 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--text-muted)" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="var(--text-muted)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border-subtle)" />
          <XAxis dataKey="time" hide />
          <YAxis hide domain={[0, 120]} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--glass-border-subtle)', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area 
            type="monotone" 
            dataKey="actual" 
            name="Actual" 
            stroke="var(--accent-primary)" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorActual)" 
            isAnimationActive={false}
          />
          <Area 
            type="monotone" 
            dataKey="forecast" 
            name="Forecast" 
            stroke="var(--text-muted)" 
            strokeWidth={3} 
            strokeDasharray="6 6"
            fillOpacity={1} 
            fill="url(#colorForecast)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div style={{ position: 'absolute', top: -30, right: 0, display: 'flex', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
          <div style={{ width: 12, height: 4, background: 'var(--accent-primary)', borderRadius: 2 }} /> Live Actual
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
          <div style={{ width: 12, height: 4, background: 'var(--text-muted)', borderTop: '2px dashed var(--text-muted)', opacity: 0.5 }} /> Live Forecast
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '40px', 
        background: 'radial-gradient(ellipse at top right, rgba(249, 115, 22, 0.05) 0%, transparent 60%)',
        minHeight: '100%',
        position: 'relative'
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
      
      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 48, position: 'relative', zIndex: 1 }}>
        {/* Header Area */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.2)', borderRadius: 20, fontSize: 12, fontWeight: 600, color: 'var(--accent-primary)', marginBottom: 16 }}>
              <Activity size={14} /> LIVE ANALYTICS
            </div>
            <h1 style={{ fontFamily: 'var(--font-script)', fontSize: 48, fontWeight: 400, color: 'var(--white)', lineHeight: 1.1, paddingBottom: 8 }}>
              Business <span style={{ color: 'var(--accent-primary)', textShadow: '0 0 30px rgba(249,115,22,0.3)' }}>Intelligence</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, marginTop: 8, maxWidth: 500 }}>
              Real-time performance metrics & AI-driven forecasting for your workspace.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', gap: 16 }}
          >
            <button style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', 
              borderRadius: 12, background: 'var(--card-bg)', border: '1px solid var(--card-border)', 
              color: 'var(--white)', fontSize: 14, fontWeight: 600, backdropFilter: 'blur(10px)',
              transition: 'all 0.2s', cursor: 'pointer', boxShadow: 'var(--shadow-subtle)'
            }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--card-border)'}>
              <Clock size={16} /> Last 30 Days
            </button>
            <button style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', 
              borderRadius: 12, background: 'var(--accent-primary)', color: '#000', 
              fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none',
              boxShadow: '0 4px 20px rgba(249, 115, 22, 0.3)', transition: 'transform 0.2s'
            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <Download size={16} /> Export
            </button>
          </motion.div>
        </div>

        <AskORYN />
        <AISummary />

        {/* KPI Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {anKpis.map((k, i) => (
            <motion.div 
              key={k.label} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{
                padding: '20px', background: 'var(--card-bg)', borderRadius: 16,
                border: '1px solid var(--card-border)', position: 'relative',
                display: 'flex', flexDirection: 'column', gap: 12,
                boxShadow: 'var(--shadow-subtle)', backdropFilter: 'blur(20px)',
                cursor: 'default', overflow: 'hidden'
              }} 
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.accent, opacity: 0.5 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{k.label}</div>
                <div style={{ 
                  width: 36, height: 36, borderRadius: 10, background: `color-mix(in srgb, ${k.accent} 15%, transparent)`, 
                  color: k.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  {k.icon}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.5 }}>{k.value}</div>
                <div style={{ 
                  fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 12, 
                  background: k.trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: k.trend === 'up' ? 'var(--success)' : 'var(--danger)',
                  display: 'flex', alignItems: 'center', gap: 4
                }}>
                  {k.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />} 12%
                </div>
              </div>
              <div style={{ fontSize: 12, color: k.accent, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                <Sparkles size={14} /> {k.aiNote}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 32 }}>
          <AnCard title="Performance Forecast" colSpan={2} delay={0.2}>
            <PerformanceChart />
          </AnCard>

          <AnCard title="Domain Affinity" delay={0.3}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 16 }}>
              {breakdown.map((b, i) => (
                <div key={b.label} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    <span>{b.label}</span>
                    <span style={{ color: b.color, fontWeight: 700 }}>{b.pct}%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--glass-bg-hover)', borderRadius: 10, overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${b.pct}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                      style={{ height: '100%', background: b.color, borderRadius: 10, boxShadow: `0 0 10px ${b.color}80` }} 
                    />
                  </div>
                </div>
              ))}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                style={{ marginTop: 8, padding: '16px 20px', borderRadius: 16, background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.15)', display: 'flex', gap: 16, alignItems: 'center' }}
              >
                <PieChart size={24} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', marginBottom: 4, letterSpacing: 1 }}>DOMAIN INSIGHT</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', opacity: 0.9, lineHeight: 1.5 }}>Neural Search has grown by 40% this week. Suggesting resource re-allocation.</div>
                </div>
              </motion.div>
            </div>
          </AnCard>
        </div>

        {/* Bottom Insights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[
            { title: "Agent Efficiency", value: "98.2%", sub: "Optimized Workflows", icon: <Zap size={32} />, color: "var(--text-primary)" },
            { title: "Data Integrity", value: "100.0%", sub: "Zero Anomalies", icon: <ShieldCheck size={32} />, color: "var(--accent-primary)" },
            { title: "Model Health", value: "Excellent", sub: "ORYN-Core-v4", icon: <BrainCircuit size={32} />, color: "var(--text-secondary)" }
          ].map((item, i) => (
            <motion.div 
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              style={{ 
                background: 'var(--card-bg)', border: '1px solid var(--card-border)', 
                borderRadius: 24, padding: 24, display: 'flex', alignItems: 'center', gap: 20,
                boxShadow: 'var(--shadow-subtle)', backdropFilter: 'blur(20px)',
                position: 'relative', overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: item.color }} />
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `color-mix(in srgb, ${item.color} 15%, transparent)`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--white)' }}>{item.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{item.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
