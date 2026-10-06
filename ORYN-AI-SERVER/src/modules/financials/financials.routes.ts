import { Router } from 'express';
import { defaultFinancialsController } from './financials.controller';

const router = Router();

// Supports live query params: ?range=7D|30D|90D|1Y
router.get('/financials', defaultFinancialsController.getLedger);
router.post('/financials', defaultFinancialsController.addEntry);

export default router;
