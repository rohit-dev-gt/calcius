import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { getRankFromAvgTime, getRankProgress } from '@calcura/shared';
import { updateProfileSchema, changePasswordSchema } from '@calcura/shared';
import type { ModuleType } from '@calcura/shared';

// ── GET /user/me ──────────────────────────────────────────────────────────────

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, username: true, email: true,
        avatarUrl: true, country: true, createdAt: true, lastLoginAt: true,
        streak: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Calculate overall stats
    const aggResult = await prisma.questionLog.aggregate({
      where: { userId },
      _count: true,
      _avg: { timeTaken: true },
    });

    const totalQuestions = aggResult._count;
    const overallAvgTime = aggResult._avg.timeTaken;
    const rank = getRankFromAvgTime(overallAvgTime);
    const rankProgress = getRankProgress(overallAvgTime);

    // Get global rank
    const globalRankResult = await prisma.$queryRaw<{ rank: bigint }[]>`
      SELECT rank FROM (
        SELECT "userId", AVG("timeTaken") as avg_time,
               RANK() OVER (ORDER BY AVG("timeTaken") ASC) as rank
        FROM question_logs
        GROUP BY "userId"
      ) ranked
      WHERE "userId" = ${userId}
    `;
    const globalRank = globalRankResult[0] ? Number(globalRankResult[0].rank) : null;

    res.json({
      success: true,
      data: {
        ...user,
        stats: { totalQuestions, overallAvgTime, globalRank, rank, rankProgress },
      },
    });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
}

// ── GET /user/stats ───────────────────────────────────────────────────────────

export async function getStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;

    // Module stats
    const moduleStats = await prisma.moduleStat.findMany({
      where: { userId },
      orderBy: { module: 'asc' },
    });

    // Recent sessions (last 20)
    const recentSessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 20,
      include: {
        questions: {
          select: { timeTaken: true, module: true, isCorrect: true, practicedAt: true },
        },
      },
    });

    // 30-day trend (daily avg)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const trend = await prisma.$queryRaw<{ date: Date; avg_time: number; count: bigint }[]>`
      SELECT DATE_TRUNC('day', "practicedAt") as date,
             AVG("timeTaken") as avg_time,
             COUNT(*) as count
      FROM question_logs
      WHERE "userId" = ${userId} AND "practicedAt" >= ${thirtyDaysAgo}
      GROUP BY DATE_TRUNC('day', "practicedAt")
      ORDER BY date ASC
    `;

    // Overall stats
    const overall = await prisma.questionLog.aggregate({
      where: { userId },
      _count: true,
      _avg: { timeTaken: true },
      _min: { timeTaken: true },
    });

    // Streak
    const streak = await prisma.streak.findUnique({ where: { userId } });

    res.json({
      success: true,
      data: {
        moduleStats,
        recentSessions,
        trend: trend.map((t) => ({
          date: t.date.toISOString().split('T')[0],
          avgTime: Number(t.avg_time),
          count: Number(t.count),
        })),
        overall: {
          totalQuestions: overall._count,
          overallAvgTime: overall._avg.timeTaken,
          bestTime: overall._min.timeTaken,
          rank: getRankFromAvgTime(overall._avg.timeTaken),
          rankProgress: getRankProgress(overall._avg.timeTaken),
        },
        streak,
      },
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
}

// ── GET /user/heatmap ────────────────────────────────────────────────────────

export async function getHeatmap(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    const data = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE_TRUNC('day', "practicedAt") as date, COUNT(*) as count
      FROM question_logs
      WHERE "userId" = ${userId} AND "practicedAt" >= ${oneYearAgo}
      GROUP BY DATE_TRUNC('day', "practicedAt")
      ORDER BY date ASC
    `;

    res.json({
      success: true,
      data: data.map((d) => ({
        date: d.date.toISOString().split('T')[0],
        count: Number(d.count),
      })),
    });
  } catch (err) {
    console.error('getHeatmap error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch heatmap' });
  }
}

// ── GET /user/module/:module ──────────────────────────────────────────────────

export async function getModuleStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const module = req.params.module as ModuleType;

    const stats = await prisma.moduleStat.findMany({
      where: { userId, module },
    });

    const recentQuestions = await prisma.questionLog.findMany({
      where: { userId, module },
      orderBy: { practicedAt: 'desc' },
      take: 30,
    });

    res.json({ success: true, data: { stats, recentQuestions } });
  } catch (err) {
    console.error('getModuleStats error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch module stats' });
  }
}

// ── PATCH /user/profile ───────────────────────────────────────────────────────

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    return;
  }

  try {
    const userId = req.userId!;

    if (parsed.data.username) {
      const existing = await prisma.user.findFirst({
        where: { username: parsed.data.username, NOT: { id: userId } },
      });
      if (existing) {
        res.status(409).json({ success: false, error: 'Username already taken' });
        return;
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: parsed.data,
      select: { id: true, username: true, email: true, avatarUrl: true, country: true },
    });

    res.json({ success: true, data: user });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
}

// ── POST /user/change-password ───────────────────────────────────────────────

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    return;
  }

  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const match = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!match) {
      res.status(400).json({ success: false, error: 'Current password is incorrect' });
      return;
    }

    const newHash = await bcrypt.hash(
      parsed.data.newPassword,
      Number(process.env.BCRYPT_SALT_ROUNDS) || 12
    );
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('changePassword error:', err);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
}

// ── GET /user/export ──────────────────────────────────────────────────────────

export async function exportData(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;

    const [user, questionLogs, sessions, moduleStats, mockResults, streak] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, email: true, country: true, createdAt: true },
      }),
      prisma.questionLog.findMany({ where: { userId }, orderBy: { practicedAt: 'desc' } }),
      prisma.session.findMany({ where: { userId }, orderBy: { startedAt: 'desc' } }),
      prisma.moduleStat.findMany({ where: { userId } }),
      prisma.mockResult.findMany({ where: { userId }, orderBy: { completedAt: 'desc' } }),
      prisma.streak.findUnique({ where: { userId } }),
    ]);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="calcura-data-export.json"');
    res.json({ user, questionLogs, sessions, moduleStats, mockResults, streak, exportedAt: new Date() });
  } catch (err) {
    console.error('exportData error:', err);
    res.status(500).json({ success: false, error: 'Failed to export data' });
  }
}

// ── DELETE /user/account ──────────────────────────────────────────────────────

export async function deleteAccount(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    await prisma.user.delete({ where: { id: userId } });
    res.clearCookie('calcura_refresh_token', { path: '/api/v1/auth' });
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    console.error('deleteAccount error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
}
