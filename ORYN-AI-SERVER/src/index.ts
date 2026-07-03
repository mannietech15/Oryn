import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import OpenAI from 'openai';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || '',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

// The 'Senior Professor' (Incredibly smart, but slower and strict rate limits)
// const MODEL_NAME = 'meta/llama-3.2-90b-vision-instruct';

// The 'Junior' (Extremely fast, perfect for real-time voice mode)
const MODEL_NAME = 'meta/llama-3.1-8b-instruct';

console.log('🔑 NVIDIA API Key:', process.env.NVIDIA_API_KEY ? `Loaded (${process.env.NVIDIA_API_KEY.slice(0, 9)}...)` : 'MISSING');

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ── Health check ──────────────────────────────────────────
app.get('/', (_req, res) => {
  res.send('<h1>ORYN AI Server is running (NVIDIA NIM)</h1><p>Visit <code>/api/health</code> for status.</p>');
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', model: MODEL_NAME });
});

// ── Chat (streaming) ──────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { messages, webSearch, taskExtract } = req.body as {
    messages: { role: 'user' | 'assistant'; content: string }[];
    webSearch: boolean;
    taskExtract: boolean;
  };

  const systemInstruction = `You are Oryn (pronounced "Orine"), a sleek futuristic business AI assistant. Your name is Oryn — always write it as "Oryn" (never spell it out letter by letter). You are professional, insightful, and concise.
You help with business strategy, productivity, data analysis, drafting, and decision-making.
${webSearch ? 'You have web search capabilities — mention relevant current data when helpful.' : ''}
${taskExtract ? 'After your response, if there are clear action items, append a JSON block on a new line: {"tasks":["task1","task2"]} — only if tasks genuinely exist.' : ''}
Keep responses focused and powerful. Use **bold** for key numbers or insights. Max 3-4 sentences unless detail is needed.`;

  const lastMsgContent = messages[messages.length - 1].content.trim();
  const lowerMsg = lastMsgContent.toLowerCase();
  
  // Smarter regex to catch "/imagine", "generate an image of", "generate pictures of", "create images", etc.
  const imageMatch = lowerMsg.match(/^(?:\/imagine\s+|(?:please\s+)?(?:generate|create|make|draw)\s+(?:(?:an?\s+|the\s+)?(?:image|picture)s?(?:\s+of)?\s+))(.+)/);
  
  if (imageMatch) {
    const prompt = imageMatch[1].trim();
    const encodedPrompt = encodeURIComponent(prompt);
    // Pollinations generates beautiful images on the fly via URL params
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true&seed=${seed}`;
    const filename = prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50) + '.jpg';
    
    const responseText = `Generating your vision for **"${prompt}"**...\n\n<style>
      @keyframes shimmerGen {
        0% { background-position: 200% center; }
        100% { background-position: -200% center; }
      }
    </style>
    <div style="margin-top: 16px; position: relative; border-radius: 12px; overflow: hidden; border: 1px solid var(--card-border); box-shadow: 0 8px 24px rgba(0,0,0,0.3); max-width: 400px; aspect-ratio: 1/1; background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.02) 75%); background-size: 200% 100%; animation: shimmerGen 2s infinite linear;">
      <button onclick="const a=document.createElement('a'); a.href='/api/download?url='+encodeURIComponent('${imageUrl}')+'&filename=${filename}'; a.click();" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer; font-family: var(--font-sans); font-size: 11px; font-weight: 500; padding: 6px 12px; border-radius: 6px; transition: opacity 0.2s, background 0.2s; z-index: 10; opacity: 0;" onmouseover="this.style.background='rgba(0,0,0,0.8)'" onmouseout="this.style.background='rgba(0,0,0,0.6)'">Download</button>
      <img onload="this.style.opacity=1; this.previousElementSibling.style.opacity=1;" src="${imageUrl}" alt="${prompt}" style="width: 100%; height: 100%; display: block; object-fit: cover; opacity: 0; transition: opacity 0.8s ease;" />
    </div>`.replace(/\n/g, ' ');
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    res.write(`data: ${JSON.stringify({ type: 'text', text: responseText })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const maxRetries = 3;
  const retryDelays = [2000, 5000, 10000]; // ms

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`💬 Chat request: "${messages[messages.length - 1].content.slice(0, 30)}..." (attempt ${attempt + 1})`);

      const response = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemInstruction },
          ...messages.map(m => ({
            role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
            content: m.content
          }))
        ],
        stream: true,
      });

      for await (const chunk of response) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) {
          res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
      return; // Success — exit
    } catch (err: any) {
      const is429 = err.message?.includes('429') || err.status === 429 || err.message?.includes('rate-limit') || err.message?.includes('rate_limit');
      if (is429 && attempt < maxRetries) {
        console.log(`⏳ Rate limited, retrying in ${retryDelays[attempt] / 1000}s... (attempt ${attempt + 1}/${maxRetries})`);
        res.write(`data: ${JSON.stringify({ type: 'status', text: `Thinking...` })}\n\n`);
        await new Promise(r => setTimeout(r, retryDelays[attempt]));
        continue;
      }
      console.error('❌ Chat Error:', err.message);
      const userMessage = is429
        ? 'The AI model is temporarily rate-limited on the free tier. Please wait a moment and try again.'
        : err.message?.includes('Connection error') || err.message?.includes('upstream')
          ? 'The AI provider is temporarily unavailable. Please wait a few seconds and try again.'
          : err.message;
      res.write(`data: ${JSON.stringify({ type: 'error', message: userMessage })}\n\n`);
      res.end();
      return;
    }
  }
});

// ── File analysis ─────────────────────────────────────────
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const { prompt } = req.body as { prompt?: string };
  const userPrompt = prompt || 'Analyze this file and provide a concise business summary with key insights and action items.';
  const isImage = req.file.mimetype.startsWith('image/');
  let contentPayload: any;

  if (isImage) {
    const base64Image = req.file.buffer.toString('base64');
    contentPayload = [
      { type: 'text', text: userPrompt },
      { type: 'image_url', image_url: { url: `data:${req.file.mimetype};base64,${base64Image}` } }
    ];
  } else {
    const fileContent = req.file.buffer.toString('utf-8');
    contentPayload = `${userPrompt}\n\nFile: ${req.file.originalname}\nContent:\n${fileContent.slice(0, 8000)}`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: contentPayload }],
      max_tokens: 1024,
    });
    const text = response.choices[0]?.message?.content || 'No analysis generated.';
    res.json({ analysis: text, filename: req.file.originalname });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Analytics data (mock) ─────────────────────────────────
app.get('/api/analytics', (_req, res) => {
  res.json({
    kpis: {
      revenue: { value: '$284K', change: '+18.4%', trend: 'up' },
      users: { value: '1,842', change: '+9.2%', trend: 'up' },
      tasks: { value: '3,291', change: '+34%', trend: 'up' },
      retention: { value: '91%', change: '+3pts', trend: 'up' },
    },
    usageTimeline: [40, 55, 48, 65, 72, 60, 78, 85, 100],
    months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    breakdown: [
      { label: 'Chat', pct: 40, color: '#0095ff' },
      { label: 'Tasks', pct: 24, color: '#6c2fff' },
      { label: 'Search', pct: 15, color: '#00d4ff' },
      { label: 'Files', pct: 12, color: '#00e5a0' },
      { label: 'Other', pct: 9, color: '#4a6a99' },
    ],
    team: [
      { name: 'Alex Chen', tasks: 142, chats: 89, score: 98 },
      { name: 'Jordan Lee', tasks: 118, chats: 74, score: 84 },
      { name: 'Morgan Park', tasks: 97, chats: 61, score: 73 },
      { name: 'Riley Kim', tasks: 86, chats: 55, score: 67 },
    ],
  });
});

// ── Dashboard: Command Bar ─────────────────────────────────
app.post('/api/dashboard/command', async (req, res) => {
  const { query, context } = req.body as { query: string; context?: string };
  if (!query?.trim()) { res.status(400).json({ error: 'query is required' }); return; }

  const systemInstruction = `You are ORYN, an elite business AI analyst embedded in a live business dashboard.
The user is asking a question about their business data. Current context:
- Revenue MTD: $284K (+18.4% vs last month)
- Active Users: 1,842 (+9.2% this week)
- AI Tasks Done: 3,291 (+34% this month)
- Retention Rate: 91% (+3 pts YoY)
- Team: 4 members, top performer Alex Chen (score 98)
${context ? `Additional context: ${context}` : ''}
Respond with a JSON object in this exact format (no markdown, just JSON):
{
  "answer": "2-3 sentence sharp business insight or recommendation",
  "type": "insight|warning|opportunity|analysis",
  "metric": "the key metric or figure this relates to",
  "action": "one concrete next step the user should take (optional)"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: query }
      ]
    });
    const raw = (response.choices[0]?.message?.content || '').trim();
    try {
      // Strip possible markdown fences
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      res.json(parsed);
    } catch {
      res.json({ answer: raw, type: 'analysis', metric: 'general', action: null });
    }
  } catch (err: any) {
    console.error('❌ Dashboard Command Error:', err.message);
    // Fallback insight when Gemini unavailable
    const lc = query.toLowerCase();
    if (lc.includes('user') || lc.includes('churn')) {
      res.json({ answer: 'Three enterprise accounts have been inactive for 14+ days — representing ~22% of MRR at risk. Proactive re-engagement at this stage has a 60% recovery rate in B2B SaaS.', type: 'warning', metric: 'Active Users 1,842', action: 'Send a personalized re-engagement sequence to the 3 inactive accounts today.' });
    } else if (lc.includes('retention')) {
      res.json({ answer: 'Retention at 91% is strong but the 4pt gap to your 95% goal is bridgeable. At-risk clients share one pattern: low feature adoption in month 2.', type: 'opportunity', metric: 'Retention 91%', action: 'Launch a guided onboarding campaign targeting customers in their second month.' });
    } else if (lc.includes('opportunit')) {
      res.json({ answer: 'Today is Tuesday — your historically highest-converting sales day with 2.3× more deal closures. You have 2 enterprise deals in late-stage pipeline that could realistically close this week.', type: 'opportunity', metric: 'Pipeline — 2 Active Deals', action: 'Prioritize personal outreach to both enterprise prospects before 3pm today.' });
    } else {
      res.json({ answer: 'Revenue is at $284K MTD, up 18.4% — outpacing your quarterly target. AI task throughput is at a record high of 3,291 this month, driving measurable productivity gains across your team.', type: 'insight', metric: 'Revenue MTD $284K', action: 'Follow up personally with enterprise prospects to accelerate Q2 close.' });
    }
  }
});

// ── Dashboard: Daily Briefing (hourly in-memory cache) ────
let briefingCache: { data: object; ts: number } | null = null;

app.get('/api/dashboard/briefing', async (_req, res) => {
  const now = Date.now();
  if (briefingCache && now - briefingCache.ts < 3600_000) {
    res.json(briefingCache.data); return;
  }

  const prompt = `You are ORYN. Generate a crisp executive briefing for a business dashboard. Today's data:
- Revenue MTD: $284K (+18.4%)
- Active users: 1,842 (+9.2%)  
- AI tasks completed: 3,291 (+34%)
- Retention: 91%
- 2 active enterprise deals in pipeline
- Team of 4 — top performer Alex Chen
Respond ONLY with a JSON object (no markdown fences):
{
  "headline": "8-word attention-grabbing headline for today",
  "summary": "2-sentence sharp executive summary of business health",
  "highlight": "one standout number or fact to feature prominently",
  "mood": "strong|growing|steady|caution",
  "tip": "one proactive AI-recommended action for today"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: prompt }]
    });
    const raw = (response.choices[0]?.message?.content || '').trim();
    try {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      briefingCache = { data: parsed, ts: now };
      res.json(parsed);
    } catch {
      res.json({ headline: 'Business is Growing Strong', summary: raw, highlight: '$284K MTD', mood: 'growing', tip: 'Follow up on open deals today.' });
    }
  } catch (err: any) {
    console.error('❌ Briefing Error:', err.message);
    // Fallback briefing when Gemini unavailable
    const fallback = {
      headline: 'Record AI Output — Revenue Up 18% MTD',
      summary: 'Your business is performing exceptionally this month, with revenue at $284K representing an 18.4% increase over last month. AI task throughput hit a new monthly record at 3,291 completions and user retention remains strong at 91%.',
      highlight: '+18.4% MTD',
      mood: 'strong',
      tip: 'Today is Tuesday — your highest-converting sales day historically. Prioritize outreach to the 2 enterprise deals currently in late-stage pipeline to maximize close probability before end of week.',
    };
    briefingCache = { data: fallback, ts: now };
    res.json(fallback);
  }
});

// ── Dashboard: Smart Alert Feed ────────────────────────────
app.get('/api/dashboard/alerts', async (_req, res) => {
  const prompt = `You are ORYN's alert engine. Analyze this business snapshot and generate smart alerts:
- Revenue MTD: $284K (strong, +18.4%)
- Active users: 1,842 — but 3 enterprise accounts haven't logged in for 14 days
- Support tickets: up 40% in the last 2 hours (17 new tickets)
- AI Tasks: 3,291 completed — throughput 84%
- Retention: 91% — 2 clients flagged at-risk
- Zapier & Notion integrations disconnected
- Best sales day historically is Tuesday — today is Tuesday

Return ONLY a JSON array of exactly 5 alert objects (no markdown fences):
[
  { "id": "1", "type": "warning|opportunity|info|critical", "icon": "emoji", "title": "short alert title", "detail": "one sentence detail", "action": "recommended action", "time": "relative time string like '5m ago'" }
]`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: prompt }]
    });
    const raw = (response.choices[0]?.message?.content || '').trim();
    try {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      res.json(Array.isArray(parsed) ? parsed : (parsed.alerts ?? []));
    } catch {
      res.json([
        { id: '1', type: 'warning', icon: '⚠️', title: '3 Enterprise Accounts Inactive', detail: '3 accounts have not logged in for 14+ days — churn risk is high.', action: 'Send re-engagement email', time: '12m ago' },
        { id: '2', type: 'critical', icon: '🚨', title: 'Support Tickets Surge +40%', detail: '17 new tickets in 2 hours — potential product issue.', action: 'Review open tickets now', time: '1h ago' },
        { id: '3', type: 'opportunity', icon: '💡', title: 'Best Sales Day — Act Now', detail: 'Tuesday is your historically highest-converting sales day.', action: 'Send outreach campaign', time: '2h ago' },
        { id: '4', type: 'warning', icon: '🔌', title: 'Notion & Zapier Disconnected', detail: 'Two integrations went offline — automations may be failing.', action: 'Reconnect integrations', time: '3h ago' },
        { id: '5', type: 'info', icon: '🎯', title: '2 Clients Flagged At-Risk', detail: 'Retention model flagged 2 enterprise clients with declining engagement.', action: 'Schedule QBR calls', time: '4h ago' },
      ]);
    }
  } catch (err: any) {
    console.error('❌ Alerts Error:', err.message);
    // Fallback alerts when Gemini unavailable
    res.json([
      { id: '1', type: 'critical', icon: '🚨', title: '3 Enterprise Accounts Inactive 14+ Days', detail: 'Combined MRR risk of ~$18K if churned — accounts have been silent for 2 weeks.', action: 'Send personalized re-engagement email with exclusive offer', time: '12m ago' },
      { id: '2', type: 'warning', icon: '⚠️', title: 'Support Tickets Spiked +40% in 2 Hours', detail: '17 new tickets opened rapidly — potential product or infrastructure issue emerging.', action: 'Audit ticket themes and escalate to engineering if pattern confirmed', time: '1h ago' },
      { id: '3', type: 'opportunity', icon: '💡', title: "Tuesday = Your Best Sales Day", detail: 'Historical data shows 2.3× more deal closures on Tuesdays vs. any other weekday.', action: 'Schedule outreach calls and live demos for this afternoon', time: '2h ago' },
      { id: '4', type: 'warning', icon: '🔌', title: 'Notion & Zapier Integrations Offline', detail: 'Both disconnected — automated workflows including follow-up sequences may be silently failing.', action: 'Reconnect both integrations via the Integrations panel now', time: '3h ago' },
      { id: '5', type: 'info', icon: '🎯', title: '2 Clients Flagged At-Risk by AI Model', detail: 'Engagement scores dropped below threshold — churn probability above 65% for both accounts.', action: 'Schedule Quarterly Business Reviews within 5 business days', time: '4h ago' },
    ]);
  }
});

// ── Dashboard: Goals / OKR ─────────────────────────────────
app.get('/api/dashboard/goals', (_req, res) => {
  res.json([
    { id: 'rev', label: 'Q2 Revenue Target', target: 500000, current: 284000, unit: '$', color: '#0088ff' },
    { id: 'users', label: 'Active User Growth', target: 3000, current: 1842, unit: '', color: '#00f0ff' },
    { id: 'ret', label: 'Retention Rate Goal', target: 95, current: 91, unit: '%', color: '#00ffaa' },
    { id: 'tasks', label: 'AI Tasks Milestone', target: 5000, current: 3291, unit: '', color: '#8a2be2' },
  ]);
});

app.post('/api/dashboard/goals/:id/action', async (req, res) => {
  const { id } = req.params;
  const goals: Record<string, { label: string; target: string; current: string }> = {
    rev:   { label: 'Q2 Revenue Target', target: '$500K', current: '$284K (57% achieved)' },
    users: { label: 'Active User Growth', target: '3,000 users', current: '1,842 users (61%)' },
    ret:   { label: 'Retention Rate Goal', target: '95%', current: '91% (4pts gap)' },
    tasks: { label: 'AI Tasks Milestone', target: '5,000 tasks', current: '3,291 tasks (66%)' },
  };
  const goal = goals[id];
  if (!goal) { res.status(404).json({ error: 'Goal not found' }); return; }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: 'You are ORYN, a sharp business AI. Give one highly specific, actionable recommendation in 2 sentences. Be direct and data-driven.' },
        { role: 'user', content: `Goal: ${goal.label}. Target: ${goal.target}. Progress: ${goal.current}. What is the single most impactful action to accelerate progress toward this goal?` }
      ],
    });
    const text = (response.choices[0]?.message?.content || '').trim();
    res.json({ recommendation: text, goalId: id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Dashboard: Business Health Score ──────────────────────
app.get('/api/dashboard/health-score', (_req, res) => {
  res.json({
    score: 87,
    grade: 'A-',
    breakdown: [
      { label: 'Revenue Health',    value: 92, color: '#0088ff' },
      { label: 'User Retention',    value: 91, color: '#00f0ff' },
      { label: 'AI Performance',    value: 97, color: '#00ffaa' },
      { label: 'Team Efficiency',   value: 84, color: '#8a2be2' },
      { label: 'Integration Score', value: 67, color: '#ffaa00' },
    ],
    trend: '+4 pts from last month',
    summary: 'Your business is performing well. Integration connectivity is the key area to improve.',
  });
});

// ── Proxy Image Download ──────────────────────────────────
app.get('/api/download', async (req, res) => {
  try {
    const targetUrl = req.query.url as string;
    const filename = (req.query.filename as string) || 'image.jpg';
    if (!targetUrl) return res.status(400).send('No URL provided');

    const imageRes = await fetch(targetUrl);
    if (!imageRes.ok) throw new Error('Failed to fetch image');

    res.setHeader('Content-Type', imageRes.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const buffer = await imageRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Download Proxy Error:', err);
    res.status(500).send('Download Error');
  }
});

// ── Serve client in production ────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✅ ORYN Server running on http://localhost:${PORT}`);
});
