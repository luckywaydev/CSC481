/**
 * ไฟล์: testConnection.ts
 *
 * คำอธิบาย:
 * Script สำหรับทดสอบการเชื่อมต่อ PostgreSQL Database
 * - ตรวจสอบว่า DATABASE_URL ถูกต้อง
 * - ทดสอบการเชื่อมต่อกับ database
 * - แสดงข้อมูล database version
 *
 * วิธีรัน:
 * ```bash
 * npx ts-node src/utils/testConnection.ts
 * ```
 *
 * Author: Backend Team
 * Created: 2025-10-24
 */

import { prisma } from './prisma';
import dotenv from 'dotenv';

// โหลด environment variables
dotenv.config();

/**
 * ฟังก์ชันทดสอบการเชื่อมต่อ database
 */
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');

  try {
    // ตรวจสอบว่ามี DATABASE_URL หรือไม่
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in .env file');
    }

    console.log('📝 DATABASE_URL:', maskDatabaseUrl(process.env.DATABASE_URL));
    console.log('');

    // ทดสอบการเชื่อมต่อด้วย $queryRaw
    console.log('🔌 Connecting to database...');
    const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;

    console.log('✅ Database connection successful!\n');

    // แสดงข้อมูล PostgreSQL version
    if (result && result.length > 0) {
      console.log('📊 Database Information:');
      console.log('   Version:', result[0].version);
      console.log('');
    }

    // ทดสอบการ query ตาราง (ถ้ามี)
    console.log('🔍 Checking database tables...');
    const tables = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;

    if (tables.length === 0) {
      console.log('⚠️  No tables found. Run migrations to create tables.');
      console.log('   Command: npm run prisma:migrate');
    } else {
      console.log(`✅ Found ${tables.length} table(s):`);
      tables.forEach((table) => {
        console.log(`   - ${table.tablename}`);
      });
    }

    console.log('\n✨ Database test completed successfully!');
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('');

    if (error instanceof Error) {
      console.error('Error:', error.message);
      console.error('');

      // แสดงคำแนะนำการแก้ไข
      if (error.message.includes('DATABASE_URL')) {
        console.error('💡 Solution:');
        console.error('   1. Create .env file from .env.example');
        console.error('   2. Set DATABASE_URL in .env file');
        console.error('   3. Format: postgresql://user:password@localhost:5432/database');
      } else if (error.message.includes('connect')) {
        console.error('💡 Possible causes:');
        console.error('   1. PostgreSQL is not running');
        console.error('   2. Wrong database credentials');
        console.error('   3. Database does not exist');
        console.error('   4. Firewall blocking connection');
        console.error('');
        console.error('💡 Solutions:');
        console.error('   1. Start PostgreSQL: (Windows) services.msc → postgresql');
        console.error('   2. Check DATABASE_URL in .env');
        console.error(
          '   3. Create database: psql -U postgres -c "CREATE DATABASE transcription_db"'
        );
      }
    }

    process.exit(1);
  } finally {
    // ปิด connection
    await prisma.$disconnect();
  }
}

/**
 * ฟังก์ชันซ่อนรหัสผ่านใน DATABASE_URL
 * @param url - DATABASE_URL
 * @returns URL ที่ซ่อนรหัสผ่าน
 */
function maskDatabaseUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    if (urlObj.password) {
      urlObj.password = '****';
    }
    return urlObj.toString();
  } catch {
    return url.replace(/:([^@]+)@/, ':****@');
  }
}

// รันฟังก์ชันทดสอบ
testDatabaseConnection();
