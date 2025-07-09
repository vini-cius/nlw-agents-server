import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/schema/index.ts';
import { desc, eq } from 'drizzle-orm';
import { questions } from '../../db/schema/questions.ts';

export function getRoomQuestions(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/rooms/:roomId/questions',
    {
      schema: {
        tags: ['Rooms'],
        summary: 'Get all rooms questions',
        params: z.object({
          roomId: z.string(),
        }),
        response: {
          200: z.object({
            questions: z.array(z.object({
              id: z.string(),
              question: z.string(),
              answer: z.string().nullable(),
              createdAt: z.date(),
            })),
          })
        },
      },
    },
    async (request) => {
      const { roomId } = request.params;

      const result = await db.select({
        id: schema.questions.id,
        question: schema.questions.question,
        answer: schema.questions.answer,
        createdAt: schema.questions.createdAt
      })
      .from(schema.questions)
      .where(eq(schema.questions.roomId, roomId))
      .orderBy(desc(questions.createdAt));

      return {
        questions: result,
      };
    }
  );
}
