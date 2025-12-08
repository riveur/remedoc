import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import env from '#start/env'

const pool = new Pool({
  connectionString: env.get('DATABASE_URL'),
})

export const db = drizzle({ client: pool })
