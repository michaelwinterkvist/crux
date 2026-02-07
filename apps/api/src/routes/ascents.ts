import type { FastifyPluginAsync } from 'fastify';
import { updateAscentSchema } from '@crux/shared';
import * as ascentService from '../services/ascent.service.js';
import { authenticate } from '../middleware/auth.js';

export const ascentRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.put<{ Params: { id: string } }>('/:id', async (request) => {
    const body = updateAscentSchema.parse(request.body);
    const data = await ascentService.update(request.userId, request.params.id, body);
    return { data };
  });

  app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    await ascentService.remove(request.userId, request.params.id);
    reply.code(204).send();
  });
};
