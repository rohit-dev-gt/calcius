import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { redisDel, redisExists, redisSet } from '../lib/redis';
import { registerSchema, loginSchema } from '@calcura/shared';
import { AuthRequest } from '../middleware/auth';
import { REFRESH_TOKEN_COOKIE_NAME } from '@calcura/shared';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

function generateAccessToken(userId: string, email: string): string {
  const secret = process.env.JWT_ACCESS_SECRET!;
  return jwt.sign({ sub: userId, email }, secret, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  } as jwt.SignOptions);
}

function generateRefreshToken(userId: string, email: string): string {
  const secret = process.env.JWT_REFRESH_SECRET!;
  return jwt.sign({ sub: userId, email }, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
}

function setRefreshCookie(res: Response, token: string): void {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/api/v1/auth',
  });
}

// ── POST /auth/register ──────────────────────────────────────────────────────

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    return;
  }

  const { username, email, password } = parsed.data;

  try {
    // Check uniqueness
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { email: true, username: true },
    });

    if (existing) {
      const field = existing.email === email ? 'email' : 'username';
      res.status(409).json({ success: false, error: `This ${field} is already taken` });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { username, email, passwordHash },
        select: { id: true, username: true, email: true, createdAt: true },
      });

      // Initialize streak record
      await tx.streak.create({
        data: { userId: newUser.id, current: 0, longest: 0 },
      });

      return newUser;
    });

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Store refresh token in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      data: { user, accessToken },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
}

// ── POST /auth/login ─────────────────────────────────────────────────────────

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true, username: true, email: true,
        passwordHash: true, avatarUrl: true, country: true,
        createdAt: true, lastLoginAt: true,
      },
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    setRefreshCookie(res, refreshToken);

    const { passwordHash: _omit, ...safeUser } = user;

    res.json({
      success: true,
      data: { user: safeUser, accessToken },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
}

// ── POST /auth/refresh ───────────────────────────────────────────────────────

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

  if (!token) {
    res.status(401).json({ success: false, error: 'No refresh token' });
    return;
  }

  try {
    // Check if token is blacklisted in Redis
    const isBlacklisted = await redisExists(`blacklist:${token}`);
    if (isBlacklisted) {
      res.status(401).json({ success: false, error: 'Token revoked' });
      return;
    }

    const secret = process.env.JWT_REFRESH_SECRET!;
    const decoded = jwt.verify(token, secret) as { sub: string; email: string };

    // Verify token exists in DB and is not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, username: true } } },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
      return;
    }

    // Rotate refresh token
    const newAccessToken = generateAccessToken(decoded.sub, decoded.email);
    const newRefreshToken = generateRefreshToken(decoded.sub, decoded.email);

    await prisma.$transaction([
      // Revoke old token
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      }),
      // Create new token
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: decoded.sub,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    setRefreshCookie(res, newRefreshToken);

    res.json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, error: 'Invalid refresh token' });
    } else {
      res.status(500).json({ success: false, error: 'Token refresh failed' });
    }
  }
}

// ── POST /auth/logout ────────────────────────────────────────────────────────

export async function logout(req: AuthRequest, res: Response): Promise<void> {
  const token = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

  try {
    if (token) {
      // Blacklist in Redis for its remaining TTL
      await redisSet(`blacklist:${token}`, '1', 7 * 24 * 60 * 60);

      // Revoke in DB
      await prisma.refreshToken.updateMany({
        where: { token, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/api/v1/auth' });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ success: false, error: 'Logout failed' });
  }
}
