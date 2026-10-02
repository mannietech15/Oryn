import type { AnalyticsData } from '../types';

const BASE = '/api';

export async function* streamChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  webSearch: boolean,
  taskExtract: boolean,
  model: string,
  language: string,
  signal?: AbortSignal
): AsyncGenerator<{ type: string; text?: string; message?: string }> {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, webSearch, taskExtract, model, language }),
    signal,
  });

  if (!res.ok) {
    throw new Error('Server connection failed: ' + res.statusText);
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('text/html')) {
    throw new Error('Server connection failed: Received HTML proxy error instead of stream.');
  }

  if (!res.body) throw new Error('No response body');
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          yield JSON.parse(line.slice(6));
        } catch {
          // skip malformed
        }
      }
    }
  }
}

export async function analyzeFile(file: File, prompt?: string, model?: string, language?: string): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  if (prompt) form.append('prompt', prompt);
  if (model) form.append('model', model);
  if (language) form.append('language', language);
  const res = await fetch(`${BASE}/analyze`, { method: 'POST', body: form });
  const data = await res.json() as { analysis?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Analysis failed');
  return data.analysis ?? '';
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch(`${BASE}/analytics`);
  if (!res.ok) throw new Error('Analytics fetch failed');
  return res.json() as Promise<AnalyticsData>;
}

export async function checkHealth(): Promise<{ status: string; uptime: number; model: string }> {
  const res = await fetch(`${BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

// --- Financials ---
export async function fetchFinancials() {
  const res = await fetch(`${BASE}/financials`);
  if (!res.ok) throw new Error('Failed to fetch financials');
  return res.json();
}

export async function postFinancialEntry(entry: {
  type: 'revenue' | 'expense';
  category: string;
  amount: number;
  date?: string;
  note?: string;
}) {
  const res = await fetch(`${BASE}/financials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to post financial entry');
  }
  return res.json();
}

// --- Automations ---
export async function fetchWorkflows() {
  const res = await fetch(`${BASE}/automations`);
  if (!res.ok) throw new Error('Failed to fetch workflows');
  return res.json();
}

export async function fetchWorkflowLogs(limit: number = 20) {
  const res = await fetch(`${BASE}/automations/logs?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch workflow execution logs');
  return res.json();
}

export async function toggleWorkflow(id: string) {
  const res = await fetch(`${BASE}/automations/${id}/toggle`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to toggle workflow');
  return res.json();
}

export async function runWorkflow(id: string) {
  const res = await fetch(`${BASE}/automations/${id}/run`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to execute workflow');
  return res.json();
}

// --- Integrations ---
export async function fetchIntegrations() {
  const res = await fetch(`${BASE}/integrations/status`);
  if (!res.ok) throw new Error('Failed to fetch integrations status');
  return res.json();
}

export async function testIntegration(id: string) {
  const res = await fetch(`${BASE}/integrations/${id}/test`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to test integration');
  return res.json();
}

// --- Documents ---
export async function fetchDocuments() {
  const res = await fetch(`${BASE}/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function uploadDocument(file: File, prompt?: string) {
  const form = new FormData();
  form.append('file', file);
  if (prompt) form.append('prompt', prompt);
  const res = await fetch(`${BASE}/documents/upload`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Document upload and analysis failed');
  }
  return res.json();
}

export async function deleteDocument(id: string) {
  const res = await fetch(`${BASE}/documents/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete document');
  return res.json();
}

// --- Organization ---
export async function fetchOrganization() {
  const res = await fetch(`${BASE}/organization`);
  if (!res.ok) throw new Error('Failed to fetch organization');
  return res.json();
}

export async function updateCompany(company: any) {
  const res = await fetch(`${BASE}/organization`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company }),
  });
  if (!res.ok) throw new Error('Failed to update company');
  return res.json();
}

// --- Human-in-the-Loop Email Actions ---
export async function stageEmailDraft(payload: { to: string; subject: string; body: string }) {
  const res = await fetch(`${BASE}/email/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to stage email draft');
  }
  return res.json();
}

export async function confirmEmailDraft(draftId: string) {
  const res = await fetch(`${BASE}/email/confirm/${draftId}`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to dispatch email');
  }
  return res.json();
}

// --- Operational Calendar ---
export async function fetchCalendarEvents() {
  const res = await fetch(`${BASE}/calendar`);
  if (!res.ok) throw new Error('Failed to fetch calendar events');
  return res.json();
}

export async function addCalendarEvent(event: {
  title: string;
  time: string;
  type?: 'internal' | 'external' | 'automation';
  attendees?: string[];
  aiBrief?: string;
}) {
  const res = await fetch(`${BASE}/calendar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create calendar event');
  }
  return res.json();
}

export async function deleteCalendarEvent(id: string) {
  const res = await fetch(`${BASE}/calendar/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete calendar event');
  return res.json();
}

