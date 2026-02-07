import type { FastifyPluginAsync } from 'fastify';
import { createLocationSchema, updateLocationSchema } from '@crux/shared';
import * as locationService from '../services/location.service.js';
import { authenticate } from '../middleware/auth.js';

export const locationRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.get('/', async (request) => {
    const data = await locationService.list(request.userId);
    return { data };
  });

  app.get<{ Params: { id: string } }>('/:id', async (request) => {
    const data = await locationService.getById(request.userId, request.params.id);
    return { data };
  });

  app.post('/', async (request, reply) => {
    const body = createLocationSchema.parse(request.body);
    const data = await locationService.create(request.userId, body);
    reply.code(201).send({ data });
  });

  app.put<{ Params: { id: string } }>('/:id', async (request) => {
    const body = updateLocationSchema.parse(request.body);
    const data = await locationService.update(request.userId, request.params.id, body);
    return { data };
  });

  app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    await locationService.archive(request.userId, request.params.id);
    reply.code(204).send();
  });
};
