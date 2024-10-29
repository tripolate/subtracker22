import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Try to query the database
    const result = await prisma.user.count();
    console.log('Successfully connected to the database!');
    console.log(`Current user count: ${result}`);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();