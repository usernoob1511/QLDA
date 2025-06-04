import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from '../controllers/cart.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart);

router.route('/:id')
  .put(updateCartItem)
  .delete(removeFromCart);

export default router; 