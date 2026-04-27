import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/auth';
import { authRateLimit } from '../middleware/rateLimit';
import { authenticate } from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/register', authRateLimit, register);
authRouter.post('/login', authRateLimit, login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', authenticate, logout);
