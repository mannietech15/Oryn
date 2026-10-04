import { describe, it } from 'node:test';
import assert from 'node:assert';
import { FinancialsService } from '../../src/modules/financials/financials.service';

describe('FinancialsService Ledger & Metrics Suite', () => {
  const financialsService = new FinancialsService();
  const testOrgId = 'org_oryn_test_' + Date.now();

  it('should retrieve ledger structure with entries and metrics', async () => {
    const ledger = await financialsService.getLedger();
    assert.ok(ledger);
    assert.ok(Array.isArray(ledger.entries));
    assert.ok(ledger.metrics);
    assert.strictEqual(typeof ledger.metrics.totalRevenue, 'number');
    assert.strictEqual(typeof ledger.metrics.totalExpenses, 'number');
    assert.strictEqual(typeof ledger.metrics.netProfit, 'number');
    assert.strictEqual(typeof ledger.metrics.margin, 'number');
  });

  it('should post a new revenue transaction and return updated metrics', async () => {
    const res = await financialsService.addEntry({
      orgId: testOrgId,
      type: 'revenue',
      category: 'Enterprise AI Licensing',
      amount: 45000,
      date: '2026-10-04',
      note: 'Q4 Annual Contract License',
    });

    assert.ok(res.entry);
    assert.strictEqual(res.entry.category, 'Enterprise AI Licensing');
    assert.strictEqual(res.entry.amount, 45000);
    assert.strictEqual(res.entry.type, 'revenue');
    assert.ok(res.metrics);
    assert.strictEqual(res.metrics.totalRevenue >= 45000, true);
  });

  it('should post a new disbursement and accurately calculate net profit and margin', async () => {
    const res = await financialsService.addEntry({
      orgId: testOrgId,
      type: 'expense',
      category: 'GPU Cluster Capacity',
      amount: 15000,
      date: '2026-10-04',
      note: 'Dedicated NVIDIA H100 Node Lease',
    });

    assert.ok(res.entry);
    assert.strictEqual(res.entry.category, 'GPU Cluster Capacity');
    assert.strictEqual(res.entry.amount, 15000);
    assert.strictEqual(res.entry.type, 'expense');

    const metrics = await financialsService.getMetrics(testOrgId);
    assert.strictEqual(metrics.totalRevenue, 45000);
    assert.strictEqual(metrics.totalExpenses, 15000);
    assert.strictEqual(metrics.netProfit, 30000);
    // Margin = (30000 / 45000) * 100 = 66.7%
    assert.strictEqual(metrics.margin, 66.7);
    assert.strictEqual(metrics.entryCount, 2);
  });

  it('should compute margin as 0 when total revenue is 0', async () => {
    const zeroRevOrg = 'org_zero_rev_' + Date.now();
    await financialsService.addEntry({
      orgId: zeroRevOrg,
      type: 'expense',
      category: 'Office Lease',
      amount: 5000,
      date: '2026-10-04',
    });

    const metrics = await financialsService.getMetrics(zeroRevOrg);
    assert.strictEqual(metrics.totalRevenue, 0);
    assert.strictEqual(metrics.totalExpenses, 5000);
    assert.strictEqual(metrics.netProfit, -5000);
    assert.strictEqual(metrics.margin, 0);
  });
});
