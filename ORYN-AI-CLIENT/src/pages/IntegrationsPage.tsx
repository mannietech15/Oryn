import React, { useState } from 'react';

const mockIntegrations = [
  { id: 'slack', name: 'Slack', desc: 'Send automated insights and chat directly from Slack channels.', icon: '💬', connected: true },
  { id: 'stripe', name: 'Stripe', desc: 'Analyze live financial metrics and revenue health.', icon: '💳', connected: true },
  { id: 'github', name: 'GitHub', desc: 'Monitor repository activity and audit code automatically.', icon: '🐙', connected: false },
  { id: 'notion', name: 'Notion', desc: 'Sync AI-generated tasks and docs directly to your workspace.', icon: '📝', connected: false },
  { id: 'zendesk', name: 'Zendesk', desc: 'Automate support ticket sentiment analysis and escalation.', icon: '🎫', connected: false },
  { id: 'hubspot', name: 'HubSpot', desc: 'Enrich lead data automatically and draft personalized emails.', icon: '🎯', connected: false },
  { id: 'google_calendar', name: 'Google Calendar', desc: 'Manage your schedule and prepare for upcoming meetings.', icon: '📅', connected: false },
  { id: 'linear', name: 'Linear', desc: 'Sync engineering tasks and track project velocity.', icon: '📈', connected: false },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(mockIntegrations);

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: !i.connected } : i));
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'transparent' }}>
      {/* Header */}
      <div style={{ padding: '40px 48px 24px', borderBottom: '1px solid var(--card-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Connected
            </h1>
            <span style={{ fontFamily: 'var(--font-script)', fontSize: 36, color: 'var(--accent-primary)', lineHeight: 0.8, transform: 'translateY(-4px)' }}>
              Integrations
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', borderRadius: 8, padding: '8px 12px', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" placeholder="Search apps..." style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 13, width: 150 }} />
            </div>
            <button style={{ padding: '10px 20px', background: 'var(--text-primary)', color: 'var(--bg)', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Custom Webhook
            </button>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
          Supercharge Oryn by connecting your favorite tools and enabling autonomous workflows.
        </p>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {integrations.map(integration => (
              <IntegrationCard key={integration.id} {...integration} onToggle={() => toggleConnection(integration.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationCard({ name, desc, icon, connected, onToggle }: { name: string, desc: string, icon: string, connected: boolean, onToggle: () => void }) {
  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', padding: '24px', 
      background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', 
      borderRadius: 16, transition: 'all 0.3s', boxShadow: 'var(--shadow-subtle)',
      position: 'relative', overflow: 'hidden'
    }}>
      {connected && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: 'var(--success)' }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          {icon}
        </div>
        {connected ? (
          <span style={{ padding: '4px 10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontSize: 11, fontWeight: 700, borderRadius: 12, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} /> Connected
          </span>
        ) : (
          <span style={{ padding: '4px 10px', background: 'var(--glass-bg-strong)', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, borderRadius: 12, textTransform: 'uppercase' }}>
            Not Connected
          </span>
        )}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>{name}</h3>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 24px', lineHeight: 1.5, flex: 1 }}>{desc}</p>
      
      <button 
        onClick={onToggle}
        style={{ 
          width: '100%', padding: '10px', background: connected ? 'transparent' : 'var(--text-primary)', 
          color: connected ? 'var(--text-primary)' : 'var(--bg)', border: connected ? '1px solid var(--card-border)' : 'none', 
          borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' 
        }}
        onMouseEnter={e => { if (connected) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; if (connected) e.currentTarget.style.color = 'var(--danger)'; if (connected) e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'; }}
        onMouseLeave={e => { if (connected) e.currentTarget.style.background = 'transparent'; if (connected) e.currentTarget.style.color = 'var(--text-primary)'; if (connected) e.currentTarget.style.borderColor = 'var(--card-border)'; }}
      >
        {connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
}
