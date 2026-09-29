export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequestBody {
  messages: ChatMessage[];
  webSearch?: boolean;
  taskExtract?: boolean;
  model?: string;
  language?: string;
}

export interface DashboardCommandBody {
  query: string;
  context?: string;
}

export interface EmailRequestBody {
  to: string | string[];
  subject?: string;
  body?: string;
  message?: string;
  content?: string;
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
}
