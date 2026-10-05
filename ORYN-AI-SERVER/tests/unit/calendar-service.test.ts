import { describe, it, after } from 'node:test';
import assert from 'node:assert';
import { CalendarService } from '../../src/modules/calendar/calendar.service';

describe('CalendarService Operational Scheduling Suite', () => {
  const calendarService = new CalendarService();
  const testOrgId = 'org_oryn_global_001';

  it('should list operational calendar events for organization', async () => {
    const created = await calendarService.createEvent({
      orgId: testOrgId,
      title: 'Initial Operational Sync',
      time: '10:00 AM - 10:30 AM',
      type: 'internal',
      attendees: ['Operations Team'],
      aiBrief: 'Operational agenda item.',
    });

    const events = await calendarService.getEvents(testOrgId);
    assert.ok(Array.isArray(events));
    assert.ok(events.length > 0);

    const found = events.find((e) => e.id === created.id) || events[0];
    assert.ok(found.id);
    assert.ok(found.title);
    assert.ok(found.time);
    assert.ok(['internal', 'external', 'automation'].includes(found.type));
    assert.ok(Array.isArray(found.attendees));
    assert.ok(found.aiBrief);

    await calendarService.deleteEvent(created.id, testOrgId);
  });

  it('should schedule a new operational meeting with attendees and AI brief', async () => {
    const testTitle = `Distributed Model Consensus #${Date.now()}`;
    const created = await calendarService.createEvent({
      orgId: testOrgId,
      title: testTitle,
      time: '02:00 PM - 02:45 PM',
      type: 'internal',
      attendees: ['Babajide Sanwo', 'Kemi Adebayo'],
      aiBrief: 'Reviewing inference latency metrics across decentralized nodes.',
    });

    assert.ok(created);
    assert.ok(created.id);
    assert.strictEqual(created.title, testTitle);
    assert.strictEqual(created.type, 'internal');
    assert.deepStrictEqual(created.attendees, ['Babajide Sanwo', 'Kemi Adebayo']);
    assert.strictEqual(created.aiBrief, 'Reviewing inference latency metrics across decentralized nodes.');

    // Verify it appears in active schedule
    const events = await calendarService.getEvents(testOrgId);
    const found = events.find(e => e.id === created.id);
    assert.ok(found);
    assert.strictEqual(found?.title, testTitle);

    // Clean up created event
    await calendarService.deleteEvent(created.id, testOrgId);
  });

  it('should delete a scheduled calendar event by ID', async () => {
    const created = await calendarService.createEvent({
      orgId: testOrgId,
      title: 'Temporary Architecture Sync',
      time: '04:00 PM - 04:30 PM',
      type: 'automation',
      attendees: ['Ops Bot'],
      aiBrief: 'Auto-generated sync.',
    });

    assert.ok(created.id);
    const deleteResult = await calendarService.deleteEvent(created.id, testOrgId);
    assert.strictEqual(deleteResult, true);

    // Verify event is removed
    const events = await calendarService.getEvents(testOrgId);
    const found = events.find(e => e.id === created.id);
    assert.strictEqual(found, undefined);
  });

  after(async () => {
    try {
      const { prisma } = await import('../../src/infrastructure/database/prisma');
      await prisma.calendarEvent.deleteMany({
        where: {
          orgId: testOrgId,
          title: {
            in: ['Initial Operational Sync', 'Temporary Architecture Sync'],
          },
        },
      });
    } catch {}
  });
});
