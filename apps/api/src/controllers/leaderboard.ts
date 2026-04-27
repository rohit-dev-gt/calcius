import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { redisGet, redisSet } from '../lib/redis';
import { AuthRequest } from '../middleware/auth';
import { getRankFromAvgTime } from '@calcura/shared';
import { LEADERBOARD_CACHE_TTL_SECONDS } from '@calcura/shared';

const LEADERBOARD_CACHE_KEY = 'leaderboard:global:top100';

// ── GET /leaderboard ─────────────────────────────────────────────────────────

export async function getLeaderboard(_req: Request, res: Response): Promise<void> {
  try {
    // Check Redis cache first
    const cached = await redisGet(LEADERBOARD_CACHE_KEY);
    if (cached) {
      res.json({ success: true, data: JSON.parse(cached), cached: true });
      return;
    }

    // Compute from DB
    const leaderboard = await prisma.$queryRaw<{
      userId: string;
      username: string;
      avatarUrl: string | null;
      country: string | null;
      total_questions: bigint;
      avg_time: number;
    }[]>`
      SELECT 
        u.id as "userId",
        u.username,
        u."avatarUrl",
        u.country,
        COUNT(ql.id) as total_questions,
        AVG(ql."timeTaken") as avg_time
      FROM users u
      INNER JOIN question_logs ql ON ql."userId" = u.id
      GROUP BY u.id, u.username, u."avatarUrl", u.country
      HAVING COUNT(ql.id) >= 10
      ORDER BY avg_time ASC
      LIMIT 100
    `;

    const data = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      username: entry.username,
      avatarUrl: entry.avatarUrl,
      country: entry.country,
      totalQuestions: Number(entry.total_questions),
      overallAvgTime: Number(entry.avg_time),
      rankTier: getRankFromAvgTime(Number(entry.avg_time)),
    }));

    // Cache for 5 minutes
    await redisSet(LEADERBOARD_CACHE_KEY, JSON.stringify(data), LEADERBOARD_CACHE_TTL_SECONDS);

    res.json({ success: true, data, cached: false });
  } catch (err) {
    console.error('getLeaderboard error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
  }
}

// ── GET /leaderboard/rank/me ──────────────────────────────────────────────────

export async function getMyRank(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;

    const result = await prisma.$queryRaw<{ rank: bigint; avg_time: number; total_questions: bigint }[]>`
      SELECT rank, avg_time, total_questions FROM (
        SELECT 
          "userId",
          AVG("timeTaken") as avg_time,
          COUNT(*) as total_questions,
          RANK() OVER (ORDER BY AVG("timeTaken") ASC) as rank
        FROM question_logs
        GROUP BY "userId"
        HAVING COUNT(*) >= 10
      ) ranked
      WHERE "userId" = ${userId}
    `;

    if (!result[0]) {
      res.json({
        success: true,
        data: { rank: null, message: 'Complete at least 10 questions to appear on the leaderboard' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        rank: Number(result[0].rank),
        overallAvgTime: Number(result[0].avg_time),
        totalQuestions: Number(result[0].total_questions),
        rankTier: getRankFromAvgTime(Number(result[0].avg_time)),
      },
    });
  } catch (err) {
    console.error('getMyRank error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch rank' });
  }
}
