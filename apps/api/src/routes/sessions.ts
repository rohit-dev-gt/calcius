import { Router } from 'express';
import { startSession, endSession, getSessions } from '../controllers/sessions';
import { authenticate } from '../middleware/auth';

export const sessionsRouter = Router();

sessionsRouter.use(authenticate);

sessionsRouter.post('/start', startSession);
sessionsRouter.post('/:id/end', endSession);
sessionsRouter.get('/', getSessions);
