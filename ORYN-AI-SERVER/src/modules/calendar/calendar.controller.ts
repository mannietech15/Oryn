import { Request, Response, NextFunction } from 'express';
import { defaultDatastore, Datastore } from '../../infrastructure/storage/datastore';
import { ValidationError, NotFoundError } from '../../shared/errors/app-error';

export class CalendarController {
  constructor(private datastore: Datastore = defaultDatastore) {}

  getEvents = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const events = this.datastore.getCalendarEvents();
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

      const event = this.datastore.addCalendarEvent({
        title,
        time,
        type: type || 'internal',
        attendees: Array.isArray(attendees) ? attendees : (attendees ? [String(attendees)] : []),
        aiBrief: aiBrief || 'Scheduled operational event.'
      });

      res.status(201).json(event);
    } catch (err) {
      next(err);
    }
  };

  deleteEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = this.datastore.deleteCalendarEvent(id);
      if (!deleted) throw new NotFoundError(`Calendar event '${id}' not found`);

      res.json({ success: true, id });
    } catch (err) {
      next(err);
    }
  };
}

export const defaultCalendarController = new CalendarController();
