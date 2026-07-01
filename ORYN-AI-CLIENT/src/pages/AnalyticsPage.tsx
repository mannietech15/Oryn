import { useState } from 'react';

const anKpis = [
  { icon: '📈', value: '+24.8%', label: 'Revenue Growth', accent: 'var(--accent)', trend: 'up', aiNote: 'AI predicts +5% next month' },
  { icon: '🤖', value: '4,812', label: 'AI Tasks Managed', accent: 'var(--violet)', trend: 'up', aiNote: 'Efficiency up 12%' },
  { icon: '⚡', value: '0.8s', label: 'Avg Latency', accent: 'var(--cyan)', trend: 'down', aiNote: 'System optimization peak' },
  { icon: '🎯', value: '94.2%', label: 'Goal Alignment', accent: 'var(--success)', trend: 'up', aiNote: 'On track for Q2' },
];

const breakdown = [
  { label: 'Neural Search', pct: 45, color: 'var(--cyan)' },
  { label: 'Agentic Tasks', pct: 28, color: 'var(--violet)' },
  { label: 'Data Synthesis', pct: 15, color: 'var(--accent)' },
  { label: 'File Analysis', pct: 12, color: 'var(--success)' },
];

function AnCard({ title, children, colSpan, style }: { title: string; children: React.ReactNode; colSpan?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ 
      background: 'var(--card)', 
      border: '1px solid var(--border)', 
      borderRadius: 16, 
      padding: 32, 
      boxShadow: 'var(--shadow-subtle)', 
      backdropFilter: 'blur(20px)', 
      gridColumn: colSpan ? `span ${colSpan}` : undefined,
      position: 'relative',
      overflow: 'hidden',
      ...style
    }}>
      <div style={{ 
        fontFamily: 'var(--font-display)', 
        fontSize: 12, 
        fontWeight: 700, 
        letterSpacing: 3, 
        color: 'var(--muted)', 
        textTransform: 'uppercase', 
        marginBottom: 24, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12 
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 10px var(--cyan)' }} />
        {title}
      </div>
      {children}
    </div>
  );
}

function AISummary() {
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(138, 43, 226, 0.1))',
      border: '1px solid var(--border)',
      borderRadius: 16,
      padding: '24px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      boxShadow: 'var(--shadow-subtle)',
      backdropFilter: 'blur(20px)',
      animation: 'rise 0.8s ease-out'
    }}>
      <div style={{ 
        width: 48, height: 48, borderRadius: 12, 
        background: 'var(--card)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, boxShadow: '0 0 20px rgba(249, 115, 22,0.3)'
      }}>
        ✨
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--cyan)', letterSpacing: 2, marginBottom: 4 }}>
          AI NARRATIVE INSIGHT
        </div>
        <div style={{ color: 'var(--text)', fontSize: 15, fontWeight: 400, opacity: 0.9 }}>
          Growth is accelerating in <span style={{ color: 'var(--white)', fontWeight: 600 }}>Neural Search</span> categories. 
          ORYN predicts a <span style={{ color: 'var(--success)' }}>14% increase</span> in operational efficiency if current agentic workflows are maintained through Q3. 
          Anomaly detected in <span style={{ color: 'var(--warn)' }}>API Latency</span> on Tuesday was resolved by auto-scaling.
        </div>
      </div>
      <button style={{ 
        padding: '10px 20px', borderRadius: 8, background: 'var(--glass-bg-hover)', 
        color: 'var(--white)', fontSize: 13, fontWeight: 600, border: '1px solid var(--glass-bg-strong)',
        transition: 'all 0.2s'
      }} onMouseOver={e => e.currentTarget.style.background = 'var(--glass-bg-strong)'} onMouseOut={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}>
        Generate Repo Report
      </button>
    </div>
  );
}

function AskORYN() {
  const [query, setQuery] = useState('');
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 600, margin: '0 auto' }}>
      <input 
        type="text" 
        placeholder="Ask ORYN about your data..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '16px 24px 16px 56px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 30,
          color: 'var(--white)',
          fontSize: 15,
          fontFamily: 'var(--font-body)',
          outline: 'none',
          boxShadow: 'var(--shadow-subtle)',
          transition: 'all 0.3s ease'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--cyan)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(249, 115, 22,0.2)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = 'var(--shadow-subtle)';
        }}
      />
      <span style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
      {query && (
        <div style={{ 
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 12, 
          background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
          padding: 16, zIndex: 100, backdropFilter: 'blur(20px)', animation: 'rise 0.2s ease-out'
        }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>AI SUGGESTIONS</div>
          {['Compare revenue growth to last quarter', 'List top performing agents', 'Explain the latency spike'].map(s => (
            <div key={s} style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 14, transition: 'background 0.2s' }} 
              onMouseOver={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div style={{ 
      flex: 1, 
      overflowY: 'auto', 
      padding: '40px 60px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 40,
      background: 'transparent'
    }}>
      {/* Header Area */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--white)', letterSpacing: -1 }}>
            Business <span style={{ color: 'var(--cyan)' }}>Intelligence</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Real-time performance metrics & AI forecasting</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--white)', fontSize: 13, fontWeight: 600 }}>Real-time</button>
          <button style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--cyan)', color: '#000', fontSize: 13, fontWeight: 700 }}>Export</button>
        </div>
      </div>

      <AskORYN />

      <AISummary />

      {/* KPI Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
        {anKpis.map(k => (
          <div key={k.label} style={{
            padding: 32, background: 'var(--card)', borderRadius: 16,
            border: '1px solid var(--border)', position: 'relative',
            display: 'flex', flexDirection: 'column', gap: 16,
            boxShadow: 'var(--shadow-subtle)', backdropFilter: 'blur(20px)',
            transition: 'transform 0.3s ease',
            cursor: 'default'
          }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 24 }}>{k.icon}</span>
              <span style={{ 
                fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 6, 
                background: k.trend === 'up' ? 'rgba(0,255,170,0.1)' : 'rgba(255,51,102,0.1)',
                color: k.trend === 'up' ? 'var(--success)' : 'var(--danger)'
              }}>
                {k.trend === 'up' ? '↑' : '↓'} 12%
              </span>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--white)' }}>{k.value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{k.label}</div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--cyan)', opacity: 0.8, background: 'rgba(249, 115, 22,0.05)', padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(249, 115, 22,0.1)' }}>
              ✨ {k.aiNote}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        <AnCard title="Performance Forecast">
          <div style={{ height: 260, position: 'relative', marginTop: 20 }}>
            <svg viewBox="0 0 400 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[20, 50, 80, 110].map(y => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="var(--glass-bg-hover)" strokeWidth="1" />
              ))}
              {/* Historical Path */}
              <path d="M0,100 C20,95 40,80 60,85 C80,90 100,60 120,65 C140,70 160,40 180,45 C200,50 220,30 240,35 C260,40 280,20 300,25" 
                fill="none" stroke="var(--cyan)" strokeWidth="3" strokeLinecap="round" />
              <path d="M0,100 C20,95 40,80 60,85 C80,90 100,60 120,65 C140,70 160,40 180,45 C200,50 220,30 240,35 C260,40 280,20 300,25 L300,120 L0,120 Z" 
                fill="url(#areaGrad)" />
              
              {/* Forecast Path */}
              <path d="M300,25 C320,30 340,15 360,10 C380,5 400,0 400,0" 
                fill="none" stroke="var(--violet)" strokeWidth="3" strokeDasharray="6,4" />
              
              {/* Highlight points */}
              <circle cx="300" cy="25" r="5" fill="var(--white)" stroke="var(--cyan)" strokeWidth="3" />
            </svg>
            <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
                <div style={{ width: 12, height: 3, background: 'var(--cyan)' }} /> Actual
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
                <div style={{ width: 12, height: 3, background: 'var(--violet)', borderTop: '2px dashed var(--violet)' }} /> AI Forecast
              </div>
            </div>
            <div style={{ position: 'absolute', left: 280, top: 40, padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11, pointerEvents: 'none' }}>
              <div style={{ color: 'var(--violet)', fontWeight: 700 }}>FORECAST PEAK</div>
              <div style={{ color: 'var(--text)', opacity: 0.8 }}>Expected +18%</div>
            </div>
          </div>
        </AnCard>

        <AnCard title="Domain Affinity">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
            {breakdown.map(b => (
              <div key={b.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 500 }}>
                  <span>{b.label}</span>
                  <span style={{ color: b.color }}>{b.pct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--glass-bg-hover)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${b.pct}%`, background: b.color, boxShadow: `0 0 10px ${b.color}40` }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 12, padding: 16, borderRadius: 12, background: 'rgba(138,43,226,0.05)', border: '1px solid rgba(138,43,226,0.1)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--violet)', marginBottom: 4 }}>DOMAIN INSIGHT</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Neural Search has grown by 40% this week. Suggesting resource re-allocation.</div>
            </div>
          </div>
        </AnCard>
      </div>

      {/* Bottom Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        <AnCard title="Agent Efficiency" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 32 }}>⚡</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>98.2%</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Optimized Workflows</div>
            </div>
          </div>
        </AnCard>
        <AnCard title="Data Integrity" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 32 }}>🛡️</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>100.0%</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Zero Anomalies</div>
            </div>
          </div>
        </AnCard>
        <AnCard title="Model Health" style={{ borderLeft: '4px solid var(--violet)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 32 }}>🧠</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>Excellent</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>ORYN-Core-v4</div>
            </div>
          </div>
        </AnCard>
      </div>
    </div>
  );
}
