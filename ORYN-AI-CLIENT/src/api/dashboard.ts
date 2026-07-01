import type { CommandResult, DashboardBriefing, DashboardAlert, DashboardGoal, HealthScore } from '../types';

const BASE = '/api/dashboard';

export async function runCommand(query: string, context?: string): Promise<CommandResult> {
  const res = await fetch(`${BASE}/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, context }),
  });
  if (!res.ok) throw new Error('Command failed');
  return res.json() as Promise<CommandResult>;
}

export async function fetchBriefing(): Promise<DashboardBriefing> {
  const res = await fetch(`${BASE}/briefing`);
  if (!res.ok) throw new Error('Briefing fetch failed');
  return res.json() as Promise<DashboardBriefing>;
}

export async function fetchAlerts(): Promise<DashboardAlert[]> {
  const res = await fetch(`${BASE}/alerts`);
  if (!res.ok) throw new Error('Alerts fetch failed');
  return res.json() as Promise<DashboardAlert[]>;
}

export async function fetchGoals(): Promise<DashboardGoal[]> {
  const res = await fetch(`${BASE}/goals`);
  if (!res.ok) throw new Error('Goals fetch failed');
  return res.json() as Promise<DashboardGoal[]>;
}

export async function fetchGoalAction(id: string): Promise<{ recommendation: string; goalId: string }> {
  const res = await fetch(`${BASE}/goals/${id}/action`, { method: 'POST' });
  if (!res.ok) throw new Error('Goal action failed');
  return res.json() as Promise<{ recommendation: string; goalId: string }>;
}

export async function fetchHealthScore(): Promise<HealthScore> {
  const res = await fetch(`${BASE}/health-score`);
  if (!res.ok) throw new Error('Health score fetch failed');
  return res.json() as Promise<HealthScore>;
}
