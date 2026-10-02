import { Router } from 'express';
import { defaultCalendarController } from './calendar.controller';

const router = Router();

router.get('/calendar', defaultCalendarController.getEvents);
router.post('/calendar', defaultCalendarController.createEvent);
router.delete('/calendar/:id', defaultCalendarController.deleteEvent);

export default router;
