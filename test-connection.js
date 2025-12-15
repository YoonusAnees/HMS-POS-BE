// test-connection.js
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

async function test() {
  let prisma;
  
  try {
    // Create adapter with your database URL
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    
    // Pass adapter to PrismaClient
    prisma = new PrismaClient({ adapter });
    
    console.log('Testing connection with Driver Adapter...');
    await prisma.$connect();
    console.log('✅ Connected to database!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('Database version:', result[0].version);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

test();