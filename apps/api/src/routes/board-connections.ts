import type { FastifyPluginAsync } from 'fastify';
import { connectBoardSchema } from '@crux/shared';
import * as boardConnectionService from '../services/board-connection.service.js';
import * as boardImportService from '../services/board-import.service.js';
import * as kilterService from '../services/kilter.service.js';
import { authenticate } from '../middleware/auth.js';
import { badRequest } from '../utils/errors.js';

export const boardConnectionRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  // List connections
  app.get('/', async (request) => {
    const data = await boardConnectionService.list(request.userId);
    return { data };
  });

  // Connect a board
  app.post('/', async (request, reply) => {
    const { boardType, username, password } = connectBoardSchema.parse(request.body);

    if (boardType !== 'kilter') {
      throw badRequest(`Board type '${boardType}' is not yet supported. Only 'kilter' is available.`);
    }

    // Validate credentials with Kilter
    let kilterSession: kilterService.KilterSession;
    try {
      kilterSession = await kilterService.authenticate(username, password);
    } catch (err: any) {
      throw badRequest(err.message ?? 'Could not authenticate with Kilter Board');
    }

    // Create connection
    const connection = await boardConnectionService.create(
      request.userId,
      boardType,
      username,
      password,
      kilterSession.userId ? String(kilterSession.userId) : undefined,
    );

    reply.code(201).send({ data: connection });
  });

  // Delete connection
  app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    await boardConnectionService.remove(request.userId, request.params.id);
    reply.code(204).send();
  });

  // Trigger sync
  app.post<{ Params: { id: string } }>('/:id/sync', async (request, reply) => {
    try {
      const result = await boardImportService.importKilterHistory(
        request.userId,
        request.params.id,
      );
      return { data: result };
    } catch (err: any) {
      const message = err?.message ?? String(err) ?? 'Sync failed';
      app.log.error({ err }, `Kilter sync error: ${message}`);
      reply.code(400).send({
        error: { code: 'SYNC_ERROR', message },
      });
    }
  });
};
