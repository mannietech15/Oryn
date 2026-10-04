import { Request, Response, NextFunction } from 'express';
import { CalendarService, defaultCalendarService } from './calendar.service';
import { ValidationError } from '../../shared/errors/app-error';

export class CalendarController {
  constructor(private calendarService: CalendarService = defaultCalendarService) {}

  getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orgId = (req as any).user?.orgId;
      const events = await this.calendarService.getEvents(orgId);
      res.json(events);
    } catch (err) {
      next(err);
    }
  };

  createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { title, time, type, attendees, aiBrief } = req.body;

      if (!title || typeof title !== 'string') {
        throw new ValidationError("Field 'title' is required");
      }
      if (!time || typeof time !== 'string') {
        throw new ValidationError("Field 'time' is required");
      }
      const validTypes = ['internal', 'external', 'automation'];
      if (type && !validTypes.includes(type)) {
        throw new ValidationError(`Field 'type' must be one of: ${validTypes.join(', ')}`);
      }

      const orgId = (req as any).user?.orgId;
      const event = await this.calendarService.createEvent({
        title,
        time,
        type: type || 'internal',
        attendees: Array.isArray(attendees) ? attendees : (attendees ? [String(attendees)] : []),
        aiBrief: aiBrief || 'Scheduled operational event.',
        orgId,
      });

      res.status(201).json(event);
    } catch (err) {
      next(err);
    }
  };

  deleteEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const orgId = (req as any).user?.orgId;
      await this.calendarService.deleteEvent(id, orgId);
      res.json({ success: true, id });
    } catch (err) {
      next(err);
    }
  };
}

export const defaultCalendarController = new CalendarController();
