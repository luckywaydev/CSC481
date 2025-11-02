## ขั้นตอนที่ 1: ติดตั้ง PostgreSQL

```bash

sudo su //ไปก่อนเลยก็ได้จบๆ

sudo apt update && sudo apt upgrade -y

# ติดตั้ง PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# ตรวจสอบ
psql --version

# ตรวจสอบว่า service รันอยู่
sudo systemctl status postgresql

# ถ้ายังไม่รัน ให้ start
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## ขั้นตอนที่ 2: สร้าง Database และ User

```bash
# เข้าสู่ PostgreSQL ด้วย user postgres
sudo -u postgres psql

```

**ใน PostgreSQL prompt รันคำสั่งนี้:**

```sql
-- สร้าง database
CREATE DATABASE transcription_db;

-- สร้าง user
CREATE USER transcription_user WITH PASSWORD 'csc481';

-- ให้สิทธิ์
GRANT ALL PRIVILEGES ON DATABASE transcription_db TO transcription_user;

-- ใน PostgreSQL 15+ ต้องให้สิทธิ์เพิ่ม
\c transcription_db
GRANT ALL ON SCHEMA public TO transcription_user;

-- ตรวจสอบ
\l  -- ดู database ทั้งหมด
\du -- ดู user ทั้งหมด

-- ออกจาก PostgreSQL
\q
```

## ขั้นตอนที่ 3: ทดสอบ Connection

```bash
# ทดสอบเชื่อมต่อด้วย user ที่สร้าง
psql -U transcription_user -d transcription_db -h localhost

# ถ้าขึ้น password ให้ใส่: csc481
# ถ้าเข้าได้ แสดงว่าสำเร็จ

# ออกจาก psql
\q
```

## ขั้นตอนที่ 4: แก้ไข pg_hba.conf (ถ้าเชื่อมต่อไม่ได้)

```bash
# หา path ของ pg_hba.conf
sudo -u postgres psql -c "SHOW hba_file;"

# แก้ไขไฟล์ 
sudo nano /etc/postgresql/14/main/pg_hba.conf

# หาบรรทัดที่มี "local all all peer"
# เปลี่ยนเป็น:
local   all             all                                     md5

# หรือเพิ่มบรรทัดนี้ (ถ้าไม่มี)
host    transcription_db    transcription_user    127.0.0.1/32    md5


# Restart PostgreSQL
sudo systemctl restart postgresql
```

## ขั้นตอนที่ 5: แก้ไข Backend .env

```bash
cd ~/csc481/backend

# แก้ไข .env
nano .env
```

**ใส่ค่านี้:**

```env
# Database Configuration
DATABASE_URL="postgresql://transcription_user:csc481@localhost:5432/transcription_db"

# หรือถ้า PostgreSQL อยู่คนละเครื่อง
# DATABASE_URL="postgresql://transcription_user:csc481@VPS_IP:5432/transcription_db"
```

## ขั้นตอนที่ 6: Setup Database Schema

```bash
cd ~/csc481/backend

# ติดตั้ง dependencies (ถ้ายังไม่ได้ติดตั้ง)
npm install

# Generate Prisma Client
npx prisma generate

# Push schema ไป database
npx prisma db push

# Seed ข้อมูลเริ่มต้น (roles, admin user, AI models)
npx prisma db seed
```

## ขั้นตอนที่ 7: ทดสอบ

```bash
# ทดสอบ connection
cd ~/csc481/backend
npm run db:test

# หรือรัน backend
npm run dev

# ถ้าเห็น "🚀 Server is running" แสดงว่าสำเร็จ
```

---

## แก้ไขปัญหาท

### Error: "password authentication failed"

**เพราะ:** Password ไม่ถูกต้อง หรือ pg_hba.conf ไม่ถูกต้อง

**แก้ไข:**
```bash
# Reset password
sudo -u postgres psql
ALTER USER transcription_user WITH PASSWORD 'csc481';
\q

# แก้ pg_hba.conf (ดูขั้นตอนที่ 4)
```

### Error: "database does not exist"

**เพราะ:** ยังไม่ได้สร้าง database

**แก้ไข:**
```bash
sudo -u postgres psql
CREATE DATABASE transcription_db;
\q
```

### Error: "role does not exist"

**เพราะ:** ยังไม่ได้สร้าง user

**แก้ไข:**
```bash
sudo -u postgres psql
CREATE USER transcription_user WITH PASSWORD 'csc481';
GRANT ALL PRIVILEGES ON DATABASE transcription_db TO transcription_user;
\q
```

### Error: "connection refused"

**เพราะ:** PostgreSQL ไม่ได้รัน

**แก้ไข:**
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

### Error: "Prisma Client not generated"

**เพราะ:** ยังไม่ได้ generate Prisma Client

**แก้ไข:**
```bash
cd ~/csc481/backend
npx prisma generate
```

---

## Checklist

- [ ] ติดตั้ง PostgreSQL แล้ว
- [ ] PostgreSQL service รันอยู่
- [ ] สร้าง database `transcription_db` แล้ว
- [ ] สร้าง user `transcription_user` แล้ว
- [ ] ให้สิทธิ์ user แล้ว
- [ ] ทดสอบ connection ได้
- [ ] แก้ไข backend/.env แล้ว
- [ ] รัน `npx prisma generate` แล้ว
- [ ] รัน `npx prisma db push` แล้ว
- [ ] รัน `npx prisma db seed` แล้ว
- [ ] Backend รันได้แล้ว

---

## คำสั่งสรุป

```bash
# 1. ติดตั้ง PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 2. สร้าง database และ user
sudo -u postgres psql << EOF
CREATE DATABASE transcription_db;
CREATE USER transcription_user WITH PASSWORD 'csc481';
GRANT ALL PRIVILEGES ON DATABASE transcription_db TO transcription_user;
\c transcription_db
GRANT ALL ON SCHEMA public TO transcription_user;
EOF

# 3. ทดสอบ connection
psql -U transcription_user -d transcription_db -h localhost -c "SELECT 1;"

# 4. Setup backend
cd ~/csc481/backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed

# 5. รัน backend
npm run dev
```

