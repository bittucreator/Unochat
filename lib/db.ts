// lib/db.ts
// Neon.tech Postgres client setup for Next.js Edge/Serverless
import { neon } from '@neondatabase/serverless';

// Use environment variable for connection string
const sql = neon(process.env.DATABASE_URL!);

export { sql };
