import { reset, seed } from 'drizzle-seed'
import { db, sql } from './connection.ts'
import { schema } from './schema/index.ts'

await reset(db, schema)
await seed(db, schema).refine(f => {
  return {
    rooms: {
      count: 20,
      columns: {
        name: f.companyName(),
        description: f.country()
      },
      questions: {
        count: 10
      }
    }
  }
})

await sql.end()

// biome-ignore lint/suspicious/noConsole: <explanation>
console.info('Database seeded!')
