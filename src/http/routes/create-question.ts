import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/schema/index.ts';

export function createQuestion(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/rooms/:roomId/questions',
    {
      schema: {
        tags: ['Rooms'],
        summary: 'Create a room',
        params: z.object({
          roomId: z.string(),
        }),
        body: z.object({
          question: z.string().min(3),
        }),
        response: {
          201: z.object({
            questionId: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { roomId } = request.params
      const { question } = request.body

      const result = await db.insert(schema.questions).values({
        roomId,
        question
      }).returning()

      const insertedQuestion = result[0]

      if (!insertedQuestion) {
        throw new Error('Room not created')
      }

      return reply.status(201).send({ questionId: insertedQuestion.id })
    }
  );
}
