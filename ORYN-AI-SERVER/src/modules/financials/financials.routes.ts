import { Router } from 'express';
import { defaultFinancialsController } from './financials.controller';

const router = Router();

router.get('/financials', defaultFinancialsController.getLedger);
router.post('/financials', defaultFinancialsController.addEntry);

export default router;
