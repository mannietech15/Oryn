import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AutomationService } from '../../src/modules/automation/automation.service';

describe('AutomationService Pipeline & Execution Suite', () => {
  const automationService = new AutomationService();
  const testOrgId = 'org_oryn_global_001';

  it('should retrieve registered workflows with pipeline step definitions', async () => {
    const res = await automationService.getWorkflows(testOrgId);
    assert.ok(res);
    assert.ok(Array.isArray(res.workflows));
    assert.ok(res.workflows.length > 0);
    assert.ok(res.stats);
    assert.strictEqual(typeof res.stats.totalWorkflows, 'number');
    assert.strictEqual(typeof res.stats.totalExecutions, 'number');
    assert.strictEqual(typeof res.stats.successRate, 'number');

    const firstWf = res.workflows[0];
    assert.ok(firstWf.id);
    assert.ok(firstWf.name);
    assert.ok(Array.isArray(firstWf.steps));
    assert.ok(['active', 'paused'].includes(firstWf.status));
  });

  it('should toggle workflow status between active and paused', async () => {
    const listRes = await automationService.getWorkflows(testOrgId);
    const targetWf = listRes.workflows[0];
    assert.ok(targetWf);

    const initialStatus = targetWf.status;
    const toggled = await automationService.toggleWorkflow(targetWf.id, testOrgId);
    assert.ok(toggled);
    assert.notStrictEqual(toggled.status, initialStatus);

    // Toggle back to preserve original operational state
    const reverted = await automationService.toggleWorkflow(targetWf.id, testOrgId);
    assert.ok(reverted);
    assert.strictEqual(reverted.status, initialStatus);
  });

  it('should execute workflow pipeline and record real elapsed execution duration', async () => {
    const listRes = await automationService.getWorkflows(testOrgId);
    const targetWf = listRes.workflows[0];

    const runResult = await automationService.runWorkflow(targetWf.id, testOrgId);
    assert.ok(runResult);
    assert.strictEqual(runResult.success, true);
    assert.ok(runResult.execution);
    assert.strictEqual(runResult.execution.workflowId, targetWf.id);
    assert.strictEqual(runResult.execution.status, 'success');
    assert.ok(runResult.execution.durationMs >= 1);
    assert.strictEqual(typeof runResult.execution.durationMs, 'number');
    assert.ok(runResult.message.includes('executed successfully'));
  });

  it('should record execution audit logs and retrieve recent logs with limit', async () => {
    const logs = await automationService.getLogs(testOrgId, 10);
    assert.ok(Array.isArray(logs));
    assert.ok(logs.length > 0);

    const latest = logs[0];
    assert.ok(latest.id);
    assert.ok(latest.workflowName);
    assert.ok(latest.trigger);
    assert.ok(latest.executedAt);
    assert.strictEqual(typeof latest.durationMs, 'number');
  });

  it('should calculate accurate workflow reliability and stats aggregate', async () => {
    const stats = await automationService.getWorkflowStats(testOrgId);
    assert.ok(stats);
    assert.strictEqual(typeof stats.totalWorkflows, 'number');
    assert.strictEqual(typeof stats.activeWorkflows, 'number');
    assert.strictEqual(typeof stats.totalExecutions, 'number');
    assert.strictEqual(typeof stats.successRate, 'number');
    assert.ok(stats.successRate >= 0 && stats.successRate <= 100);
  });
});
