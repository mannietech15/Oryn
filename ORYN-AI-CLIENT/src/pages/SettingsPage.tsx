import React, { useState, useEffect } from 'react';

type Tab = 'account' | 'preferences' | 'ai' | 'integrations' | 'security';
type Persona = 'executive' | 'creative' | 'analytical' | 'developer';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('ai');

  // Form States
  const [name, setName] = useState('Mannie Tech');
  const [email, setEmail] = useState('mannie@oryn.ai');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [autoTask, setAutoTask] = useState(true);
  const [persona, setPersona] = useState<Persona>('executive');
  
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'transparent' }}>
      
      {/* Header */}
      <div style={{ padding: '40px 48px 24px', borderBottom: '1px solid var(--card-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 8 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Workspace
          </h1>
          <span style={{ fontFamily: 'var(--font-script)', fontSize: 36, color: 'var(--accent-primary)', lineHeight: 0.8, transform: 'translateY(-4px)' }}>
            Settings
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
          Manage your account preferences, integrations, and Oryn's intelligence behavior.
        </p>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Sidebar Nav */}
        <div style={{ 
          width: 260, borderRight: '1px solid var(--card-border)', padding: '32px 16px', 
          display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', flexShrink: 0
        }}>
          <TabButton 
            active={activeTab === 'account'} onClick={() => setActiveTab('account')} 
            icon={<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />} 
            label="Account Details" 
          />
          <TabButton 
            active={activeTab === 'preferences'} onClick={() => setActiveTab('preferences')} 
            icon={<path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />} 
            label="Preferences" 
          />
          <TabButton 
            active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} 
            icon={<path d="M12 2a10 10 0 1 0 10 10H12V2z M12 12L2.06 7.5 M12 12l9.94 4.5 M12 12v10" />} 
            label="AI Behavior" 
          />
          <TabButton 
            active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} 
            icon={<path d="M22 12h-4l-3 9L9 3l-3 9H2" />} 
            label="Integrations" 
          />
          <TabButton 
            active={activeTab === 'security'} onClick={() => setActiveTab('security')} 
            icon={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />} 
            label="Security" 
          />
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 64px' }}>
          <div style={{ maxWidth: 720 }}>
            
            {/* --- AI BEHAVIOR TAB --- */}
            {activeTab === 'ai' && (
              <SettingsSection 
                title="Intelligence & Persona" 
                description="Configure how Oryn AI interacts with your data and communicates with your team."
              >
                <div style={{ marginBottom: 32 }}>
                  <FormLabel>AI Persona Mode</FormLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
                    <PersonaCard 
                      id="executive" title="Executive" active={persona === 'executive'} onClick={() => setPersona('executive')}
                      desc="High-level summaries, concise formatting, and strategic insights."
                    />
                    <PersonaCard 
                      id="creative" title="Creative" active={persona === 'creative'} onClick={() => setPersona('creative')}
                      desc="Expansive brainstorming, vivid language, and visionary thinking."
                    />
                    <PersonaCard 
                      id="analytical" title="Analytical" active={persona === 'analytical'} onClick={() => setPersona('analytical')}
                      desc="Deep-dive data processing, logical structure, and heavy metrics."
                    />
                    <PersonaCard 
                      id="developer" title="Developer" active={persona === 'developer'} onClick={() => setPersona('developer')}
                      desc="Technical audits, code-first thinking, and precise documentation."
                    />
                  </div>
                </div>

                <div style={{ padding: 24, background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 16, boxShadow: 'var(--shadow-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Automatic Task Extraction</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Allow Oryn to automatically detect and add action items to your to-do list from chat history.</div>
                    </div>
                    <Toggle isOn={autoTask} onToggle={() => setAutoTask(!autoTask)} />
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* --- ACCOUNT TAB --- */}
            {activeTab === 'account' && (
              <SettingsSection title="Account Details" description="Manage your personal information and workspace identity.">
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(249,115,22,0.1)', border: '2px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--accent-primary)', fontWeight: 800 }}>
                    MT
                  </div>
                  <div>
                    <button style={{ padding: '8px 16px', background: 'var(--text-primary)', color: 'var(--bg)', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', marginBottom: 8 }}>
                      Upload New Avatar
                    </button>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>JPG, GIF or PNG. Max size of 800K.</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <FormLabel>Full Name</FormLabel>
                    <input 
                      value={name} onChange={e => setName(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', marginTop: 8, background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 12, color: 'var(--text-primary)', outline: 'none' }} 
                    />
                  </div>
                  <div>
                    <FormLabel>Email Address</FormLabel>
                    <input 
                      value={email} onChange={e => setEmail(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', marginTop: 8, background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 12, color: 'var(--text-primary)', outline: 'none' }} 
                    />
                  </div>
                </div>
                <div style={{ marginTop: 24 }}>
                  <button style={{ padding: '12px 24px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>
                    Save Changes
                  </button>
                </div>
              </SettingsSection>
            )}

            {/* --- PREFERENCES TAB --- */}
            {activeTab === 'preferences' && (
              <SettingsSection title="Preferences" description="Customize your workspace notifications and visual settings.">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  
                  <div style={{ padding: 24, background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 16, boxShadow: 'var(--shadow-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Light Mode</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Switch the interface between dark and light themes.</div>
                      </div>
                      <Toggle isOn={theme === 'light'} onToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
                    </div>
                  </div>

                  <div style={{ padding: 24, background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 16, boxShadow: 'var(--shadow-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Email Notifications</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Receive daily summaries and mention alerts directly to your inbox.</div>
                      </div>
                      <Toggle isOn={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} />
                    </div>
                  </div>

                  <div style={{ padding: 24, background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 16, boxShadow: 'var(--shadow-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Push Notifications</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Get instant browser notifications for critical system alerts.</div>
                      </div>
                      <Toggle isOn={pushNotifs} onToggle={() => setPushNotifs(!pushNotifs)} />
                    </div>
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* --- INTEGRATIONS TAB --- */}
            {activeTab === 'integrations' && (
              <SettingsSection title="Integrations" description="Connect Oryn with your favorite tools to unlock advanced workflows.">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <IntegrationCard name="Slack" status="Connected" description="Send automated insights and chat directly from Slack channels." />
                  <IntegrationCard name="Stripe" status="Connected" description="Analyze live financial metrics and revenue health." />
                  <IntegrationCard name="GitHub" status="Not Connected" description="Monitor repository activity and audit code automatically." />
                  <IntegrationCard name="Notion" status="Not Connected" description="Sync AI-generated tasks and docs directly to your workspace." />
                </div>
              </SettingsSection>
            )}

            {/* --- SECURITY TAB --- */}
            {activeTab === 'security' && (
              <SettingsSection title="Security Settings" description="Manage your authentication methods and session activity.">
                <div style={{ padding: 24, background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 16, boxShadow: 'var(--shadow-subtle)', marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Two-Factor Authentication</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Add an extra layer of security to your account.</div>
                    </div>
                    <button style={{ padding: '8px 16px', background: 'var(--glass-bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--card-border)', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      Enable 2FA
                    </button>
                  </div>
                </div>
                
                <div style={{ padding: 24, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 16 }}>
                  <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: 4 }}>Danger Zone</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Permanently delete your account and all associated workspace data.</div>
                  <button style={{ padding: '8px 16px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    Delete Account
                  </button>
                </div>
              </SettingsSection>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// --- Subcomponents ---

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', width: '100%',
        background: active ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
        border: 'none', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
        color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
        textAlign: 'left'
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--glass-bg-subtle)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {icon}
      </svg>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

function SettingsSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>{description}</p>
      {children}
    </div>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{children}</div>;
}

function PersonaCard({ id, title, desc, active, onClick }: { id: string, title: string, desc: string, active: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      style={{
        padding: '20px', borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
        background: active ? 'rgba(249, 115, 22, 0.05)' : 'var(--glass-bg-subtle)',
        border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--card-border)'}`,
        position: 'relative', overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: active ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{title}</div>
        <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${active ? 'var(--accent-primary)' : 'var(--text-muted)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {active && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-primary)' }} />}
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</div>
      {active && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: 'var(--accent-primary)' }} />
      )}
    </div>
  );
}

function Toggle({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  return (
    <div 
      onClick={onToggle}
      style={{
        width: 44, height: 24, borderRadius: 12, background: isOn ? 'var(--accent-primary)' : 'var(--glass-bg-strong)',
        position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
      }}
    >
      <div style={{
        position: 'absolute', top: 2, left: isOn ? 22 : 2, width: 20, height: 20, borderRadius: '50%',
        background: 'var(--inverted-bg)', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }} />
    </div>
  );
}

function IntegrationCard({ name, description, status }: { name: string, description: string, status: string }) {
  const isConnected = status === 'Connected';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px', background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 16, boxShadow: 'var(--shadow-subtle)' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--glass-bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isConnected ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path><path d="M7 7h.01"></path>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{name}</div>
          {isConnected && (
            <span style={{ padding: '2px 8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontSize: 10, fontWeight: 700, borderRadius: 12, textTransform: 'uppercase' }}>Connected</span>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{description}</div>
      </div>
      <button style={{ 
        padding: '8px 16px', background: isConnected ? 'transparent' : 'var(--text-primary)', 
        color: isConnected ? 'var(--text-primary)' : 'var(--bg)', 
        border: isConnected ? '1px solid var(--card-border)' : 'none', 
        borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' 
      }}>
        {isConnected ? 'Configure' : 'Connect'}
      </button>
    </div>
  );
}
