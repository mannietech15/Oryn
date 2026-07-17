import React, { useState } from 'react';

type AutomationStatus = 'active' | 'paused' | 'draft';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: { icon: string; name: string };
  action: { icon: string; name: string };
  status: AutomationStatus;
  runs: number;
}

const mockAutomations: Automation[] = [
  {
    id: '1',
    name: 'Weekly Sales Report',
    description: 'Summarizes Stripe data and emails the executive team every Friday at 5 PM.',
    trigger: { icon: '📅', name: 'Schedule (Friday 5PM)' },
    action: { icon: '📧', name: 'Draft & Send Email' },
    status: 'active',
    runs: 24
  },
  {
    id: '2',
    name: 'New Lead Enrichment',
    description: 'Triggers when a new lead is added in CRM, uses AI to research their company, and updates the record.',
    trigger: { icon: '🎯', name: 'CRM Webhook' },
    action: { icon: '🧠', name: 'Oryn AI Research' },
    status: 'active',
    runs: 142
  },
  {
    id: '3',
    name: 'Support Ticket Escalation',
    description: 'Analyzes incoming Zendesk tickets for negative sentiment and alerts the Slack channel.',
    trigger: { icon: '🎫', name: 'New Ticket' },
    action: { icon: '💬', name: 'Slack Notification' },
    status: 'paused',
    runs: 89
  }
];

export default function AutomationPage() {
  const [automations, setAutomations] = useState<Automation[]>(mockAutomations);

  const toggleStatus = (id: string) => {
    setAutomations(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: a.status === 'active' ? 'paused' : 'active' };
      }
      return a;
    }));
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'transparent' }}>
      
      {/* Header */}
      <div style={{ padding: '40px 48px 24px', borderBottom: '1px solid var(--card-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Workflow
            </h1>
            <span style={{ fontFamily: 'var(--font-script)', fontSize: 36, color: 'var(--accent-primary)', lineHeight: 0.8, transform: 'translateY(-4px)' }}>
              Automations
            </span>
          </div>
          <button style={{ 
            padding: '10px 20px', background: 'var(--text-primary)', color: 'var(--bg)', 
            border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', 
            display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
          }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Create Automation
          </button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
          Connect your tools and let Oryn handle repetitive tasks intelligently.
        </p>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Active Workflows</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <select style={{ padding: '6px 12px', background: 'var(--glass-bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--card-border)', borderRadius: 8, outline: 'none', fontSize: 13, fontFamily: 'var(--font-body)' }}>
                <option>All Statuses</option>
                <option>Active</option>
                <option>Paused</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {automations.map(auto => (
              <AutomationCard key={auto.id} automation={auto} onToggle={() => toggleStatus(auto.id)} />
            ))}
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '48px 0 24px' }}>Recommended Templates</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            <TemplateCard 
              title="Daily Standup Summary"
              desc="Summarizes team updates from Slack and drops them into a Notion document."
              icons={['💬', '🧠', '📝']}
            />
            <TemplateCard 
              title="Invoice Extraction"
              desc="Watches an email inbox for PDF invoices, extracts data using Vision API, and logs to a spreadsheet."
              icons={['📧', '👁️', '📊']}
            />
            <TemplateCard 
              title="Social Media Auto-Draft"
              desc="Takes new blog posts via RSS, drafts 3 variations of social posts, and sends for review."
              icons={['🌐', '✍️', '📱']}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

// --- Subcomponents ---

function AutomationCard({ automation, onToggle }: { automation: Automation, onToggle: () => void }) {
  const isActive = automation.status === 'active';
  
  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', padding: '24px', 
      background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', 
      borderRadius: 16, transition: 'all 0.3s', boxShadow: 'var(--shadow-subtle)',
      position: 'relative', overflow: 'hidden'
    }}>
      {isActive && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: 'var(--accent-primary)' }} />
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{automation.name}</h3>
            {isActive ? (
              <span style={{ padding: '2px 8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontSize: 10, fontWeight: 700, borderRadius: 12, textTransform: 'uppercase' }}>Active</span>
            ) : (
              <span style={{ padding: '2px 8px', background: 'var(--glass-bg-strong)', color: 'var(--text-secondary)', fontSize: 10, fontWeight: 700, borderRadius: 12, textTransform: 'uppercase' }}>Paused</span>
            )}
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.5, maxWidth: 600 }}>
            {automation.description}
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--card-bg)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--card-border)' }}>
              <span style={{ fontSize: 14 }}>{automation.trigger.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Trigger: {automation.trigger.name}</span>
            </div>
            
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--card-bg)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--card-border)' }}>
              <span style={{ fontSize: 14 }}>{automation.action.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Action: {automation.action.name}</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
          <Toggle isOn={isActive} onToggle={onToggle} />
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>
            Runs: <span style={{ color: 'var(--text-primary)' }}>{automation.runs.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ title, desc, icons }: { title: string, desc: string, icons: string[] }) {
  return (
    <div style={{ 
      padding: '24px', background: 'var(--glass-bg-subtle)', border: '1px dashed var(--card-border)', 
      borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column'
    }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.background = 'rgba(249,115,22,0.02)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.background = 'var(--glass-bg-subtle)'; }}>
      <div style={{ display: 'flex', gap: -8, marginBottom: 16 }}>
        {icons.map((icon, i) => (
          <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--card-bg)', border: '2px solid var(--glass-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, zIndex: 10 - i, transform: i > 0 ? `translateX(-${i * 10}px)` : 'none' }}>
            {icon}
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, flex: 1 }}>{desc}</p>
      <div style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
        Use Template <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      </div>
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
