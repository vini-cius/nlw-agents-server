import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/schema/index.ts';

export function createRoom(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/rooms',
    {
      schema: {
        tags: ['Rooms'],
        summary: 'Create a room',
        body: z.object({
          name: z.string().min(3),
          description: z.string().optional(),
        }),
        response: {
          201: z.object({
            roomId: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name, description } = request.body

      const result = await db.insert(schema.rooms).values({
        name,
        description,
      }).returning()

      const insertedRoom = result[0]

      if (!insertedRoom) {
        throw new Error('Room not created')
      }

      return reply.status(201).send({ roomId: insertedRoom.id })
    }
  );
}
