import { Router } from 'express';
import { getAllPersonas, getPersonaById } from '../controllers/personaController.js';

const router = Router();

router.get('/', getAllPersonas);
router.get('/:id', getPersonaById);

export default router;
