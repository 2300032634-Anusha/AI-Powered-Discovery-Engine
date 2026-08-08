import { Router } from 'express';
import { performSearch } from '../controllers/searchController.js';

const router = Router();

router.post('/', performSearch);

export default router;
