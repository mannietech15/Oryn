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
      financialEntries: [],
      aiTaskLogs: [],
      workflows: [],
      workflowExecutionLogs: [],
      documents: [],
      emailLogs: [],
      calendarEvents: [],
      organization: {
        company: {
          name: "Oryn AI Global Enterprise",
          industry: "Enterprise Autonomous Intelligence",
          foundedDate: "2025-01-15",
          location: "San Francisco, CA & London, UK"
        },
        employees: [],
        teams: []
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

  addWorkflow(wf: Omit<WorkflowRecord, 'id' | 'createdAt' | 'runCount' | 'successCount' | 'failureCount'> & Partial<Pick<WorkflowRecord, 'runCount' | 'successCount' | 'failureCount'>>): WorkflowRecord {
    const record: WorkflowRecord = {
      id: `wf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      runCount: 0,
      successCount: 0,
      failureCount: 0,
      ...wf,
    };
    if (!this.cache) this.cache = this.getDefaultData();
    this.cache.workflows.unshift(record);
    this.save();
    return record;
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

  addDocument(doc: Omit<DocumentRecord, 'id' | 'date'> & Partial<Pick<DocumentRecord, 'id' | 'date'>>): DocumentRecord {
    const record: DocumentRecord = {
      ...doc,
      id: doc.id || `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: doc.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    if (!this.cache) this.cache = this.getDefaultData();
    this.cache.documents.unshift(record);
    this.save();
    return record;
  }

  getDocument(id: string): DocumentRecord | undefined {
    return this.cache?.documents.find(d => d.id === id);
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

  getEmailDraft(id: string): EmailLogRecord | null {
    if (!this.cache) return null;
    return this.cache.emailLogs.find(e => e.id === id) || null;
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
