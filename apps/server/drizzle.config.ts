import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './apps/server/drizzle',
  schema: './apps/server/app/core/services/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
