import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// 1. Create an adapter with your connection string
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// 2. Pass the adapter to PrismaClient
const prisma = new PrismaClient({ adapter });

export default prisma;