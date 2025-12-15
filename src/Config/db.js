import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

// Create Prisma adapter with connection string
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Pass adapter to PrismaClient
const prisma = new PrismaClient({ adapter, log: ['error'] });

export default prisma;
