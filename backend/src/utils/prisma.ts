/**
 * ไฟล์: prisma.ts
 *
 * คำอธิบาย:
 * Prisma Client Singleton Instance
 * - สร้าง PrismaClient instance เพียงครั้งเดียว
 * - ใช้ร่วมกันทั้งแอปพลิเคชัน
 * - จัดการ connection pooling อัตโนมัติ
 * - ปิด connection เมื่อแอปพลิเคชันหยุดทำงาน
 *
 * การใช้งาน:
 * ```typescript
 * import { prisma } from '@/utils/prisma';
 *
 * const users = await prisma.user.findMany();
 * ```
 *
 * Author: Backend Team
 * Created: 2025-10-24
 */

import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Configuration
 * - log: กำหนดระดับ logging
 * - errorFormat: รูปแบบการแสดง error
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    errorFormat: 'pretty',
  });
};

/**
 * Global Prisma Instance
 * ใช้ global object เพื่อป้องกันการสร้าง instance ซ้ำใน development
 * (Hot reload ใน development จะสร้าง instance ใหม่ทุกครั้ง)
 */
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

/**
 * Prisma Client Instance
 * - ใช้ global instance ถ้ามี (development)
 * - สร้างใหม่ถ้าไม่มี (production)
 */
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

/**
 * เก็บ instance ไว้ใน global object (development only)
 * เพื่อป้องกันการสร้าง connection ใหม่ทุกครั้งที่ hot reload
 */
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

/**
 * Graceful Shutdown Handler
 * ปิด database connection เมื่อแอปพลิเคชันหยุดทำงาน
 */

/**
 * Error Handler
 * จัดการ error เมื่อไม่สามารถปิด connection ได้
 * หมายเหตุ: ใน development mode nodemon จะจัดการ restart เอง
 */
if (process.env.NODE_ENV === 'production') {
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, closing database connection...');
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, closing database connection...');
    await prisma.$disconnect();
    process.exit(0);
  });
}
