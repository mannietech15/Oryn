import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DashboardService } from '../../src/modules/dashboard/dashboard.service';
import { InferenceService } from '../../src/modules/inference/inference.service';

const mockInference = {
  generateJson: async () => ({
    headline: 'Mock Headline',
    summary: 'Mock Summary',
    highlight: '+20% MTD',
    mood: 'strong',
    tip: 'Keep executing',
  }),
} as unknown as InferenceService;

describe('DashboardService', () => {
  const service = new DashboardService(mockInference);

  it('should return valid analytics KPIs and timeline data', () => {
    const analytics = service.getAnalytics();
    assert.ok(analytics.kpis);
    assert.strictEqual(analytics.kpis.revenue.value, '$284K');
    assert.ok(Array.isArray(analytics.usageTimeline));
    assert.ok(Array.isArray(analytics.breakdown));
    assert.ok(Array.isArray(analytics.team));
  });

  it('should return executive briefing', async () => {
    const briefing = await service.getBriefing();
    assert.ok(briefing.headline);
    assert.ok(briefing.summary);
    assert.ok(briefing.highlight);
  });

  it('should return goals list', () => {
    const goals = service.getGoals();
    assert.ok(Array.isArray(goals));
    assert.strictEqual(goals.length, 4);
  });

  it('should calculate system health score with breakdown', () => {
    const health = service.getHealthScore();
    assert.strictEqual(typeof health.score, 'number');
    assert.ok(health.score >= 0 && health.score <= 100);
    assert.ok(Array.isArray(health.breakdown));
    assert.strictEqual(health.grade, 'A-');
  });
});
