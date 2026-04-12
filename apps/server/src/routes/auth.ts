import { Router } from 'express';
import { login, register, logout, me, changePassword, deleteAccount } from '../controllers/auth';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, me as any);
router.patch('/change-password', authenticate, changePassword as any);
router.delete('/account', authenticate, deleteAccount as any);

export default router;
