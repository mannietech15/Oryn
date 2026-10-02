import fs from 'fs';
import path from 'path';
import { Logger } from '../logging/logger';

const logger = new Logger('Datastore');

export interface FinancialEntryRecord {
  id: string;
  type: 'revenue' | 'expense';
  category: string;
  amount: number;
  date: string;
  note: string;
  createdAt: string;
}

export interface AiTaskRecord {
  id: string;
  type: 'chat' | 'analysis' | 'command' | 'automation';
  model: string;
  latencyMs: number;
  tokensUsed: number;
  status: 'success' | 'failure';
  timestamp: string;
}

export interface WorkflowRecord {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'disabled';
  trigger: string;
  steps: string[];
  createdAt: string;
  lastRunAt: string | null;
  nextRunAt: string | null;
  runCount: number;
  successCount: number;
  failureCount: number;
}

export interface WorkflowExecutionLogRecord {
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

export interface DocumentRecord {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  tags: string[];
  aiSummary: string;
}

export interface EmailLogRecord {
  id: string;
  to: string;
  subject: string;
  body: string;
  status: 'draft' | 'awaiting_approval' | 'sent' | 'failed';
  messageId: string | null;
  error: string | null;
  createdAt: string;
  sentAt: string | null;
}

export interface CompanyRecord {
  name: string;
  industry: string;
  foundedDate: string;
  location: string;
}

export interface EmployeeRecord {
  id: string;
  name: string;
  role: string;
  email: string;
  status: string;
  joinedDate: string;
}

export interface TeamRecord {
  id: string;
  name: string;
  description: string;
}

export interface OrganizationRecord {
  company: CompanyRecord;
  employees: EmployeeRecord[];
  teams: TeamRecord[];
}

export interface CalendarEventRecord {
  id: string;
  title: string;
  time: string;
  type: 'internal' | 'external' | 'automation';
  attendees: string[];
  aiBrief: string;
  createdAt: string;
}

export interface EcosystemCommunityRecord {
  id: string;
  name: string;
  members: string;
  memberCount: number;
  tags: string[];
  description: string;
  icon: string;
  joined: boolean;
}

export interface EcosystemBusinessRecord {
  id: string;
  name: string;
  industry: string;
  location: string;
  product: string;
  matchType: 'same' | 'complementary';
  connected: boolean;
}

export interface EcosystemTrendRecord {
  id: string;
  topic: string;
  growth: string;
  category: string;
  sentiment: 'positive' | 'neutral';
}

export interface CaseStudyRecord {
  id: string;
  company: string;
  result: string;
  summary: string;
  image: string;
}

export interface DatabaseSchema {
  financialEntries: FinancialEntryRecord[];
  aiTaskLogs: AiTaskRecord[];
  workflows: WorkflowRecord[];
  workflowExecutionLogs: WorkflowExecutionLogRecord[];
  documents: DocumentRecord[];
  emailLogs: EmailLogRecord[];
  calendarEvents: CalendarEventRecord[];
  organization: OrganizationRecord;
  ecosystemCommunities: EcosystemCommunityRecord[];
  ecosystemBusinesses: EcosystemBusinessRecord[];
  ecosystemTrends: EcosystemTrendRecord[];
  caseStudies: CaseStudyRecord[];
}

export class Datastore {
  private dbPath: string;
  private cache: DatabaseSchema | null = null;

  constructor(customPath?: string) {
    this.dbPath = customPath || path.resolve(__dirname, '../../../data/oryn-db.json');
    this.ensureDatabase();
  }

  private getDefaultData(): DatabaseSchema {
    return {
      financialEntries: [
        { id: 'f-1', type: 'revenue', category: 'Enterprise Subscriptions', amount: 4200, date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], note: 'Monthly Stripe recurring subscription tranche', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
        { id: 'f-2', type: 'revenue', category: 'API Usage & Tokens', amount: 2150, date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], note: 'Metered token consumption overages', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
        { id: 'f-3', type: 'expense', category: 'Cloud Infrastructure & GPU', amount: 2450, date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0], note: 'NVIDIA NIM compute cluster & AWS relays', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
        { id: 'f-4', type: 'expense', category: 'Operational Engineering', amount: 1650, date: new Date(Date.now() - 86400000 * 12).toISOString().split('T')[0], note: 'Observability & third-party API licensing', createdAt: new Date(Date.now() - 86400000 * 12).toISOString() },
      ],
      aiTaskLogs: [
        { id: 'task-init-1', type: 'chat', model: 'meta/llama-3.2-11b-vision-instruct', latencyMs: 245, tokensUsed: 420, status: 'success', timestamp: new Date(Date.now() - 600000).toISOString() },
        { id: 'task-init-2', type: 'analysis', model: 'meta/llama-3.2-90b-vision-instruct', latencyMs: 512, tokensUsed: 890, status: 'success', timestamp: new Date(Date.now() - 300000).toISOString() },
        { id: 'task-init-3', type: 'command', model: 'meta/llama-3.2-11b-vision-instruct', latencyMs: 182, tokensUsed: 210, status: 'success', timestamp: new Date(Date.now() - 60000).toISOString() }
      ],
      workflows: [
        {
          id: 'wf-1',
          name: 'Weekly Executive Revenue Briefing',
          description: 'Aggregates Stripe transactions, runs inference synthesis with Llama 3.2, and dispatches an executive brief.',
          status: 'active',
          trigger: 'Every Friday at 17:00 UTC',
          steps: ['Stripe Ingestion', 'Inference Synthesis', 'Executive Report', 'SMTP Relay'],
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          lastRunAt: new Date(Date.now() - 86400000 * 6).toISOString(),
          nextRunAt: new Date(Date.now() + 86400000 * 1).toISOString(),
          runCount: 24,
          successCount: 24,
          failureCount: 0
        },
        {
          id: 'wf-2',
          name: 'Stripe Churn Risk Detection & Escrow',
          description: 'Monitors recurring subscription webhooks for failure signals and drafts retention actions.',
          status: 'active',
          trigger: 'Webhook Event: invoice.payment_failed',
          steps: ['Webhook Listener', 'Account Health Check', 'Draft Retention Action', 'Admin Notification'],
          createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
          lastRunAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          nextRunAt: null,
          runCount: 142,
          successCount: 140,
          failureCount: 2
        },
        {
          id: 'wf-3',
          name: 'High Latency Anomaly Alerting',
          description: 'Samples inference gateway latency metrics every 5 minutes and flags telemetry drift.',
          status: 'active',
          trigger: 'Cron: */5 * * * *',
          steps: ['Gateway Probe', 'Statistical Variance Check', 'PagerDuty Dispatch'],
          createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          lastRunAt: new Date(Date.now() - 180000).toISOString(),
          nextRunAt: new Date(Date.now() + 120000).toISOString(),
          runCount: 1120,
          successCount: 1118,
          failureCount: 2
        }
      ],
      workflowExecutionLogs: [
        {
          id: 'exec-1',
          workflowId: 'wf-1',
          workflowName: 'Weekly Executive Revenue Briefing',
          trigger: 'Cron Schedule (17:00 UTC)',
          durationMs: 420,
          status: 'success',
          executedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
          stepsCompleted: 4,
          totalSteps: 4,
          error: null
        },
        {
          id: 'exec-2',
          workflowId: 'wf-2',
          workflowName: 'Stripe Churn Risk Detection & Escrow',
          trigger: 'Webhook invoice.payment_failed',
          durationMs: 184,
          status: 'success',
          executedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          stepsCompleted: 4,
          totalSteps: 4,
          error: null
        },
        {
          id: 'exec-3',
          workflowId: 'wf-3',
          workflowName: 'High Latency Anomaly Alerting',
          trigger: 'Cron */5 * * * *',
          durationMs: 95,
          status: 'success',
          executedAt: new Date(Date.now() - 180000).toISOString(),
          stepsCompleted: 3,
          totalSteps: 3,
          error: null
        }
      ],
      documents: [
        {
          id: 'doc-1',
          name: 'Q3_Financial_Performance.pdf',
          type: 'PDF',
          size: '2.4 MB',
          date: new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          tags: ['Finance', 'Ledger'],
          aiSummary: 'Fiscal overview confirming $6.4K revenue baseline with steady recurring expansion across active client tiers.'
        }
      ],
      emailLogs: [],
      calendarEvents: [
        {
          id: 'cal-1',
          title: 'Infrastructure & Inference Architecture Sync',
          time: '10:00 AM - 10:45 AM',
          type: 'internal',
          attendees: ['Alex Chen', 'Jordan Lee'],
          aiBrief: 'Review latency metrics on NVIDIA NIM Llama 3.2 gateway and evaluate fallback routing behavior.',
          createdAt: new Date().toISOString()
        },
        {
          id: 'cal-2',
          title: 'Weekly Executive Sales Synthesis Pipeline',
          time: '17:00 UTC - Dispatch',
          type: 'automation',
          attendees: ['Workflow Daemon', 'Custom SMTP Relay'],
          aiBrief: 'Autonomous aggregation of Stripe transactions and dispatch to executive leadership.',
          createdAt: new Date().toISOString()
        },
        {
          id: 'cal-3',
          title: 'Fiscal Ledger Audit & Reconciliation',
          time: '3:00 PM - 3:30 PM',
          type: 'internal',
          attendees: ['Sarah Miller', 'Operations Team'],
          aiBrief: 'Audit newly posted entries in Fiscal Ledger and verify margin thresholds.',
          createdAt: new Date().toISOString()
        }
      ],
      organization: {
        company: {
          name: 'Oryn AI Corp',
          industry: 'Enterprise AI & Workflow Systems',
          foundedDate: '2025-01-15',
          location: 'San Francisco, CA'
        },
        employees: [
          { id: 'emp-1', name: 'Alex Chen', role: 'Principal Architect', email: 'alex@oryn.ai', status: 'active', joinedDate: '2025-01-20' },
          { id: 'emp-2', name: 'Jordan Lee', role: 'Staff Systems Engineer', email: 'jordan@oryn.ai', status: 'active', joinedDate: '2025-02-01' },
          { id: 'emp-3', name: 'Sarah Miller', role: 'Operations Lead', email: 'sarah@oryn.ai', status: 'active', joinedDate: '2025-02-15' },
        ],
        teams: [
          { id: 't1', name: 'Inference & Core Engineering', description: 'Core LLM routing, latency optimization, and streaming infrastructure.' },
          { id: 't2', name: 'Enterprise Workflow Systems', description: 'Background job queues, event webhooks, and third-party integrations.' },
        ]
      },
      ecosystemCommunities: [
        { id: '1', name: 'AI SaaS Builders', members: '12.4k', memberCount: 12400, tags: ['AI', 'SaaS', 'Dev'], description: 'A community for founders building the next generation of AI-native SaaS.', icon: '🤖', joined: false },
        { id: '2', name: 'Growth Hackers Hub', members: '8.2k', memberCount: 8200, tags: ['Marketing', 'B2B'], description: 'Strategies and tools for hyper-growth in the enterprise space.', icon: '🚀', joined: false },
        { id: '3', name: 'Sustainable Fintech', members: '5.1k', memberCount: 5100, tags: ['Finance', 'ESG'], description: 'Ethical finance and green technology innovators.', icon: '🌿', joined: false },
      ],
      ecosystemBusinesses: [
        { id: '1', name: 'Nexus Logistics', industry: 'Supply Chain', location: 'Berlin', product: 'Cloud Fleet Mgmt', matchType: 'same', connected: false },
        { id: '2', name: 'EcoPack Solutions', industry: 'Packaging', location: 'Denver', product: 'Bio-degradable Materials', matchType: 'complementary', connected: false },
        { id: '3', name: 'Zenith CRM', industry: 'Software', location: 'Austin', product: 'Enterprise CRM', matchType: 'same', connected: false },
        { id: '4', name: 'SwiftPay Systems', industry: 'Fintech', location: 'London', product: 'B2B Payments', matchType: 'complementary', connected: false },
        { id: '5', name: 'Quantum Core', industry: 'Computing', location: 'San Francisco', product: 'Quantum Processors', matchType: 'same', connected: false },
        { id: '6', name: 'Atlas Biotech', industry: 'Healthcare', location: 'Boston', product: 'Gene Therapy Kits', matchType: 'complementary', connected: false },
        { id: '7', name: 'Silverline Robotics', industry: 'Manufacturing', location: 'Tokyo', product: 'Industrial Arms', matchType: 'same', connected: false },
        { id: '8', name: 'Nova Energy', industry: 'Renewables', location: 'Oslo', product: 'Fusion Modules', matchType: 'complementary', connected: false },
      ],
      ecosystemTrends: [
        { id: '1', topic: 'Generative Supply Chains', growth: '+142%', category: 'AI/Logistics', sentiment: 'positive' },
        { id: '2', topic: 'Decentralized Workforce', growth: '+24%', category: 'HR Tech', sentiment: 'neutral' },
        { id: '3', topic: 'Hyper-Personalized CRM', growth: '+89%', category: 'SaaS', sentiment: 'positive' },
      ],
      caseStudies: [
        { id: '1', company: 'CloudScale Inc.', result: '320% Revenue growth', summary: 'Implemented ORYN-AI to automate decision-making across 4 global offices.', image: '🏢' },
        { id: '2', company: 'Velocity Retail', result: '45% Cost Reduction', summary: 'Optimized inventory using our predictive analytics engine.', image: '🛒' },
      ]
    };
  }

  private ensureDatabase(): void {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (!fs.existsSync(this.dbPath)) {
        const defaultData = this.getDefaultData();
        fs.writeFileSync(this.dbPath, JSON.stringify(defaultData, null, 2), 'utf-8');
        this.cache = defaultData;
        logger.info('Initialized local persistent database', { path: this.dbPath });
      } else {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        this.cache = JSON.parse(raw);
        if (this.cache && !this.cache.calendarEvents) {
          this.cache.calendarEvents = this.getDefaultData().calendarEvents;
          this.save();
        }
        if (this.cache && !this.cache.ecosystemCommunities) {
          const defaults = this.getDefaultData();
          this.cache.ecosystemCommunities = defaults.ecosystemCommunities;
          this.cache.ecosystemBusinesses = defaults.ecosystemBusinesses;
          this.cache.ecosystemTrends = defaults.ecosystemTrends;
          this.cache.caseStudies = defaults.caseStudies;
          this.save();
        }
        logger.info('Loaded persistent database', { path: this.dbPath });
      }
    } catch (err: any) {
      logger.error('Failed to initialize database, falling back to memory', { error: err.message });
      this.cache = this.getDefaultData();
    }
  }

  private save(): void {
    if (!this.cache) return;
    try {
      const tempPath = `${this.dbPath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.cache, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.dbPath);
    } catch (err: any) {
      logger.error('Failed to persist database to disk', { error: err.message });
    }
  }

  // --- Financial Ledger ---
  getFinancialEntries(): FinancialEntryRecord[] {
    return this.cache?.financialEntries || [];
  }

  addFinancialEntry(entry: Omit<FinancialEntryRecord, 'id' | 'createdAt'>): FinancialEntryRecord {
    const newRecord: FinancialEntryRecord = {
      ...entry,
      id: `f-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    if (!this.cache) this.cache = this.getDefaultData();
    this.cache.financialEntries.unshift(newRecord);
    this.save();
    return newRecord;
  }

  getFinancialMetrics() {
    const entries = this.getFinancialEntries();
    let totalRevenue = 0;
    let totalExpenses = 0;

    for (const e of entries) {
      if (e.type === 'revenue') totalRevenue += e.amount;
      else totalExpenses += e.amount;
    }

    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      margin: Number(margin.toFixed(1)),
      entryCount: entries.length,
      lastUpdated: entries.length > 0 ? entries[0].createdAt : null
    };
  }

  // --- AI Task Ingestion Telemetry ---
  logTask(task: Omit<AiTaskRecord, 'id' | 'timestamp'>): AiTaskRecord {
    const record: AiTaskRecord = {
      ...task,
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    if (!this.cache) this.cache = this.getDefaultData();
    this.cache.aiTaskLogs.unshift(record);
    if (this.cache.aiTaskLogs.length > 500) {
      this.cache.aiTaskLogs = this.cache.aiTaskLogs.slice(0, 500);
    }
    this.save();
    return record;
  }

  getTaskLogs(limit: number = 50): AiTaskRecord[] {
    return (this.cache?.aiTaskLogs || []).slice(0, limit);
  }

  getTaskMetrics() {
    const logs = this.cache?.aiTaskLogs || [];
    const totalCount = logs.length;
    const successCount = logs.filter(l => l.status === 'success').length;
    const avgLatency = totalCount > 0
      ? Math.round(logs.reduce((acc, l) => acc + l.latencyMs, 0) / totalCount)
      : 0;
    const totalTokens = logs.reduce((acc, l) => acc + l.tokensUsed, 0);

    return {
      totalCount,
      successCount,
      successRate: totalCount > 0 ? Number(((successCount / totalCount) * 100).toFixed(1)) : 100,
      avgLatencyMs: avgLatency,
      totalTokens,
      lastTaskAt: logs.length > 0 ? logs[0].timestamp : null
    };
  }

  // --- Workflows ---
  getWorkflows(): WorkflowRecord[] {
    return this.cache?.workflows || [];
  }

  getWorkflow(id: string): WorkflowRecord | undefined {
    return this.cache?.workflows.find(w => w.id === id);
  }

  updateWorkflow(id: string, patch: Partial<WorkflowRecord>): WorkflowRecord | null {
    if (!this.cache) return null;
    const idx = this.cache.workflows.findIndex(w => w.id === id);
    if (idx === -1) return null;
    this.cache.workflows[idx] = { ...this.cache.workflows[idx], ...patch };
    this.save();
    return this.cache.workflows[idx];
  }

  logWorkflowExecution(log: Omit<WorkflowExecutionLogRecord, 'id' | 'executedAt'>): WorkflowExecutionLogRecord {
    const record: WorkflowExecutionLogRecord = {
      ...log,
      id: `exec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      executedAt: new Date().toISOString()
    };
    if (!this.cache) this.cache = this.getDefaultData();
    this.cache.workflowExecutionLogs.unshift(record);
    if (this.cache.workflowExecutionLogs.length > 200) {
      this.cache.workflowExecutionLogs = this.cache.workflowExecutionLogs.slice(0, 200);
    }

    // Update workflow stats
    const wf = this.cache.workflows.find(w => w.id === log.workflowId);
    if (wf) {
      wf.runCount += 1;
      wf.lastRunAt = record.executedAt;
      if (log.status === 'success') wf.successCount += 1;
      else wf.failureCount += 1;
    }

    this.save();
    return record;
  }

  getWorkflowExecutionLogs(limit: number = 30): WorkflowExecutionLogRecord[] {
    return (this.cache?.workflowExecutionLogs || []).slice(0, limit);
  }

  getWorkflowStats() {
    const workflows = this.getWorkflows();
    const activeCount = workflows.filter(w => w.status === 'active').length;
    const logs = this.getWorkflowExecutionLogs(100);
    const totalExecutions = workflows.reduce((acc, w) => acc + w.runCount, 0);
    const totalSuccess = workflows.reduce((acc, w) => acc + w.successCount, 0);
    const successRate = totalExecutions > 0 ? Number(((totalSuccess / totalExecutions) * 100).toFixed(1)) : 100;

    return {
      totalWorkflows: workflows.length,
      activeWorkflows: activeCount,
      totalExecutions,
      successRate,
      recentLogsCount: logs.length
    };
  }

  // --- Documents ---
  getDocuments(): DocumentRecord[] {
    return this.cache?.documents || [];
  }

  addDocument(doc: Omit<DocumentRecord, 'id' | 'date'>): DocumentRecord {
    const record: DocumentRecord = {
      ...doc,
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    if (!this.cache) this.cache = this.getDefaultData();
    this.cache.documents.unshift(record);
    this.save();
    return record;
  }

  deleteDocument(id: string): boolean {
    if (!this.cache || !this.cache.documents) return false;
    const initialLen = this.cache.documents.length;
    this.cache.documents = this.cache.documents.filter(d => d.id !== id);
    if (this.cache.documents.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Email Logs (Human in the loop) ---
  stageEmailDraft(to: string, subject: string, body: string): EmailLogRecord {
    const record: EmailLogRecord = {
      id: `draft-${Date.now()}`,
      to,
      subject,
      body,
      status: 'awaiting_approval',
      messageId: null,
      error: null,
      createdAt: new Date().toISOString(),
      sentAt: null
    };
    if (!this.cache) this.cache = this.getDefaultData();
    this.cache.emailLogs.unshift(record);
    this.save();
    return record;
  }

  updateEmailRecord(id: string, patch: Partial<EmailLogRecord>): EmailLogRecord | null {
    if (!this.cache) return null;
    const item = this.cache.emailLogs.find(e => e.id === id);
    if (!item) return null;
    Object.assign(item, patch);
    this.save();
    return item;
  }

  getEmailLogs(limit: number = 20): EmailLogRecord[] {
    return (this.cache?.emailLogs || []).slice(0, limit);
  }

  // --- Calendar Events ---
  getCalendarEvents(): CalendarEventRecord[] {
    return this.cache?.calendarEvents || [];
  }

  addCalendarEvent(event: Omit<CalendarEventRecord, 'id' | 'createdAt'>): CalendarEventRecord {
    const record: CalendarEventRecord = {
      ...event,
      id: `cal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    if (!this.cache) this.cache = this.getDefaultData();
    if (!this.cache.calendarEvents) this.cache.calendarEvents = [];
    this.cache.calendarEvents.unshift(record);
    this.save();
    return record;
  }

  deleteCalendarEvent(id: string): boolean {
    if (!this.cache || !this.cache.calendarEvents) return false;
    const initialLen = this.cache.calendarEvents.length;
    this.cache.calendarEvents = this.cache.calendarEvents.filter(e => e.id !== id);
    if (this.cache.calendarEvents.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Organization ---
  getOrganization(): OrganizationRecord {
    return this.cache?.organization || this.getDefaultData().organization;
  }

  updateOrganization(org: Partial<OrganizationRecord>): OrganizationRecord {
    if (!this.cache) this.cache = this.getDefaultData();
    this.cache.organization = { ...this.cache.organization, ...org };
    this.save();
    return this.cache.organization;
  }

  // --- Ecosystem ---
  getEcosystemData() {
    if (!this.cache) this.cache = this.getDefaultData();
    return {
      communities: this.cache.ecosystemCommunities || [],
      businesses: this.cache.ecosystemBusinesses || [],
      trends: this.cache.ecosystemTrends || [],
      caseStudies: this.cache.caseStudies || []
    };
  }

  toggleCommunityJoin(id: string): EcosystemCommunityRecord | null {
    if (!this.cache) this.cache = this.getDefaultData();
    if (!this.cache.ecosystemCommunities) this.cache.ecosystemCommunities = this.getDefaultData().ecosystemCommunities;
    const comm = this.cache.ecosystemCommunities.find(c => c.id === id);
    if (!comm) return null;
    comm.joined = !comm.joined;
    comm.memberCount = comm.joined ? comm.memberCount + 1 : Math.max(1, comm.memberCount - 1);
    comm.members = comm.memberCount >= 1000 ? `${(comm.memberCount / 1000).toFixed(1)}k` : `${comm.memberCount}`;
    this.save();
    return comm;
  }

  toggleBusinessConnect(id: string): EcosystemBusinessRecord | null {
    if (!this.cache) this.cache = this.getDefaultData();
    if (!this.cache.ecosystemBusinesses) this.cache.ecosystemBusinesses = this.getDefaultData().ecosystemBusinesses;
    const biz = this.cache.ecosystemBusinesses.find(b => b.id === id);
    if (!biz) return null;
    biz.connected = !biz.connected;
    this.save();
    return biz;
  }

  addCommunity(community: { name: string; description: string; tags: string[]; icon?: string }): EcosystemCommunityRecord {
    if (!this.cache) this.cache = this.getDefaultData();
    if (!this.cache.ecosystemCommunities) this.cache.ecosystemCommunities = [];
    const newComm: EcosystemCommunityRecord = {
      id: `comm-${Date.now()}`,
      name: community.name,
      description: community.description,
      tags: community.tags || ['Ecosystem'],
      icon: community.icon || '🌐',
      members: '1',
      memberCount: 1,
      joined: true
    };
    this.cache.ecosystemCommunities.unshift(newComm);
    this.save();
    return newComm;
  }
}

export const defaultDatastore = new Datastore();
