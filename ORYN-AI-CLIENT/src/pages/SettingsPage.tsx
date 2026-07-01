import React, { useState } from 'react';

type Persona = 'executive' | 'creative' | 'analytical' | 'developer';

export default function SettingsPage() {
  const [persona, setPersona] = useState<Persona>('executive');
  const [glassIntensity, setGlassIntensity] = useState(70);
  const [accentColor, setAccentColor] = useState('#00f0ff');
  const [notifications, setNotifications] = useState(true);
  const [aiAudits, setAiAudits] = useState(true);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 40, background: 'transparent' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>System Configuration</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'white', letterSpacing: 1 }}>
          Workspace <span style={{ color: 'var(--cyan)' }}>Intelligence</span> Settings
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        
        {/* Section: AI Persona */}
        <SettingsCard title="Intelligence & Persona" icon="fas fa-brain" accent="var(--cyan)">
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>Configure how the ORYN AI interacts with your data and team.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {(['executive', 'creative', 'analytical', 'developer'] as Persona[]).map(p => (
              <button 
                key={p}
                onClick={() => setPersona(p)}
                style={{
                  padding: '20px 16px', borderRadius: 16, background: persona === p ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${persona === p ? 'var(--cyan)' : 'rgba(255,255,255,0.05)'}`,
                  textAlign: 'left', transition: 'all 0.3s', cursor: 'pointer'
                }}
              >
                <div style={{ textTransform: 'capitalize', fontWeight: 700, fontSize: 14, color: persona === p ? 'var(--cyan)' : 'white', marginBottom: 4 }}>{p}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.4 }}>
                  {p === 'executive' && 'High-level summaries and strategic insights.'}
                  {p === 'creative' && 'Expansive brainstorming and visioning.'}
                  {p === 'analytical' && 'Deep-dive data processing and logic.'}
                  {p === 'developer' && 'Technical audits and code-first thinking.'}
                </div>
              </button>
            ))}
          </div>
        </SettingsCard>

        {/* Section: Aesthetics */}
        <SettingsCard title="Workspace Aesthetics" icon="fas fa-paint-brush" accent="var(--violet)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <FormLabel>Glassmorphism Intensity</FormLabel>
                <span style={{ color: 'var(--cyan)', fontSize: 12, fontWeight: 700 }}>{glassIntensity}%</span>
              </div>
              <input 
                type="range" min="10" max="95" value={glassIntensity}
                onChange={e => setGlassIntensity(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--cyan)' }}
              />
            </div>
            <div>
              <FormLabel>Accent Color Preset</FormLabel>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                {['#00f0ff', '#8a2be2', '#00ffaa', '#ff3366', '#ffaa00'].map(c => (
                  <button 
                    key={c}
                    onClick={() => setAccentColor(c)}
                    style={{
                      width: 32, height: 32, borderRadius: '50%', background: c,
                      border: accentColor === c ? '3px solid white' : 'none',
                      boxShadow: accentColor === c ? `0 0 15px ${c}` : 'none',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
                <i className="fas fa-info-circle" style={{ marginRight: 8, color: 'var(--cyan)' }}></i>
                These changes are local to your workspace and synchronized across your authorized devices.
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* Section: Security Health */}
        <SettingsCard title="Security Sentinel" icon="fas fa-shield-alt" accent="var(--success)">
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 100, height: 100 }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--success)" strokeWidth="3" strokeDasharray="92, 100" strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: 'white' }}>92</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'white', marginBottom: 4 }}>Workspace Health: Optimal</div>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>All encryption layers active. 2 active sessions from Berlin, DE. No unusual patterns detected by Oryn-Sentinel.</p>
            </div>
          </div>
          <button style={{ 
            width: '100%', marginTop: 24, padding: '12px', border: '1px solid var(--success)', borderRadius: 12, 
            color: 'var(--success)', fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase'
          }}>
            Run Security Audit
          </button>
        </SettingsCard>

        {/* Section: Automation Rules */}
        <SettingsCard title="Active Integrations" icon="fas fa-plug" accent="var(--warn)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <IntegrationItem name="OpenRouter AI" status="Connected" icon="fas fa-brain" />
            <IntegrationItem name="Stripe Analytics" status="Active" icon="fab fa-stripe" />
            <IntegrationItem name="GitHub Sentinel" status="Standby" icon="fab fa-github" />
            <button style={{ 
              marginTop: 8, fontSize: 12, color: 'var(--cyan)', fontWeight: 700, textDecoration: 'none', background: 'none', border: 'none'
            }}>
              + Connect New Protocol
            </button>
          </div>
        </SettingsCard>

      </div>

      {/* AI Auditor Footer */}
      <div style={{ 
        marginTop: 40, padding: 32, background: 'linear-gradient(90deg, rgba(0,240,255,0.05), rgba(138,43,226,0.05))',
        borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 24
      }}>
        <div style={{ 
          width: 50, height: 50, borderRadius: '50%', background: 'rgba(0,240,255,0.1)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
        }}>
          💡
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: 'white', marginBottom: 4 }}>AI Auditor Insight</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>We noticed your team is most active between 9AM and 11AM UTC. Would you like me to prioritize deep-analysis reports during those hours?</div>
        </div>
        <button style={{ padding: '10px 20px', background: 'var(--cyan)', color: 'black', borderRadius: 10, fontWeight: 700, fontSize: 13 }}>Enable Priority Mode</button>
      </div>
    </div>
  );
}

function SettingsCard({ title, icon, accent, children }: { title: string; icon: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: 32, backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${accent === 'var(--cyan)' ? '0,240,255' : accent === 'var(--violet)' ? '138,43,226' : '0,255,170'}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className={icon} style={{ color: accent, fontSize: 16 }}></i>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'white', letterSpacing: 0.5 }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 700, color: 'white', letterSpacing: 0.5 }}>{children}</div>;
}

function IntegrationItem({ name, status, icon }: { name: string; status: string; icon: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
      <i className={icon} style={{ fontSize: 18, color: 'var(--muted)', width: 24, textAlign: 'center' }}></i>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'white' }}>{name}</div>
      <div style={{ fontSize: 10, fontWeight: 800, color: status === 'Connected' || status === 'Active' ? 'var(--success)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{status}</div>
    </div>
  );
}
