import { Router } from 'express';
import { defaultEcosystemController } from './ecosystem.controller';

const router = Router();

router.get('/ecosystem', defaultEcosystemController.getEcosystem);
router.post('/ecosystem/communities', defaultEcosystemController.createCommunity);
router.post('/ecosystem/communities/:id/join', defaultEcosystemController.joinCommunity);
router.post('/ecosystem/businesses/:id/connect', defaultEcosystemController.connectBusiness);

export default router;
