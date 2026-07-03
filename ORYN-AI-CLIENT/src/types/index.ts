export type Page = 'chat' | 'dashboard' | 'analytics' | 'automation' | 'organization' | 'financials' | 'insights' | 'explore' | 'settings' | 'add-organization';

export interface Company {
  name: string;
  industry: string;
  foundedDate: string;
  location: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  teamId?: string;
  joinedDate: string;
  status: 'active' | 'on-leave' | 'remote';
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leadId?: string;
}

export interface FinancialEntry {
  id: string;
  type: 'revenue' | 'expense';
  category: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachedFiles?: { name: string; url?: string; isImage: boolean }[];
  tasks?: string[];
}

export interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: Date;
}

export interface SessionStats {
  messages: number;
  tasks: number;
  files: number;
}

export interface KPI {
  value: string;
  change: string;
  trend: 'up' | 'down';
}

export interface AnalyticsData {
  kpis: {
    revenue: KPI;
    users: KPI;
    tasks: KPI;
    retention: KPI;
  };
  usageTimeline: number[];
  months: string[];
  breakdown: { label: string; pct: number; color: string }[];
  team: { name: string; tasks: number; chats: number; score: number }[];
}

export interface ChatFeatures {
  voice: boolean;
  taskExtract: boolean;
  webSearch: boolean;
}

// ── New dashboard feature types ──────────────────────────

export interface CommandResult {
  answer: string;
  type: 'insight' | 'warning' | 'opportunity' | 'analysis';
  metric: string;
  action?: string | null;
}

export interface DashboardBriefing {
  headline: string;
  summary: string;
  highlight: string;
  mood: 'strong' | 'growing' | 'steady' | 'caution';
  tip: string;
}

export interface DashboardAlert {
  id: string;
  type: 'warning' | 'opportunity' | 'info' | 'critical';
  icon: string;
  title: string;
  detail: string;
  action: string;
  time: string;
}

export interface DashboardGoal {
  id: string;
  label: string;
  target: number;
  current: number;
  unit: string;
  color: string;
}

export interface HealthScore {
  score: number;
  grade: string;
  breakdown: { label: string; value: number; color: string }[];
  trend: string;
  summary: string;
}
