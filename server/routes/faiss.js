import { Router } from 'express';
import { getFaissSpecs } from '../controllers/faissController.js';

const router = Router();

router.get('/', getFaissSpecs);

export default router;
