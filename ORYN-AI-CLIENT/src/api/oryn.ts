import type { AnalyticsData } from '../types';

const BASE = '/api';

export async function* streamChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  webSearch: boolean,
  taskExtract: boolean,
  model: string
): AsyncGenerator<{ type: string; text?: string; message?: string }> {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, webSearch, taskExtract, model }),
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

export async function analyzeFile(file: File, prompt?: string, model?: string): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  if (prompt) form.append('prompt', prompt);
  if (model) form.append('model', model);
  const res = await fetch(`${BASE}/analyze`, { method: 'POST', body: form });
  const data = await res.json() as { analysis?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Analysis failed');
  return data.analysis ?? '';
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch(`${BASE}/analytics`);
  return res.json() as Promise<AnalyticsData>;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
