import type { FastifyPluginAsync } from 'fastify';
import * as statsService from '../services/stats.service.js';
import { authenticate } from '../middleware/auth.js';

export const statsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.get('/summary', async (request) => {
    const data = await statsService.summary(request.userId);
    return { data };
  });

  app.get<{ Querystring: { from?: string; to?: string } }>('/progression', async (request) => {
    const data = await statsService.progression(request.userId, request.query.from, request.query.to);
    return { data };
  });
};
