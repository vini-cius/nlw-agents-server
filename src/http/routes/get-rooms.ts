import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { db } from '../../db/connection.ts';
import { schema } from '../../db/schema/index.ts';

export function getRooms(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/rooms',
    {
      schema: {
        tags: ['Rooms'],
        summary: 'Get all rooms',
        response: {
          200: z.object({
            rooms: z.array(z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().nullable(),
              createdAt: z.date(),
            })),
          }),
        },
      },
    },
    async () => {
      const rooms = await db.select({
        id: schema.rooms.id,
        name: schema.rooms.name,
        description: schema.rooms.description,
        createdAt: schema.rooms.createdAt
      }).from(schema.rooms).orderBy(schema.rooms.createdAt);

      return {
        rooms
      }
    }
  );
}
