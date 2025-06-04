import express from 'express';
import { register, login, getMe, updateProfile } from '../controllers/auth.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router; 