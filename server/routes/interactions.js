import { Router } from 'express';
import { logInteraction, getInteractions, getInteractionStats } from '../controllers/interactionController.js';

const router = Router();

router.post('/', logInteraction);
router.get('/', getInteractions);
router.get('/stats', getInteractionStats);

export default router;
