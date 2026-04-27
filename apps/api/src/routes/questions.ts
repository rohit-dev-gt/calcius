import { Router } from 'express';
import { logQuestion } from '../controllers/questions';
import { authenticate } from '../middleware/auth';

export const questionsRouter = Router();

questionsRouter.use(authenticate);
questionsRouter.post('/log', logQuestion);
