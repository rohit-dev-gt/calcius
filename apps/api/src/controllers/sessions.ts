import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { startSessionSchema, endSessionSchema } from '@calcura/shared';

// ── POST /sessions/start ──────────────────────────────────────────────────────

export async function startSession(req: AuthRequest, res: Response): Promise<void> {
  const parsed = startSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    return;
  }

  try {
    const session = await prisma.session.create({
      data: {
        userId: req.userId!,
        module: parsed.data.module,
        difficulty: parsed.data.difficulty,
      },
    });

    res.status(201).json({ success: true, data: session });
  } catch (err) {
    console.error('startSession error:', err);
    res.status(500).json({ success: false, error: 'Failed to start session' });
  }
}

// ── POST /sessions/:id/end ────────────────────────────────────────────────────

export async function endSession(req: AuthRequest, res: Response): Promise<void> {
  const parsed = endSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    return;
  }

  try {
    const { id } = req.params;

    // Ensure session belongs to user
    const session = await prisma.session.findFirst({
      where: { id, userId: req.userId! },
    });

    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    // Compute actual stats from question logs if not provided
    let { avgTime, bestTime, questionCount } = parsed.data;

    if (avgTime === null || bestTime === null) {
      const agg = await prisma.questionLog.aggregate({
        where: { sessionId: id },
        _avg: { timeTaken: true },
        _min: { timeTaken: true },
        _count: true,
      });
      avgTime = avgTime ?? agg._avg.timeTaken;
      bestTime = bestTime ?? agg._min.timeTaken;
      questionCount = questionCount || agg._count;
    }

    const updated = await prisma.session.update({
      where: { id },
      data: {
        endedAt: new Date(),
        questionCount,
        avgTime,
        bestTime,
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('endSession error:', err);
    res.status(500).json({ success: false, error: 'Failed to end session' });
  }
}

// ── GET /sessions ─────────────────────────────────────────────────────────────

export async function getSessions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where: { userId: req.userId! },
        orderBy: { startedAt: 'desc' },
        take: limit,
        skip,
        include: {
          questions: {
            select: { id: true, timeTaken: true, module: true, isCorrect: true },
          },
        },
      }),
      prisma.session.count({ where: { userId: req.userId! } }),
    ]);

    res.json({
      success: true,
      data: { sessions, total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('getSessions error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
  }
}
