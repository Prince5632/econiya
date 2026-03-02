import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Required for Supabase's self-signed certificate chain
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = process.env.DATABASE_URL!;

// Parse URL manually to handle special characters (e.g. %40) in password
const url = new URL(connectionString);
const pool = new Pool({
    host: url.hostname,
    port: parseInt(url.port || '5432', 10),
    database: url.pathname.slice(1),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
    // Resilience settings
    max: 10,                        // max pool size
    idleTimeoutMillis: 30_000,      // close idle connections after 30s
    connectionTimeoutMillis: 10_000, // fail if can't connect in 10s
    allowExitOnIdle: true,          // allow process exit when pool is idle
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
