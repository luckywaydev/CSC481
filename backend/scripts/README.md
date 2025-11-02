## สร้าง Database

### วิธีที่ 1: ใช้ Batch

```bash
# รันจาก backend folder
scripts\setup-database.bat
```

ใส่รหึสผ่าน postgres ที่ตั้งไว้ตอนติดตั้ง

### วิธีที่ 2: รันคำสั่งทีละบรรทัด

```bash
# 1. เปิด psql
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres

# 2. Copy-paste คำสั่งนี้ใน :
CREATE DATABASE transcription_db;
CREATE USER transcription_user WITH PASSWORD 'Transcription@2025';
GRANT ALL PRIVILEGES ON DATABASE transcription_db TO transcription_user;
\c transcription_db
GRANT ALL ON SCHEMA public TO transcription_user;
\q
```

transcription_db คือชื่อ db
transcription_user คือชื่อ user
Transcription@2025 คือ password ของ db
   
### วิธีที่ 3: ใช้ pgAdmin 4

1. เปิด pgAdmin 4
2. เชื่อมต่อกับ PostgreSQL Server
3. Right-click "Databases" → Create → Database
   - Database name: `transcription_db`
4. Right-click "Login/Group Roles" → Create → Login/Group Role
   - Name: `transcription_user`
   - Password: `Transcription@2025`
   - Privileges: Can login
5. Right-click `transcription_db` → Properties → Security
   - Add `transcription_user` with ALL privileges

## หลังจากสร้าง Database แล้ว

### 1. อัปเดต .env file

```env
DATABASE_URL=postgresql://transcription_user:Transcription@2025@localhost:5432/transcription_db
```

### 2. ทดสอบการเชื่อมต่อ

```bash
npm run db:test
```

ควรเห็น: `✅ Database connection successful!`

### 3. Push Schema to Database

```bash
npm run prisma:push
```

### 4. Seed ข้อมูลเริ่มต้น

```bash
npm run db:seed
```

### 5. เปิด Prisma Studio

```bash
npm run prisma:studio
```

## Troubleshooting

### ปัญหา: psql not found

**วิธีแก้**: เพิ่ม PostgreSQL bin เข้า PATH

```powershell
# เปิด PowerShell ด้วย Administrator เด้อ
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"
[Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)
```

### ปัญหา: Password authentication failed

**วิธีแก้**: ตรวจสอบรหัสผ่านใน DATABASE_URL

### ปัญหา: Database already exists

**วิธีแก้**: ลบ database เก่าก่อน

```sql
DROP DATABASE IF EXISTS transcription_db;
```

## ไฟล์ในโฟลเดอร์นี้

- `setup-database.sql` - SQL script สำหรับสร้าง database
- `setup-database.bat` - Batch script (Windows)
- `setup-database.ps1` - PowerShell script (Windows)
- `README.md` - เอกสารนี้
