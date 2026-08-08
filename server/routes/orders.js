import { Router } from 'express';
import { createOrder, getUserOrders, getUserOrderStats } from '../controllers/orderController.js';

const router = Router();

router.post('/', createOrder);
router.get('/user/:userId', getUserOrders);
router.get('/stats/user/:userId', getUserOrderStats);

export default router;
