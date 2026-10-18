import { defineConfig, env } from 'prisma/config';

try {
  process.loadEnvFile();
} catch {
  process.env.DATABASE_URL ??= '';
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
