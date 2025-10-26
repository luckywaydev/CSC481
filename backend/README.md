# เชื่อม database ได้แล้ว

ตอนนี้เชื่อม PostgreSQL ได้แล้ว ใช้ Prisma เป็น ORM

## ทำอะไรไปบ้าง

- ติดตั้ง Prisma
- สร้าง schema.prisma (ยังไม่มี model)
- สร้าง Prisma Client
- ตั้งค่า DATABASE_URL

## วิธีใช้

1. สร้าง database ใน PostgreSQL
```sql
CREATE DATABASE transcription_db;
CREATE USER transcription_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE transcription_db TO transcription_user;
```

2. สร้าง .env
```
DATABASE_URL="postgresql://transcription_user:your_password@localhost:5432/transcription_db"
```

3. Generate Prisma Client
```bash
npm run prisma:generate
```

## ปัญหาที่เจอ

- ไม่รู้ว่าจะใช้ ORM ไหม
  - เลือก Prisma เพราะใช้ง่าย
  - มี TypeScript support ดี
  
- ติดตั้ง PostgreSQL ยุ่งยาก
  - ต้องสร้าง database และ user
  - ต้องตั้งค่า permissions

## ต่อไปจะทำอะไร

- สร้าง database models
- ทำ auth service
- ทำ API endpoints
