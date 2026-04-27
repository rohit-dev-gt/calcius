import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { logQuestionSchema } from '@calcura/shared';

// ── POST /questions/log ───────────────────────────────────────────────────────

export async function logQuestion(req: AuthRequest, res: Response): Promise<void> {
  const parsed = logQuestionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    return;
  }

  try {
    const userId = req.userId!;
    const { sessionId, module, difficulty, questionText, answer, timeTaken, isCorrect } = parsed.data;

    // Verify session belongs to user
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    // Log question + update ModuleStat + update Streak atomically
    const [questionLog] = await prisma.$transaction(async (tx) => {
      // 1. Create question log
      const log = await tx.questionLog.create({
        data: { userId, sessionId, module, difficulty, questionText, answer, timeTaken, isCorrect },
      });

      // 2. Upsert module stat
      const existing = await tx.moduleStat.findUnique({
        where: { userId_module_difficulty: { userId, module, difficulty } },
      });

      if (existing) {
        const newTotal = existing.totalQuestions + 1;
        const newTotalTime = existing.totalTime + timeTaken;
        const newAvg = newTotalTime / newTotal;
        const newBest = existing.bestTime === null ? timeTaken : Math.min(existing.bestTime, timeTaken);

        await tx.moduleStat.update({
          where: { id: existing.id },
          data: {
            totalQuestions: newTotal,
            totalTime: newTotalTime,
            avgTime: newAvg,
            bestTime: newBest,
            lastPracticedAt: new Date(),
          },
        });
      } else {
        await tx.moduleStat.create({
          data: {
            userId, module, difficulty,
            totalQuestions: 1,
            totalTime: timeTaken,
            avgTime: timeTaken,
            bestTime: timeTaken,
            lastPracticedAt: new Date(),
          },
        });
      }

      // 3. Update streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const streak = await tx.streak.findUnique({ where: { userId } });

      if (streak) {
        const lastDateStr = streak.lastDate
          ? new Date(streak.lastDate).toISOString().split('T')[0]
          : null;

        if (lastDateStr !== todayStr) {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          const newCurrent = lastDateStr === yesterdayStr ? streak.current + 1 : 1;
          const newLongest = Math.max(streak.longest, newCurrent);

          await tx.streak.update({
            where: { userId },
            data: { current: newCurrent, longest: newLongest, lastDate: today },
          });
        }
      } else {
        await tx.streak.create({
          data: { userId, current: 1, longest: 1, lastDate: today },
        });
      }

      return [log];
    });

    res.status(201).json({ success: true, data: questionLog });
  } catch (err) {
    console.error('logQuestion error:', err);
    res.status(500).json({ success: false, error: 'Failed to log question' });
  }
}
