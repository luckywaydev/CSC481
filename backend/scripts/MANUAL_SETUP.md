# วิธีสร้าง Database แบบ Manual 

## ขั้นตอน

### 1. เปิด Command Prompt

```bash

cd backend
```

### 2. เปิด psql

```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

จะถูกถามรหัสผ่าน → ใส่รหัสผ่าน postgres

### 3. Commands สร้าง Database, User และ กำหนดสิทธิ์

```sql
CREATE DATABASE transcription_db;
```

```sql
CREATE USER transcription_user WITH PASSWORD 'Transcription@2025';
```

```sql
GRANT ALL PRIVILEGES ON DATABASE transcription_db TO transcription_user;
```

```sql
\c transcription_db
```

```sql
GRANT ALL ON SCHEMA public TO transcription_user;
```

```sql
\l
```

```sql
\du
```

```sql
\q
```

### 4. อัปเดต .env file

```bash
# สร้าง .env
copy .env.example .env
```

แก้ไข `.env`:
```env
DATABASE_URL=postgresql://P@assword:Transcription@2025@localhost:5432/transcription_db
```

### 5. ทดสอบการเชื่อมต่อ

```bash
npm run db:test
```

ควรเห็น: `✅ Database connection successful!`

### 6. Push Schema

```bash
npm run prisma:push
```

### 7. Seed ข้อมูล

```bash
npm run db:seed
```

### 8. เปิด Prisma Studio

```bash
npm run prisma:studio
```

---

## ผลลัพธ์ที่คาดหวัง

หลังจากทำตามขั้นตอนข้างบน คุณจะมี:

- ✅ Database: `transcription_db`
- ✅ User: `P@assword` 
- ✅ Password: `Transcription@2025`
- ✅ 3 Roles (admin, free, pro)
- ✅ 3 Role Settings
- ✅ 1 Admin User (admin@transcription.local / Admin@123)
- ✅ 4 Tables (users, roles, role_settings, user_settings)

---

## ตรวจสอบว่าสำเร็จ

```bash
# ทดสอบ connection
npm run db:test

# เปิด Prisma Studio ดูข้อมูล
npm run prisma:studio
```

เปิดเบราว์เซอร์ไปที่ http://localhost:5555 จะเห็นข้อมูลทั้งหมด
