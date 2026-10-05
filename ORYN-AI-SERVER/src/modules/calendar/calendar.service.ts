import { prisma } from '../../infrastructure/database/prisma';
import { defaultDatastore } from '../../infrastructure/storage/datastore';
import { Logger } from '../../infrastructure/logging/logger';
import { NotFoundError } from '../../shared/errors/app-error';

const logger = new Logger('CalendarService');

export class CalendarService {
  private defaultOrgId = 'org_oryn_global_001';

  async getEvents(orgId = this.defaultOrgId) {
    try {
      const events = await prisma.calendarEvent.findMany({
        where: { orgId },
        orderBy: { startTime: 'asc' },
      });

      return events.map((e) => ({
        id: e.id,
        title: e.title,
        time: `${e.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${e.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: e.type,
        attendees: e.attendees,
        aiBrief: e.aiBrief,
        createdAt: e.createdAt.toISOString(),
      }));
    } catch (err: any) {
      logger.warn('Falling back to local datastore for calendar events', { error: err.message });
    }

    return defaultDatastore.getCalendarEvents();
  }

  async createEvent(data: {
    title: string;
    time: string;
    type?: 'internal' | 'external' | 'automation';
    attendees?: string[];
    aiBrief?: string;
    orgId?: string;
  }) {
    const orgId = data.orgId || this.defaultOrgId;
    const now = new Date();
    const startTime = new Date(now.getTime() + 3600000);
    const endTime = new Date(now.getTime() + 7200000);

    const sanitizedAttendees = Array.from(new Set(
      (data.attendees || []).map(a => a.trim()).filter(Boolean)
    ));

    try {
      const created = await prisma.calendarEvent.create({
        data: {
          orgId,
          title: data.title.trim(),
          startTime,
          endTime,
          type: data.type || 'internal',
          attendees: sanitizedAttendees.length ? sanitizedAttendees : ['Operations Team'],
          aiBrief: data.aiBrief?.trim() || 'Autonomous AI agenda and operational briefing prepared.',
        },
      });

      return {
        id: created.id,
        title: created.title,
        time: data.time || `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        type: created.type,
        attendees: created.attendees,
        aiBrief: created.aiBrief,
        createdAt: created.createdAt.toISOString(),
      };
    } catch {
      return defaultDatastore.addCalendarEvent({
        title: data.title.trim(),
        time: data.time,
        type: data.type || 'internal',
        attendees: sanitizedAttendees.length ? sanitizedAttendees : ['Operations Team'],
        aiBrief: data.aiBrief?.trim() || 'Scheduled operational event.',
      });
    }
  }

  async deleteEvent(id: string, orgId = this.defaultOrgId) {
    try {
      const existing = await prisma.calendarEvent.findUnique({ where: { id } });
      if (existing) {
        await prisma.calendarEvent.delete({ where: { id } });
        return true;
      }
    } catch {
      // Fallback
    }

    const deleted = defaultDatastore.deleteCalendarEvent(id);
    if (!deleted) throw new NotFoundError(`Calendar event '${id}' not found`);
    return true;
  }
}

export const defaultCalendarService = new CalendarService();
