// test-connection.js
import dotenv from 'dotenv';
dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

import { PrismaClient } from '@prisma/client';

async function test() {
  let prisma;
  
  try {
    // Simple constructor - no extra options needed
    prisma = new PrismaClient();
    
    console.log('Testing connection...');
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