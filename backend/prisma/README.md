# Prisma Migrations

Prisma schema และ migration files

## ไฟล์

- `schema.prisma` - Database schema definition
- `migrations/` - Migration history (generated)

## คำสั่ง

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and run migration
npm run prisma:migrate

# Push schema to database (without migration)
npm run prisma:push

# Open Prisma Studio (GUI)
npm run prisma:studio
```

- อย่าแก้ migration files ที่ถูกสร้างแล้ว
- ต้อง commit migration files เข้า git
- ใช้ `prisma:migrate` สำหรับ prod
- ใช้ `prisma:push` สำหรับ test
