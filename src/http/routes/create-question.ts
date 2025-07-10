import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/schema/index.ts';
import { generateAnswer, generateEmbeddings } from '../../services/gemini.ts';
import { and, eq, sql } from 'drizzle-orm';

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
            answer: z.string().nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { roomId } = request.params
      const { question } = request.body

      const embeddings = await generateEmbeddings(question)

      const embeddingsAsString = `[${embeddings.join(',')}]`

      const chunks = await db.select({
        id: schema.audioChunks.id,
        transcription: schema.audioChunks.transcription,
        similarity: sql<number>`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector)`,
      }).from(schema.audioChunks)
        .where(
          and(
            eq(schema.audioChunks.roomId, roomId),
            sql`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector) > 0.7`
          )
        )
        .orderBy(sql`(${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector)`)
        .limit(3)

      let answer: string | null = null

      if (chunks.length > 0) {
        const transcription = chunks.map((chunk) => chunk.transcription)

        answer = await generateAnswer(question, transcription)
      }

      const result = await db
        .insert(schema.questions)
        .values({
          roomId,
          question,
          answer,
        })
        .returning()

      const insertedQuestion = result[0]

      if (!insertedQuestion) {
        throw new Error('Room not created')
      }

      return reply.status(201).send({ questionId: insertedQuestion.id, answer })
    }
  );
}
