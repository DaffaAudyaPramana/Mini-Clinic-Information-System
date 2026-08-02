import { Router } from 'express';
import { login, logout } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/logout', authenticate, logout);

export default router;
