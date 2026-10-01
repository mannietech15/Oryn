import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import fs from 'fs';
import { Datastore } from '../../src/infrastructure/storage/datastore';

describe('Datastore', () => {
  const testDbPath = path.resolve(__dirname, '../../data/test-oryn-db.json');

  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  const datastore = new Datastore(testDbPath);

  it('should initialize default state with financial entries, workflows, and org', () => {
    const entries = datastore.getFinancialEntries();
    assert.ok(Array.isArray(entries));
    assert.ok(entries.length > 0);

    const workflows = datastore.getWorkflows();
    assert.ok(Array.isArray(workflows));
    assert.strictEqual(workflows.length, 3);

    const org = datastore.getOrganization();
    assert.ok(org.company);
    assert.strictEqual(org.company.name, 'Oryn AI Corp');
  });

  it('should calculate accurate financial metrics from ledger', () => {
    const metrics = datastore.getFinancialMetrics();
    assert.strictEqual(typeof metrics.totalRevenue, 'number');
    assert.strictEqual(typeof metrics.totalExpenses, 'number');
    assert.strictEqual(typeof metrics.netProfit, 'number');
    assert.strictEqual(metrics.netProfit, metrics.totalRevenue - metrics.totalExpenses);
  });

  it('should add new financial entries and update metrics dynamically', () => {
    const prevMetrics = datastore.getFinancialMetrics();
    datastore.addFinancialEntry({
      type: 'revenue',
      category: 'New Enterprise Deal',
      amount: 50000,
      date: '2026-10-01',
      note: 'Verified payment confirmation'
    });

    const newMetrics = datastore.getFinancialMetrics();
    assert.strictEqual(newMetrics.totalRevenue, prevMetrics.totalRevenue + 50000);
  });

  it('should log AI task telemetry and compute average latency and count', () => {
    datastore.logTask({
      type: 'chat',
      model: 'meta/llama-3.2-11b-vision-instruct',
      latencyMs: 150,
      tokensUsed: 100,
      status: 'success'
    });

    const metrics = datastore.getTaskMetrics();
    assert.ok(metrics.totalCount > 0);
    assert.ok(metrics.avgLatencyMs > 0);
  });

  it('should toggle workflow status and log workflow execution', () => {
    const wf = datastore.getWorkflows()[0];
    const initialStatus = wf.status;
    const toggled = datastore.updateWorkflow(wf.id, {
      status: initialStatus === 'active' ? 'paused' : 'active'
    });
    assert.notStrictEqual(toggled?.status, initialStatus);

    const execLog = datastore.logWorkflowExecution({
      workflowId: wf.id,
      workflowName: wf.name,
      trigger: 'Test Runner',
      durationMs: 90,
      status: 'success',
      stepsCompleted: 3,
      totalSteps: 3,
      error: null
    });

    assert.strictEqual(execLog.status, 'success');
    const logs = datastore.getWorkflowExecutionLogs(5);
    assert.ok(logs.some(l => l.id === execLog.id));
  });

  it('cleanup test database file', () => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });
});
