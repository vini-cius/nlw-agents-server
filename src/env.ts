import { z } from 'zod/v4'

const schema = z.object({
  SERVER_PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.url().startsWith('postgresql://'),
  GOOGLE_GENAI_API_KEY: z.string(),
})

export const env = schema.parse(process.env)
