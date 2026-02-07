import type { FastifyPluginAsync } from 'fastify';
import { registerSchema, loginSchema } from '@crux/shared';
import * as authService from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.js';
import { config } from '../config.js';

function parseExpiry(str: string): number {
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // default 15m
  const [, val, unit] = match;
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return parseInt(val) * (multipliers[unit] ?? 60);
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const user = await authService.register(body.email, body.name, body.password);

    const token = app.jwt.sign({ sub: user.id }, { expiresIn: config.JWT_EXPIRES_IN });
    const refreshToken = app.jwt.sign({ sub: user.id, type: 'refresh' }, { expiresIn: config.JWT_REFRESH_EXPIRES_IN });

    reply.code(201).send({
      data: {
        user,
        token,
        refreshToken,
        expiresIn: parseExpiry(config.JWT_EXPIRES_IN),
      },
    });
  });

  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const user = await authService.login(body.email, body.password);

    const token = app.jwt.sign({ sub: user.id }, { expiresIn: config.JWT_EXPIRES_IN });
    const refreshToken = app.jwt.sign({ sub: user.id, type: 'refresh' }, { expiresIn: config.JWT_REFRESH_EXPIRES_IN });

    reply.send({
      data: {
        user,
        token,
        refreshToken,
        expiresIn: parseExpiry(config.JWT_EXPIRES_IN),
      },
    });
  });

  app.post('/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string };
    if (!refreshToken) {
      reply.code(400).send({ error: { code: 'BAD_REQUEST', message: 'refreshToken is required' } });
      return;
    }

    try {
      const payload = app.jwt.verify<{ sub: string; type?: string }>(refreshToken);
      if (payload.type !== 'refresh') {
        reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } });
        return;
      }

      const token = app.jwt.sign({ sub: payload.sub }, { expiresIn: config.JWT_EXPIRES_IN });
      const newRefreshToken = app.jwt.sign({ sub: payload.sub, type: 'refresh' }, { expiresIn: config.JWT_REFRESH_EXPIRES_IN });

      reply.send({
        data: {
          token,
          refreshToken: newRefreshToken,
          expiresIn: parseExpiry(config.JWT_EXPIRES_IN),
        },
      });
    } catch {
      reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' } });
    }
  });

  app.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    const user = await authService.getUserById(request.userId);
    if (!user) {
      reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'User not found' } });
      return;
    }
    reply.send({ data: user });
  });
};
