import express from 'express';
import { register, login, getMe, updateProfile } from '../controllers/auth.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', (req, res) => {
  // Nếu dùng JWT, chỉ cần client xóa token là đủ. Có thể mở rộng blacklist token nếu cần.
  res.json({ status: 'success', message: 'Logged out' });
});

export default router;