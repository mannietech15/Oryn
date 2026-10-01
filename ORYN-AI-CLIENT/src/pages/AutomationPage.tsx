import { useState } from 'react';

type AutomationStatus = 'active' | 'paused' | 'draft';

interface PipelineStep {
  name: string;
  type: string;
  source: string;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: { type: string; detail: string; schedule: string };
  steps: PipelineStep[];
  status: AutomationStatus;
  runs: number;
  successRate: string;
  lastRun: { time: string; status: 'success' | 'failed' | 'running'; duration: string };
  nextRun: string;
}

interface ExecutionLog {
  id: string;
  workflow: string;
  timestamp: string;
  status: 'success' | 'failed';
  code: string;
  duration: string;
}

const operationalAutomations: Automation[] = [
  {
    id: '1',
    name: 'Weekly Executive Sales Synthesis',
    description: 'Ingests trailing 7-day Stripe billing volume, analyzes cohort expansion, and dispatches an executive summary via Custom SMTP.',
    trigger: { type: 'SCHEDULE', detail: 'CRON: 0 17 * * 5', schedule: 'Every Friday at 17:00 UTC' },
    steps: [
      { name: 'Stripe Billing', type: 'Ingress', source: 'Stripe Gateway' },
      { name: 'Cohort Analysis', type: 'LLM Reasoning', source: 'NVIDIA Llama 3.2' },
      { name: 'HTML Report Generation', type: 'Synthesis', source: 'Report Engine' },
      { name: 'Mail Dispatch', type: 'Action', source: 'Custom SMTP Transport' },
    ],
    status: 'active',
    runs: 24,
    successRate: '100%',
    lastRun: { time: 'Sep 25, 17:00:03 UTC', status: 'success', duration: '184ms' },
    nextRun: 'Oct 2, 17:00:00 UTC',
  },
  {
    id: '2',
    name: 'Inbound Lead Enrichment & Scoring',
    description: 'Triggers on CRM lead creation webhook, verifies company registry records via semantic search, and updates lead score.',
    trigger: { type: 'WEBHOOK', detail: 'POST /api/webhooks/crm/leads', schedule: 'Real-time Event Ingress' },
    steps: [
      { name: 'CRM Webhook', type: 'Event Ingest', source: 'HubSpot / CRM' },
      { name: 'Market Intelligence', type: 'Enrichment', source: 'Search Index' },
      { name: 'ICP Fit Evaluation', type: 'Score Matrix', source: 'ORYN Rule Engine' },
      { name: 'Record Update', type: 'Action', source: 'CRM Ingress API' },
    ],
    status: 'active',
    runs: 142,
    successRate: '99.3%',
    lastRun: { time: 'Today, 14:18:22 UTC', status: 'success', duration: '312ms' },
    nextRun: 'Awaiting webhook ingress',
  },
  {
    id: '3',
    name: 'Support Ticket Sentiment Escalation',
    description: 'Inspects incoming Zendesk tickets for negative sentiment patterns (>0.75 score) and immediately notifies the #urgent-support Slack channel.',
    trigger: { type: 'WEBHOOK', detail: 'POST /api/webhooks/support/tickets', schedule: 'Real-time Event Ingress' },
    steps: [
      { name: 'Ticket Webhook', type: 'Event Ingest', source: 'Zendesk Gateway' },
      { name: 'Sentiment Extraction', type: 'Analysis', source: 'NVIDIA NIM Fast Tier' },
      { name: 'Threshold Evaluation', type: 'Logic Gate', source: 'Rule Engine' },
      { name: 'Slack Alert', type: 'Notification', source: 'Slack Webhook' },
    ],
    status: 'paused',
    runs: 89,
    successRate: '98.8%',
    lastRun: { time: 'Sep 28, 09:12:10 UTC', status: 'success', duration: '240ms' },
    nextRun: 'Paused by operator',
  },
];

const sampleExecutionLogs: ExecutionLog[] = [
  { id: 'exec_7f8a91b', workflow: 'Inbound Lead Enrichment & Scoring', timestamp: '14:18:22 UTC', status: 'success', code: '200 OK', duration: '312ms' },
  { id: 'exec_3d1e29c', workflow: 'Inbound Lead Enrichment & Scoring', timestamp: '13:05:44 UTC', status: 'success', code: '200 OK', duration: '280ms' },
  { id: 'exec_9b4e72a', workflow: 'Weekly Executive Sales Synthesis', timestamp: 'Sep 25 17:00:03', status: 'success', code: '250 Mail Sent', duration: '184ms' },
  { id: 'exec_1a8c45f', workflow: 'Support Ticket Sentiment Escalation', timestamp: 'Sep 28 09:12:10', status: 'success', code: '200 OK', duration: '240ms' },
  { id: 'exec_6c3b88e', workflow: 'Support Ticket Sentiment Escalation', timestamp: 'Sep 28 08:44:19', status: 'failed', code: '504 Timeout', duration: '5002ms' },
];

export default function AutomationPage() {
  const [automations, setAutomations] = useState<Automation[]>(operationalAutomations);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [selectedLogs, setSelectedLogs] = useState(false);

  const toggleStatus = (id: string) => {
    setAutomations(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: a.status === 'active' ? 'paused' : 'active' };
      }
      return a;
    }));
  };

  const filteredAutomations = automations.filter(a => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'transparent' }}>
      
      {/* Engine Status Header */}
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
                WORKFLOW RUNNER DAEMON: ONLINE
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                QUEUE LATENCY: 12ms · CONCURRENT WORKERS: 4
              </div>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Workflow Automation Engine
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, margin: '4px 0 0 0' }}>
              Event-driven pipeline orchestration, automated data enrichment, and guardrailed action execution.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              onClick={() => setSelectedLogs(!selectedLogs)}
              style={{
                padding: '8px 16px', background: selectedLogs ? 'rgba(249, 115, 22, 0.1)' : 'var(--card-bg)',
                border: `1px solid ${selectedLogs ? 'var(--accent-primary)' : 'var(--card-border)'}`,
                color: selectedLogs ? 'var(--accent-primary)' : 'var(--text-primary)',
                borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {selectedLogs ? 'Hide Execution Logs' : 'View Execution Logs (5)'}
            </button>
            <button style={{ 
              padding: '8px 18px', background: 'var(--accent-primary)', color: '#fff', 
              border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 12.5, cursor: 'pointer', 
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              + Create Workflow
            </button>
          </div>
        </div>

        {/* Engine Telemetry Strip */}
        <div style={{ display: 'flex', gap: 24, marginTop: 12, borderTop: '1px solid var(--card-border)', paddingTop: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Configured Pipelines:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{automations.length}</strong>
          </div>
          <div style={{ display: 'flex', gap: 6, fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Active Runners:</span>
            <strong style={{ color: 'var(--success)' }}>{automations.filter(a => a.status === 'active').length}</strong>
          </div>
          <div style={{ display: 'flex', gap: 6, fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Executions (MTD):</span>
            <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>255</strong>
          </div>
          <div style={{ display: 'flex', gap: 6, fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Overall Success Rate:</span>
            <strong style={{ color: 'var(--success)', fontFamily: 'monospace' }}>99.3%</strong>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'monospace' }}>
              REGISTERED WORKFLOW PIPELINES
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['all', 'active', 'paused'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 11.5, textTransform: 'capitalize',
                    background: statusFilter === tab ? 'var(--glass-bg-hover)' : 'transparent',
                    border: `1px solid ${statusFilter === tab ? 'var(--card-border)' : 'transparent'}`,
                    color: statusFilter === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Workflow Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredAutomations.map(a => (
              <div 
                key={a.id} 
                style={{
                  background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14,
                  padding: '20px', display: 'flex', flexDirection: 'column', gap: 16,
                  boxShadow: 'var(--shadow-subtle)'
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</h3>
                      <span style={{
                        fontSize: 10, fontWeight: 700, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 4,
                        background: a.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                        color: a.status === 'active' ? 'var(--success)' : 'var(--warn)',
                        border: `1px solid ${a.status === 'active' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(234, 179, 8, 0.25)'}`
                      }}>
                        {a.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ margin: '6px 0 0 0', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: 800 }}>
                      {a.description}
                    </p>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleStatus(a.id)}
                    style={{
                      padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                      background: a.status === 'active' ? 'var(--glass-bg-subtle)' : 'rgba(34, 197, 94, 0.08)',
                      border: `1px solid ${a.status === 'active' ? 'var(--card-border)' : 'rgba(34, 197, 94, 0.2)'}`,
                      color: a.status === 'active' ? 'var(--text-secondary)' : 'var(--success)',
                      cursor: 'pointer'
                    }}
                  >
                    {a.status === 'active' ? 'Pause Pipeline' : 'Resume Pipeline'}
                  </button>
                </div>

                {/* Pipeline Steps Architecture */}
                <div style={{ background: 'var(--glass-bg-subtle)', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--card-border)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 8 }}>
                    EXECUTION PIPELINE STEPS
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {a.steps.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 6, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)' }}>{step.name}</span>
                          <span style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{step.source}</span>
                        </div>
                        {idx < a.steps.length - 1 && (
                          <span style={{ color: 'var(--accent-primary)', fontSize: 12, fontWeight: 700 }}>➔</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata & Operational Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, borderTop: '1px solid var(--card-border)', paddingTop: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>TRIGGER SPECIFICATION</div>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 2, fontWeight: 500 }}>{a.trigger.schedule}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{a.trigger.detail}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>LAST EXECUTION</div>
                    <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 2, fontWeight: 500 }}>
                      ● {a.lastRun.time}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>Latency: {a.lastRun.duration} · Status: 200 OK</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>NEXT SCHEDULED RUN</div>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 2, fontWeight: 500 }}>{a.nextRun}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>Worker: Dedicated Daemon</div>
                  </div>

                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>RELIABILITY METRICS</div>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 2, fontWeight: 500 }}>{a.runs} total runs</div>
                    <div style={{ fontSize: 10, color: 'var(--success)', fontFamily: 'monospace' }}>{a.successRate} success rate</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Execution History Drawer */}
          {selectedLogs && (
            <div style={{
              background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14,
              padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                RECENT DISPATCH LOGS (BUFFER: LAST 5 RUNS)
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'monospace' }}>
                      <th style={{ padding: '8px 12px' }}>RUN ID</th>
                      <th style={{ padding: '8px 12px' }}>WORKFLOW</th>
                      <th style={{ padding: '8px 12px' }}>TIMESTAMP</th>
                      <th style={{ padding: '8px 12px' }}>DURATION</th>
                      <th style={{ padding: '8px 12px' }}>EXIT STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleExecutionLogs.map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--glass-bg-subtle)' }}>
                        <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: 'var(--accent-primary)' }}>{log.id}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>{log.workflow}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.timestamp}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.duration}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{
                            fontSize: 10, fontFamily: 'monospace', fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                            background: log.status === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: log.status === 'success' ? 'var(--success)' : 'var(--danger)'
                          }}>
                            {log.code}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
