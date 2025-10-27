// Seed data - ข้อมูลเริ่มต้น
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // สร้าง roles
    await prisma.role.createMany({
        data: [
            { id: 1, name: 'admin'},
            { id: 2, name: 'free'},
            { id: 3, name: 'pro'},
        ],
    });

    console.log('✅ Seed data created');
}

main()
.catch((e) => {
    console.error(e);
    process.exit(1);
})
.finally(async () => {
    await prisma.$disconnect();
});