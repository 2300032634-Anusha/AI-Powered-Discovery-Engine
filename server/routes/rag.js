import { Router } from 'express';
import { getKnowledgeBase, ragChat } from '../controllers/ragController.js';

const router = Router();

router.get('/', getKnowledgeBase);
router.post('/chat', ragChat);

export default router;
