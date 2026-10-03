import { useState, useEffect } from 'react';
import { RefreshCw, Zap, ArrowRight } from 'lucide-react';
import { fetchWorkflows, fetchWorkflowLogs, toggleWorkflow, runWorkflow } from '../api/oryn';

type AutomationStatus = 'active' | 'paused' | 'disabled';

interface WorkflowRecord {
  id: string;
  name: string;
  description: string;
  trigger: string;
  steps: string[];
  status: AutomationStatus;
  runCount: number;
  successCount: number;
  failureCount: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
}

interface WorkflowLog {
  id: string;
  workflowId: string;
  workflowName: string;
  trigger: string;
  durationMs: number;
  status: 'success' | 'failure' | 'running';
  executedAt: string;
  stepsCompleted: number;
  totalSteps: number;
  error: string | null;
}

export default function AutomationPage() {
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [wfRes, logsRes] = await Promise.all([
        fetchWorkflows(),
        fetchWorkflowLogs(20)
      ]);
      setWorkflows(wfRes.workflows || []);
      setStats(wfRes.stats || null);
      setLogs(logsRes || []);
    } catch (err) {
      console.error('Failed to load workflows', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      const updated = await toggleWorkflow(id);
      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, status: updated.status } : w));
      setActionMessage(`Workflow status updated to ${updated.status}.`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch {
      setActionMessage('Failed to toggle workflow state.');
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleRunNow = async (id: string) => {
    setRunningId(id);
    setActionMessage(null);
    try {
      const res = await runWorkflow(id);
      setActionMessage(res.message || 'Workflow executed successfully.');
      await loadData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage(`Workflow execution failed: ${err.message}`);
      setTimeout(() => setActionMessage(null), 4000);
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px', background: 'var(--bg)', position: 'relative' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.5 }}>
              Automated Workflows & Tasks
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              Manage scheduled triggers, tasks, and automated pipelines across connected services.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={loadData}
              disabled={loading}
              style={{
                padding: '8px 16px', borderRadius: 8,
                background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)',
                color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh Telemetry
            </button>
          </div>
        </div>

        {/* Action feedback message */}
        {actionMessage && (
          <div style={{
            padding: '12px 18px', borderRadius: 10,
            background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.25)',
            color: 'var(--text-primary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10
          }}>
            <Zap size={15} color="var(--accent-primary)" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Operational Telemetry Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Registered Workflows', value: stats ? `${stats.totalWorkflows}` : '...', sub: `${stats?.activeWorkflows || 0} active daemons` },
            { label: 'Total Executions', value: stats ? `${stats.totalExecutions}` : '...', sub: 'Historical runs recorded' },
            { label: 'Execution Reliability', value: stats ? `${stats.successRate}%` : '...', sub: 'Success vs failure ratio' },
            { label: 'Audit Trail Depth', value: stats ? `${stats.recentLogsCount}` : '...', sub: 'Logged execution cycles' },
          ].map((st, i) => (
            <div key={i} style={{
              background: 'var(--card-bg)', border: '1px solid var(--card-border)',
              borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {st.label}
              </div>
              <div style={{ fontSize: 26, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>
                {st.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {st.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Workflows List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Registered Pipelines ({workflows.length})
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Loading workflow pipeline definitions...
            </div>
          ) : workflows.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
              No workflows registered in daemon registry.
            </div>
          ) : (
            workflows.map(wf => {
              const successRate = wf.runCount > 0
                ? `${Math.round((wf.successCount / wf.runCount) * 100)}%`
                : '100%';
              const isRunning = runningId === wf.id;

              return (
                <div key={wf.id} style={{
                  background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                  borderRadius: 14, padding: '24px', display: 'flex', flexDirection: 'column', gap: 18,
                  boxShadow: 'var(--shadow-subtle)', transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          fontSize: 16, fontWeight: 700, color: 'var(--text-primary)',
                          fontFamily: 'var(--font-display)'
                        }}>
                          {wf.name}
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, fontFamily: 'monospace',
                          padding: '2px 8px', borderRadius: 4,
                          background: wf.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                          color: wf.status === 'active' ? 'var(--success)' : 'var(--text-muted)',
                          border: `1px solid ${wf.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'var(--card-border)'}`
                        }}>
                          {wf.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 800, lineHeight: 1.5 }}>
                        {wf.description}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button
                        onClick={() => handleRunNow(wf.id)}
                        disabled={isRunning}
                        style={{
                          padding: '8px 16px', borderRadius: 8,
                          background: 'var(--accent-primary)', color: 'white',
                          border: 'none', fontSize: 12, fontWeight: 600,
                          cursor: isRunning ? 'wait' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: 6,
                          boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)'
                        }}
                      >
                        {isRunning ? 'Executing...' : '▶ Run Now'}
                      </button>

                      <button
                        onClick={() => handleToggle(wf.id)}
                        style={{
                          padding: '8px 14px', borderRadius: 8,
                          background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)',
                          color: wf.status === 'active' ? 'var(--warn)' : 'var(--success)',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        {wf.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                    </div>
                  </div>

                  {/* Pipeline Steps Flow */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                    padding: '12px 16px', background: 'var(--glass-bg-subtle)',
                    borderRadius: 10, border: '1px solid var(--card-border)'
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginRight: 6 }}>
                      PIPELINE:
                    </span>
                    {wf.steps.map((st, sIdx) => (
                      <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 6,
                          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                          fontSize: 11.5, color: 'var(--text-primary)', fontWeight: 500
                        }}>
                          {st}
                        </span>
                        {sIdx < wf.steps.length - 1 && (
                          <ArrowRight size={12} color="var(--accent-primary)" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Execution Metrics Metadata */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
                    borderTop: '1px solid var(--card-border)', paddingTop: 14
                  }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trigger Definition</div>
                      <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, marginTop: 2, fontFamily: 'monospace' }}>
                        {wf.trigger}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Executions</div>
                      <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, marginTop: 2 }}>
                        {wf.runCount} runs ({successRate} success)
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Dispatched</div>
                      <div style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 2 }}>
                        {wf.lastRunAt ? new Date(wf.lastRunAt).toLocaleString() : 'Never run'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Next Schedule</div>
                      <div style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 2 }}>
                        {wf.nextRunAt ? new Date(wf.nextRunAt).toLocaleString() : 'Event-triggered'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Execution Log Table */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
          borderRadius: 14, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Execution History & Telemetry Audit Log
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              Showing {logs.length} most recent dispatches
            </span>
          </div>

          {logs.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No execution records in audit log.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>EXECUTION ID</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>WORKFLOW</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>TRIGGER</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>DURATION</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>STATUS</th>
                    <th style={{ padding: '8px 12px', fontWeight: 600 }}>TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--glass-bg-subtle)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{log.id}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{log.workflowName}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.trigger}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{log.durationMs}ms</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, fontFamily: 'monospace',
                          background: log.status === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: log.status === 'success' ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                        {new Date(log.executedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
