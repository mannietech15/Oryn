import {
  AnalyticsData,
  CommandResult,
  DashboardBriefing,
  AlertItem,
  GoalItem,
  HealthScore,
} from './dashboard.types';
import { InferenceService, defaultInferenceService } from '../inference/inference.service';
import { Logger } from '../../infrastructure/logging/logger';

const logger = new Logger('DashboardService');

export class DashboardService {
  private briefingCache: { data: DashboardBriefing; ts: number } | null = null;
  private readonly CACHE_TTL_MS = 3600_000; // 1 hour

  constructor(private inference: InferenceService = defaultInferenceService) {}

  getAnalytics(): AnalyticsData {
    return {
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
    };
  }

  async handleCommand(query: string, context?: string): Promise<CommandResult> {
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
      return await this.inference.generateJson<CommandResult>({
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: query },
        ],
      });
    } catch (err: any) {
      logger.warn('AI command completion failed, applying heuristic fallback', { error: err.message });
      const lc = query.toLowerCase();
      if (lc.includes('user') || lc.includes('churn')) {
        return {
          answer:
            'Three enterprise accounts have been inactive for 14+ days — representing ~22% of MRR at risk. Proactive re-engagement at this stage has a 60% recovery rate in B2B SaaS.',
          type: 'warning',
          metric: 'Active Users 1,842',
          action: 'Send a personalized re-engagement sequence to the 3 inactive accounts today.',
        };
      }
      if (lc.includes('retention')) {
        return {
          answer:
            'Retention at 91% is strong but the 4pt gap to your 95% goal is bridgeable. At-risk clients share one pattern: low feature adoption in month 2.',
          type: 'opportunity',
          metric: 'Retention 91%',
          action: 'Launch a guided onboarding campaign targeting customers in their second month.',
        };
      }
      if (lc.includes('opportunit')) {
        return {
          answer:
            'Today is Tuesday — your historically highest-converting sales day with 2.3× more deal closures. You have 2 enterprise deals in late-stage pipeline that could realistically close this week.',
          type: 'opportunity',
          metric: 'Pipeline — 2 Active Deals',
          action: 'Prioritize personal outreach to both enterprise prospects before 3pm today.',
        };
      }
      return {
        answer:
          'Revenue is at $284K MTD, up 18.4% — outpacing your quarterly target. AI task throughput is at a record high of 3,291 this month, driving measurable productivity gains across your team.',
        type: 'insight',
        metric: 'Revenue MTD $284K',
        action: 'Follow up personally with enterprise prospects to accelerate Q2 close.',
      };
    }
  }

  async getBriefing(): Promise<DashboardBriefing> {
    const now = Date.now();
    if (this.briefingCache && now - this.briefingCache.ts < this.CACHE_TTL_MS) {
      return this.briefingCache.data;
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
      const json = await this.inference.generateJson<DashboardBriefing>({
        messages: [{ role: 'user', content: prompt }],
      });
      this.briefingCache = { data: json, ts: now };
      return json;
    } catch (err: any) {
      logger.warn('AI briefing generation failed, using structured fallback', { error: err.message });
      const fallback: DashboardBriefing = {
        headline: 'Record AI Output — Revenue Up 18% MTD',
        summary:
          'Your business is performing exceptionally this month, with revenue at $284K representing an 18.4% increase over last month. AI task throughput hit a new monthly record at 3,291 completions and user retention remains strong at 91%.',
        highlight: '+18.4% MTD',
        mood: 'strong',
        tip: 'Today is Tuesday — your highest-converting sales day historically. Prioritize outreach to the 2 enterprise deals currently in late-stage pipeline to maximize close probability before end of week.',
      };
      this.briefingCache = { data: fallback, ts: now };
      return fallback;
    }
  }

  async getAlerts(): Promise<AlertItem[]> {
    const prompt = `You are ORYN's alert engine. Analyze this business snapshot and generate smart alerts:
- Revenue MTD: $284K (strong, +18.4%)
- Active users: 1,842 — but 3 enterprise accounts haven't logged in for 14 days
- Support tickets: up 40% in the last 2 hours (17 new tickets)
- AI Tasks: 3,291 completed — throughput 84%
- Retention: 91% — 2 clients flagged at-risk
- Zapier & Notion integrations disconnected
- Best sales day historically is Tuesday — today is Tuesday

Return a JSON object with a single key 'alerts' containing an array of exactly 5 alert objects:
{
  "alerts": [
    { "id": "1", "type": "warning|opportunity|info|critical", "icon": "emoji", "title": "short alert title", "detail": "one sentence detail", "action": "recommended action", "time": "relative time string like '5m ago'" }
  ]
}`;

    try {
      const json = await this.inference.generateJson<{ alerts: AlertItem[] }>({
        messages: [{ role: 'user', content: prompt }],
      });
      return json.alerts || [];
    } catch (err: any) {
      logger.warn('AI alert generation failed, using fallback alerts', { error: err.message });
      return [
        {
          id: '1',
          type: 'critical',
          icon: '🚨',
          title: '3 Enterprise Accounts Inactive 14+ Days',
          detail: 'Combined MRR risk of ~$18K if churned — accounts have been silent for 2 weeks.',
          action: 'Send personalized re-engagement email with exclusive offer',
          time: '12m ago',
        },
        {
          id: '2',
          type: 'warning',
          icon: '⚠️',
          title: 'Support Tickets Spiked +40% in 2 Hours',
          detail: '17 new tickets opened rapidly — potential product or infrastructure issue emerging.',
          action: 'Audit ticket themes and escalate to engineering if pattern confirmed',
          time: '1h ago',
        },
        {
          id: '3',
          type: 'opportunity',
          icon: '💡',
          title: 'Tuesday = Your Best Sales Day',
          detail: 'Historical data shows 2.3× more deal closures on Tuesdays vs. any other weekday.',
          action: 'Schedule outreach calls and live demos for this afternoon',
          time: '2h ago',
        },
        {
          id: '4',
          type: 'warning',
          icon: '🔌',
          title: 'Notion & Zapier Integrations Offline',
          detail: 'Both disconnected — automated workflows including follow-up sequences may be silently failing.',
          action: 'Reconnect both integrations via the Integrations panel now',
          time: '3h ago',
        },
        {
          id: '5',
          type: 'info',
          icon: '🎯',
          title: '2 Clients Flagged At-Risk by AI Model',
          detail: 'Engagement scores dropped below threshold — churn probability above 65% for both accounts.',
          action: 'Schedule Quarterly Business Reviews within 5 business days',
          time: '4h ago',
        },
      ];
    }
  }

  getGoals(): GoalItem[] {
    return [
      { id: 'rev', label: 'Q2 Revenue Target', target: 500000, current: 284000, unit: '$', color: '#0088ff' },
      { id: 'users', label: 'Active User Growth', target: 3000, current: 1842, unit: '', color: '#00f0ff' },
      { id: 'ret', label: 'Retention Rate Goal', target: 95, current: 91, unit: '%', color: '#00ffaa' },
      { id: 'tasks', label: 'AI Tasks Milestone', target: 5000, current: 3291, unit: '', color: '#8a2be2' },
    ];
  }

  async getGoalRecommendation(id: string): Promise<{ recommendation: string } | null> {
    const goals: Record<string, { label: string; target: string; current: string }> = {
      rev: { label: 'Q2 Revenue Target', target: '$500K', current: '$284K (57% achieved)' },
      users: { label: 'Active User Growth', target: '3,000 users', current: '1,842 users (61%)' },
      ret: { label: 'Retention Rate Goal', target: '95%', current: '91% (4pts gap)' },
      tasks: { label: 'AI Tasks Milestone', target: '5,000 tasks', current: '3,291 tasks (66%)' },
    };
    const goal = goals[id];
    if (!goal) return null;

    const prompt = `You are ORYN, an elite business strategist. The user is asking for advice on how to hit their business goal.
Goal: ${goal.label}
Target: ${goal.target}
Current: ${goal.current}

Provide a 2-3 sentence strategic recommendation on what they should do next. Respond ONLY with a JSON object:
{ "recommendation": "your advice here" }`;

    return await this.inference.generateJson<{ recommendation: string }>({
      messages: [{ role: 'user', content: prompt }],
    });
  }

  getHealthScore(): HealthScore {
    return {
      score: 87,
      grade: 'A-',
      breakdown: [
        { label: 'Revenue Health', value: 92, color: '#0088ff' },
        { label: 'User Retention', value: 91, color: '#00f0ff' },
        { label: 'AI Performance', value: 97, color: '#00ffaa' },
        { label: 'Team Efficiency', value: 84, color: '#8a2be2' },
        { label: 'Integration Score', value: 67, color: '#ffaa00' },
      ],
      trend: '+4 pts from last month',
      summary: 'Your business is performing well. Integration connectivity is the key area to improve.',
    };
  }
}

export const defaultDashboardService = new DashboardService();
