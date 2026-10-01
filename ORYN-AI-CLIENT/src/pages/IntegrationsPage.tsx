import { useState, useEffect } from 'react';

type IntegrationStatus = 'connected' | 'active_workflow' | 'available' | 'failed';

interface Integration {
  id: string;
  name: string;
  category: 'Communication' | 'Payments & Billing' | 'Ops & Monitoring' | 'CRM & Productivity';
  desc: string;
  icon: string;
  status: IntegrationStatus;
  usedInWorkflows?: string[];
  lastActivity?: string;
  errorDetail?: string;
  technicalMetadata?: string;
}

const infrastructureIntegrations: Integration[] = [
  {
    id: 'smtp',
    name: 'Custom SMTP Mail Transport',
    category: 'Communication',
    desc: 'Dispatches staged operational emails through configured host credentials using Nodemailer transport.',
    icon: '📧',
    status: 'connected',
    usedInWorkflows: ['Weekly Executive Sales Synthesis', 'Client Re-engagement Campaign'],
    lastActivity: '14 minutes ago · Code 250 OK (Delivered)',
    technicalMetadata: 'Port 587 TLS · Authenticated transport'
  },
  {
    id: 'slack',
    name: 'Slack Incoming Webhooks',
    category: 'Communication',
    desc: 'Broadcasts anomaly alerts and strategic operational notifications into dedicated team channels.',
    icon: '💬',
    status: 'connected',
    usedInWorkflows: ['Support Ticket Sentiment Escalation'],
    lastActivity: '28 minutes ago · Code 200 OK',
    technicalMetadata: 'Target: #ops-briefings channel'
  },
  {
    id: 'zendesk',
    name: 'Zendesk Ticket Webhook',
    category: 'Ops & Monitoring',
    desc: 'Ingests real-time support ticket events for automated sentiment scoring and escalation.',
    icon: '🎫',
    status: 'failed',
    lastActivity: 'Failed 14m ago',
    errorDetail: 'Webhook endpoint timed out after 5,000ms. Last successful sync: 14 minutes ago.',
    technicalMetadata: 'Endpoint: /api/webhooks/support/tickets'
  },
  {
    id: 'stripe',
    name: 'Stripe Billing Ingress',
    category: 'Payments & Billing',
    desc: 'Ingests subscription telemetry, invoice events, and churn indicators into the ORYN financial engine.',
    icon: '💳',
    status: 'available',
    technicalMetadata: 'Requires STRIPE_WEBHOOK_SECRET'
  },
  {
    id: 'github',
    name: 'GitHub Webhook Auditor',
    category: 'Ops & Monitoring',
    desc: 'Monitors pull request activity and releases for developer workflow tracking.',
    icon: '🐙',
    status: 'available',
    technicalMetadata: 'Webhook: pull_request, release events'
  },
  {
    id: 'notion',
    name: 'Notion Workspace Sync',
    category: 'CRM & Productivity',
    desc: 'Exports structured AI briefings and OKR progress reports directly to team knowledge bases.',
    icon: '📝',
    status: 'available',
    technicalMetadata: 'OAuth2 / Internal Integration Token'
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM Connector',
    category: 'CRM & Productivity',
    desc: 'Enriches inbound leads with AI domain intelligence and writes scores back into CRM properties.',
    icon: '🎯',
    status: 'available',
    technicalMetadata: 'REST API v3 / Private App Token'
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar API',
    category: 'CRM & Productivity',
    desc: 'Syncs executive schedule to contextualize daily briefings around upcoming meetings.',
    icon: '📅',
    status: 'available',
    technicalMetadata: 'Google Cloud Service Account'
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(() => {
    const saved = localStorage.getItem('oryn_integrations');
    if (saved) {
      try { return JSON.parse(saved); } catch { return infrastructureIntegrations; }
    }
    return infrastructureIntegrations;
  });

  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'connected' | 'available' | 'failed'>('all');
  const [retryStatus, setRetryStatus] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('oryn_integrations', JSON.stringify(integrations));
  }, [integrations]);

  const handleToggle = (id: string) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus: IntegrationStatus = item.status === 'connected' ? 'available' : 'connected';
        return { ...item, status: nextStatus, errorDetail: undefined };
      }
      return item;
    }));
  };

  const handleRetry = (id: string) => {
    setRetryStatus(`Pinging endpoint for ${id}...`);
    setTimeout(() => {
      setRetryStatus(null);
      setIntegrations(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'connected',
            errorDetail: undefined,
            lastActivity: 'Just now · Handshake verified (Status 200 OK)'
          };
        }
        return item;
      }));
    }, 1200);
  };

  const filtered = integrations.filter(item => {
    if (filter === 'connected') return item.status === 'connected' || item.status === 'active_workflow';
    if (filter === 'available') return item.status === 'available';
    if (filter === 'failed') return item.status === 'failed';
    return true;
  });

  const connectedCount = integrations.filter(i => i.status === 'connected' || i.status === 'active_workflow').length;
  const failedCount = integrations.filter(i => i.status === 'failed').length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'transparent' }}>
      
      {/* Header */}
      <div style={{ padding: '36px 40px 20px', borderBottom: '1px solid var(--card-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '3px 10px', borderRadius: 6,
                background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)',
                fontSize: 11, fontWeight: 600, color: 'var(--success)', fontFamily: 'monospace'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                INFRASTRUCTURE GATEWAY: ONLINE
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                GATEWAYS: {connectedCount} CONNECTED · {failedCount > 0 ? `${failedCount} DEGRADED` : '0 DEGRADED'}
              </div>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Connected Infrastructure & Gateways
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, margin: '4px 0 0 0' }}>
              Operational transport channels, webhook event listeners, and API connections operated by ORYN.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {(['all', 'connected', 'available', 'failed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 12, textTransform: 'capitalize',
                  background: filter === tab ? 'var(--glass-bg-hover)' : 'transparent',
                  border: `1px solid ${filter === tab ? 'var(--card-border)' : 'transparent'}`,
                  color: filter === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {tab} {tab === 'connected' && `(${connectedCount})`} {tab === 'failed' && failedCount > 0 && `(${failedCount})`}
              </button>
            ))}
          </div>
        </div>

        {retryStatus && (
          <div style={{ background: 'rgba(249, 115, 22, 0.1)', color: 'var(--accent-primary)', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontFamily: 'monospace' }}>
            {retryStatus}
          </div>
        )}
      </div>

      {/* Grid Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {filtered.map(item => (
              <div
                key={item.id}
                style={{
                  background: 'var(--card-bg)', border: `1px solid ${item.status === 'failed' ? 'rgba(239, 68, 68, 0.3)' : 'var(--card-border)'}`,
                  borderRadius: 14, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14,
                  boxShadow: 'var(--shadow-subtle)'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 24, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--glass-bg-subtle)', borderRadius: 8 }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{item.category}</div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span style={{
                    fontSize: 10, fontWeight: 700, fontFamily: 'monospace', padding: '3px 8px', borderRadius: 4,
                    background: item.status === 'connected' ? 'rgba(34, 197, 94, 0.1)' :
                                item.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' : 'var(--glass-bg-subtle)',
                    color: item.status === 'connected' ? 'var(--success)' :
                           item.status === 'failed' ? 'var(--danger)' : 'var(--text-muted)',
                    border: `1px solid ${item.status === 'connected' ? 'rgba(34, 197, 94, 0.25)' : item.status === 'failed' ? 'rgba(239, 68, 68, 0.25)' : 'var(--card-border)'}`
                  }}>
                    {item.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {item.desc}
                </div>

                {/* Connected / Active Workflow Details */}
                {item.status === 'connected' && (
                  <div style={{ background: 'var(--glass-bg-subtle)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {item.usedInWorkflows && item.usedInWorkflows.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>USED BY WORKFLOWS</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-primary)', marginTop: 2 }}>
                          {item.usedInWorkflows.join(', ')}
                        </div>
                      </div>
                    )}
                    {item.lastActivity && (
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>LAST DISPATCH ACTIVITY</div>
                        <div style={{ fontSize: 11.5, color: 'var(--success)', marginTop: 2, fontFamily: 'monospace' }}>
                          ● {item.lastActivity}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Failure / Actionable Error State */}
                {item.status === 'failed' && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: 8, padding: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', fontFamily: 'monospace' }}>
                      GATEWAY TIMEOUT ERROR
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {item.errorDetail}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button
                        onClick={() => handleRetry(item.id)}
                        style={{
                          background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 6,
                          padding: '6px 12px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        Retry Handshake
                      </button>
                      <button
                        onClick={() => setActiveModalId(item.id)}
                        style={{
                          background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--card-border)',
                          borderRadius: 6, padding: '6px 12px', fontSize: 11.5, cursor: 'pointer'
                        }}
                      >
                        Inspect Config
                      </button>
                    </div>
                  </div>
                )}

                {/* Available Status Requirements */}
                {item.status === 'available' && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', background: 'var(--glass-bg-subtle)', padding: '6px 10px', borderRadius: 6 }}>
                    Requirements: {item.technicalMetadata}
                  </div>
                )}

                {/* Bottom Actions */}
                <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: 10, marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {item.technicalMetadata}
                  </span>
                  {item.status !== 'failed' && (
                    <button
                      onClick={() => handleToggle(item.id)}
                      style={{
                        background: 'transparent', border: '1px solid var(--card-border)', borderRadius: 6,
                        padding: '4px 10px', fontSize: 11.5, color: item.status === 'connected' ? 'var(--text-muted)' : 'var(--text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      {item.status === 'connected' ? 'Disconnect' : 'Connect Gateway'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeModalId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14,
            padding: '24px', width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>Gateway Diagnostics: {activeModalId}</h3>
              <button onClick={() => setActiveModalId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Review the connection parameters and webhook signing secrets in your <code>.env</code> file or cluster secrets manager.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <button onClick={() => setActiveModalId(null)} style={{ padding: '6px 14px', borderRadius: 6, background: 'var(--accent-primary)', color: '#fff', border: 'none', fontSize: 12.5, cursor: 'pointer' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
