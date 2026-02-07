import type { FastifyPluginAsync } from 'fastify';
import { createProjectSchema, updateProjectSchema, createProjectAttemptSchema } from '@crux/shared';
import * as projectService from '../services/project.service.js';
import { authenticate } from '../middleware/auth.js';

export const projectRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.get<{ Querystring: { status?: string } }>('/', async (request) => {
    const data = await projectService.list(request.userId, request.query.status);
    return { data };
  });

  app.get<{ Params: { id: string } }>('/:id', async (request) => {
    const data = await projectService.getById(request.userId, request.params.id);
    return { data };
  });

  app.post('/', async (request, reply) => {
    const body = createProjectSchema.parse(request.body);
    const data = await projectService.create(request.userId, body);
    reply.code(201).send({ data });
  });

  app.put<{ Params: { id: string } }>('/:id', async (request) => {
    const body = updateProjectSchema.parse(request.body);
    const data = await projectService.update(request.userId, request.params.id, body);
    return { data };
  });

  app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    await projectService.remove(request.userId, request.params.id);
    reply.code(204).send();
  });

  // Attempts
  app.get<{ Params: { id: string } }>('/:id/attempts', async (request) => {
    const data = await projectService.listAttempts(request.userId, request.params.id);
    return { data };
  });

  app.post<{ Params: { id: string } }>('/:id/attempts', async (request, reply) => {
    const body = createProjectAttemptSchema.parse(request.body);
    const data = await projectService.addAttempt(request.userId, request.params.id, body);
    reply.code(201).send({ data });
  });
};
