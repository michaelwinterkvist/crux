import type { FastifyPluginAsync } from 'fastify';
import { createSessionSchema, updateSessionSchema, createAscentSchema } from '@crux/shared';
import * as sessionService from '../services/session.service.js';
import * as ascentService from '../services/ascent.service.js';
import { authenticate } from '../middleware/auth.js';

export const sessionRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.get<{
    Querystring: { page?: string; limit?: string; from?: string; to?: string; type?: string; locationId?: string };
  }>('/', async (request) => {
    const { page, limit, from, to, type, locationId } = request.query;
    const result = await sessionService.list(request.userId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      from, to, type, locationId,
    });
    return result;
  });

  app.get<{ Params: { id: string } }>('/:id', async (request) => {
    const data = await sessionService.getById(request.userId, request.params.id);
    return { data };
  });

  app.post('/', async (request, reply) => {
    const body = createSessionSchema.parse(request.body);
    const data = await sessionService.create(request.userId, body);
    reply.code(201).send({ data });
  });

  app.put<{ Params: { id: string } }>('/:id', async (request) => {
    const body = updateSessionSchema.parse(request.body);
    const data = await sessionService.update(request.userId, request.params.id, body);
    return { data };
  });

  app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    await sessionService.remove(request.userId, request.params.id);
    reply.code(204).send();
  });

  // Ascents nested under sessions
  app.get<{ Params: { id: string } }>('/:id/ascents', async (request) => {
    const data = await ascentService.listBySession(request.params.id);
    return { data };
  });

  app.post<{ Params: { id: string } }>('/:id/ascents', async (request, reply) => {
    const body = createAscentSchema.parse(request.body);
    const data = await ascentService.create(request.userId, request.params.id, body);
    reply.code(201).send({ data });
  });
};
