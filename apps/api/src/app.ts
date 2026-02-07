import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config.js';
import { AppError } from './utils/errors.js';
import { authRoutes } from './routes/auth.js';
import { sessionRoutes } from './routes/sessions.js';
import { ascentRoutes } from './routes/ascents.js';
import { locationRoutes } from './routes/locations.js';
import { projectRoutes } from './routes/projects.js';
import { wellbeingRoutes } from './routes/wellbeing.js';
import { statsRoutes } from './routes/stats.js';
import { gradeRoutes } from './routes/grades.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  // Plugins
  await app.register(cors, { origin: true });
  await app.register(jwt, { secret: config.JWT_SECRET });

  // Error handler
  app.setErrorHandler((error: Error & { statusCode?: number; code?: string }, _request, reply) => {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({
        error: { code: error.code, message: error.message },
      });
      return;
    }

    // Zod validation errors
    if (error.name === 'ZodError') {
      reply.code(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: error },
      });
      return;
    }

    app.log.error(error);
    reply.code(500).send({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  });

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Routes
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(sessionRoutes, { prefix: '/api/v1/sessions' });
  await app.register(ascentRoutes, { prefix: '/api/v1/ascents' });
  await app.register(locationRoutes, { prefix: '/api/v1/locations' });
  await app.register(projectRoutes, { prefix: '/api/v1/projects' });
  await app.register(wellbeingRoutes, { prefix: '/api/v1/wellbeing' });
  await app.register(statsRoutes, { prefix: '/api/v1/stats' });
  await app.register(gradeRoutes, { prefix: '/api/v1/grades' });

  return app;
}
