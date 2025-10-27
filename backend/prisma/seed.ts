// seed.ts - ใส่ข้อมูลเริ่มต้นใน database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 เริ่ม seed database...')

    // ลบข้อมูลเก่าออกก่อน (ถ้ามี)
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    console.log('✅ ลบข้อมูลเก่าเสร็จ')

    //สร้าง roles พื้นฐาน 3 แบบ
    const adminRole = await prisma.role.create({
        data: {
            name: 'admin', //ผู้ดูแลระบบ
        },
    });

    const freeRole = await prisma.role.create({
        data: {
            name: 'free', // ผู้ใช้ฟรี
        },
    });

    const proRole = await prisma.role.create({
        data: {
            name: 'pro', // ผู้ใช้แบบเสียเงน
        },
    });

    console.log('✅ สร้าง roles เสร็จ', { adminRole, freeRole, proRole });

    // สร้าง admin user ตัวอย่าง สำหรับทดสอบ
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456', // password: admin123 (hash แล้ว)
            username: 'Admin',
            roleId: adminRole.id,
        },
    });

    console.log('✅ สร้าง admin user เสร็จ', adminUser);

    //สร้าง free user ตัวอย่าง
    const freeUser = await prisma.user.create({
        data: {
            email: 'user@example.com',
            password: '$2b$10$abcdefghijklmnopqrstuvwxyz123456', // password: user123 (hash แล้ว)
            username: 'Free User',
            roleId: freeRole.id,
        },
    });

    console.log('✅ สร้าง free user เสร็จ', freeUser);

    console.log('🎉 Seed database เสร็จสมบูรณ์!')
}

//รัน main function
main()
    .catch((e) => {
        console.error('❌ เกดข้อผิดพลาด', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect(); // ปิด connection
    });