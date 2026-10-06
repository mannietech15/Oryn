export interface MetricKpi {
  value: string;
  change: string;
  trend: 'up' | 'down';
}

export interface AnalyticsData {
  kpis: {
    revenue: MetricKpi;
    users: MetricKpi;
    tasks: MetricKpi;
    retention: MetricKpi;
  };
  usageTimeline: number[];
  months: string[];
  breakdown: Array<{ label: string; pct: number; color: string }>;
  team: Array<{ name: string; tasks: number; chats: number; score: number }>;
}

export interface CommandResult {
  answer: string;
  type: 'insight' | 'warning' | 'opportunity' | 'analysis';
  metric: string;
  action?: string;
}

export interface DashboardBriefing {
  headline: string;
  summary: string;
  highlight: string;
  mood: 'strong' | 'growing' | 'steady' | 'caution';
  tip: string;
}

export interface AlertItem {
  id: string;
  type: 'warning' | 'opportunity' | 'info' | 'critical';
  icon: string;
  title: string;
  detail: string;
  action: string;
  time: string;
}

export interface GoalItem {
  id: string;
  label: string;
  target: number;
  current: number;
  unit: string;
  color: string;
  completed?: boolean;
}

export interface HealthScore {
  score: number;
  grade: string;
  breakdown: Array<{ label: string; value: number; color: string }>;
  trend: string;
  summary: string;
}

export interface ForecastPeriod {
  period: string;
  projectedRevenue: number;
  lowerBound: number;
  upperBound: number;
}

export interface AnalyticsForecast {
  historical: Array<{ month: string; revenue: number }>;
  forecast: ForecastPeriod[];
  slope: number;
  growthRatePct: number;
  confidencePct: number;
  summary: string;
}
