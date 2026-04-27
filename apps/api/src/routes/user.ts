import { Router } from 'express';
import { getMe, getStats, getHeatmap, getModuleStats, updateProfile, changePassword, exportData, deleteAccount } from '../controllers/user';
import { authenticate } from '../middleware/auth';

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/me', getMe);
userRouter.get('/stats', getStats);
userRouter.get('/heatmap', getHeatmap);
userRouter.get('/module/:module', getModuleStats);
userRouter.patch('/profile', updateProfile);
userRouter.post('/change-password', changePassword);
userRouter.get('/export', exportData);
userRouter.delete('/account', deleteAccount);
