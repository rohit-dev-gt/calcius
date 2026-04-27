import { Router } from 'express';
import { getLeaderboard, getMyRank } from '../controllers/leaderboard';
import { authenticate } from '../middleware/auth';

export const leaderboardRouter = Router();

leaderboardRouter.get('/', getLeaderboard);
leaderboardRouter.get('/rank/me', authenticate, getMyRank);
