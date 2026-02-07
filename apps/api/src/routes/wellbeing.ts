import type { FastifyPluginAsync } from 'fastify';
import { createWellbeingSchema } from '@crux/shared';
import * as wellbeingService from '../services/wellbeing.service.js';
import { authenticate } from '../middleware/auth.js';

export const wellbeingRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.post('/', async (request, reply) => {
    const body = createWellbeingSchema.parse(request.body);
    const data = await wellbeingService.upsert(request.userId, body);
    reply.code(201).send({ data });
  });

  app.get<{ Querystring: { from?: string; to?: string } }>('/', async (request) => {
    const data = await wellbeingService.list(request.userId, request.query.from, request.query.to);
    return { data };
  });

  app.get<{ Params: { date: string } }>('/:date', async (request) => {
    const data = await wellbeingService.getByDate(request.userId, request.params.date);
    return { data };
  });
};
