import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { env } from '../env.ts'
import { errorHandler } from './error-handler.ts'
import { getRooms } from './routes/get-rooms.ts'
import { createRoom } from './routes/create-room.ts'
import { getRoomQuestions } from './routes/get-room-questions.ts'
import { createQuestion } from './routes/create-question.ts'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: 'http://localhost:5173',
})

app.register(fastifyHelmet)

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Agents API',
      description: 'API for Agents',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
  uiConfig: {
    deepLinking: false,
    filter: true,
  },
  theme: {
    title: 'Agents API',
  },
})

app.register(getRooms)
app.register(createRoom)
app.register(getRoomQuestions)
app.register(createQuestion)

app.listen({ port: env.SERVER_PORT })
