import { db } from '../../db/connection.ts';
import { generateEmbeddings, transcribeAudio } from '../../services/gemini.ts';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { schema } from '../../db/schema/index.ts';


export function uploadAudio(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/rooms/:roomId/audio',
    {
      schema: {
        tags: ['Rooms'],
        summary: 'Upload audio',
        params: z.object({
          roomId: z.string(),
        }),
        response: {
          201: z.object({
            chunkId: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { roomId } = request.params

      const audio = await request.file();

      if (!audio) {
        throw new Error('Audio not found')
      }

      const audioBuffer = await audio.toBuffer();
      const audioAsBase64 = audioBuffer.toString('base64');

      const transcription = await transcribeAudio(audioAsBase64, audio.mimetype)
      const embeddings = await generateEmbeddings(transcription)

      const result = await db.insert(schema.audioChunks)
        .values({
          roomId,
          embeddings,
          transcription
        }).returning()

      const chunk = result[0]

      if (!chunk) {
        throw new Error('Chunk not created')
      }

      return reply.status(201).send({
        chunkId: chunk.id
      })
    }
  );
}
