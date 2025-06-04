import express from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
} from '../controllers/order.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrder)
  .put(authorize('admin'), updateOrderStatus);

export default router; 