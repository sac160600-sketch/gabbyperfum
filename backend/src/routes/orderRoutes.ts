import { Router } from 'express';
import { createOrder, getOrderById, getOrders, updateOrderStatus, markWhatsappSent } from '../controllers/orderController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';

const router = Router();

// Public routes for checkout and tracking
router.post('/', createOrder);
router.get('/:id', getOrderById);
router.patch('/:id/whatsapp', markWhatsappSent);

// Protected Admin routes
router.get('/', authMiddleware, adminMiddleware, getOrders);
router.patch('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);

export default router;
