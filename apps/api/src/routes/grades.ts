import type { FastifyPluginAsync } from 'fastify';
import { getGradesForSystem, getBands, type GradeSystem, GRADE_SYSTEMS } from '@crux/shared';
import { badRequest } from '../utils/errors.js';

export const gradeRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Params: { system: string } }>('/:system', async (request) => {
    const { system } = request.params;
    if (!GRADE_SYSTEMS.includes(system as GradeSystem)) {
      throw badRequest(`Invalid grade system '${system}'. Valid: ${GRADE_SYSTEMS.join(', ')}`);
    }

    const grades = getGradesForSystem(system as GradeSystem);
    const bands = getBands(system as GradeSystem);

    return { data: { system, grades, bands } };
  });
};
