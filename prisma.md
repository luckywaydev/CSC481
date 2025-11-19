### จำยากนักนะมึง

### เปิด Prisma Studio
```bash
cd backend
npx prisma studio
```
เปิด browser: `http://localhost:5555`

### Generate Prisma Client
```bash
npx prisma generate
```

### Push Schema to Database (Development)
```bash
npx prisma db push
```

### Create Migration (Production)
```bash
npx prisma migrate dev --name migration_name
```

### Deploy Migration
```bash
npx prisma migrate deploy
```

### Reset Database (ระวัง! ข้อมูลหายหมด)
```bash
npx prisma migrate reset
```

### Seed Database
```bash
npx prisma db seed
```

---

## 🪟 PostgreSQL Commands - Windows

### เข้า PostgreSQL
```
psql -U postgres
```
```
psql -U transcription_user -d transcription_db -h localhost
```

### ดูรายชื่อ Database ทั้งหมด
```sql
\l
-- หรือ
\list
```

### ดูรายชื่อ Users ทั้งหมด
```sql
\du
-- หรือ
\du+
```

### เข้าใช้งาน Database
```sql
\c transcription_db
-- หรือ
\connect transcription_db
```

### ดูตารางทั้งหมด
```sql
\dt
-- หรือ
\dt+
```

### ดู Structure ของตาราง
```sql
\d "Users"
-- หรือ
\d+ "Users"
```

## ดู table

```
SELECT * FROM "users";
```

### ออกจาก psql
```sql
\q
-- หรือ
exit
```

### รัน SQL Command จาก CMD โดยตรง
```cmd
# ดูข้อมูล User
psql -U postgres -d transcription_db -c "SELECT * FROM "Users";"

# นับจำนวน users
psql -U postgres -d transcription_db -c "SELECT COUNT(*) FROM "Users";"

# ดู user ล่าสุด 5 คน

```psql -U postgres -d transcription_db -c "SELECT * FROM "Users" ORDER BY id DESC LIMIT 5;"

### Backup Database
```cmd
# Backup ทั้ง database
pg_dump -U postgres -d transcription_db -F c -f backup.dump

# Backup เฉพาะ schema
pg_dump -U postgres -d transcription_db -s -f schema.sql

# Backup เฉพาะข้อมูล
pg_dump -U postgres -d transcription_db -a -f data.sql
```

### Restore Database
```cmd
# Restore จาก dump file
pg_restore -U postgres -d transcription_db backup.dump

# Restore จาก SQL file
psql -U postgres -d transcription_db -f backup.sql
```

---

## 🐧 PostgreSQL Commands - Linux

### เข้า PostgreSQL
```bash
# เข้าแบบ postgres user
sudo -u postgres psql

# เข้าด้วย user อื่น
psql -U transcription_user -d transcription_db -h localhost

# เข้าแบบระบุ password
PGPASSWORD=your_password psql -U transcription_user -d transcription_db -h localhost
```

### ดูรายชื่อ Database ทั้งหมด
```sql
\l
-- หรือ
\list
```

### ดูรายชื่อ Users ทั้งหมด
```sql
\du
-- หรือ
\du+
```

### เข้าใช้งาน Database
```sql
\c transcription_db
-- หรือ
\connect transcription_db
```

### ดูตารางทั้งหมด
```sql
\dt
-- หรือ
\dt+
```

### ดู Structure ของตาราง
```sql
\d "Users"
-- หรือ
\d+ "Users"
```

### ออกจาก psql
```sql
\q
-- หรือ
exit
```

### รัน SQL Command จาก Terminal โดยตรง
```bash
# ดูข้อมูล User
sudo -u postgres psql -d transcription_db -c "SELECT * FROM "Users";"

# นับจำนวน users
sudo -u postgres psql -d transcription_db -c "SELECT COUNT(*) FROM "Users";"

# ดู user ล่าสุด 5 คน
sudo -u postgres psql -d transcription_db -c "SELECT * FROM "Users" ORDER BY id DESC LIMIT 5;"
```

### Backup Database
```bash
# Backup ทั้ง database
sudo -u postgres pg_dump -d transcription_db -F c -f backup.dump

# Backup เฉพาะ schema
sudo -u postgres pg_dump -d transcription_db -s -f schema.sql

# Backup เฉพาะข้อมูล
sudo -u postgres pg_dump -d transcription_db -a -f data.sql
```

### Restore Database
```bash
# Restore จาก dump file
sudo -u postgres pg_restore -d transcription_db backup.dump

# Restore จาก SQL file
sudo -u postgres psql -d transcription_db -f backup.sql
```

### จัดการ PostgreSQL Service
```bash
# เช็คสถานะ
sudo systemctl status postgresql

# Start service
sudo systemctl start postgresql

# Stop service
sudo systemctl stop postgresql

# Restart service
sudo systemctl restart postgresql

# Enable auto-start
sudo systemctl enable postgresql
```

---

## ดูข้อมูลใน Database

### SQL Queries ที่ใช้บ่อย

#### ดูข้อมูล Users
```sql
-- ดูทั้งหมด
SELECT * FROM "Users";

-- ดูเฉพาะบางคอลัมน์
SELECT id, email, username FROM "User";

-- ดูพร้อม Role
SELECT u.id, u.email, u.username, r.name as role 
FROM "Users" u 
JOIN "Role" r ON u."roleId" = r.id;

-- นับจำนวน
SELECT COUNT(*) FROM "Users";

-- ดู user ล่าสุด
SELECT * FROM "Users" ORDER BY "createdAt" DESC LIMIT 5;

-- ค้นหา user
SELECT * FROM "Users" WHERE email LIKE '%test%';
```

#### ดูข้อมูล Roles
```sql
-- ดูทั้งหมด
SELECT * FROM "Role";

-- นับจำนวน users ในแต่ละ role
SELECT r.name, COUNT(u.id) as user_count
FROM "Role" r
LEFT JOIN "Users" u ON r.id = u."roleId"
GROUP BY r.id, r.name;
```

#### ดูข้อมูล Projects
```sql
-- ดูทั้งหมด
SELECT * FROM "Project";

-- ดูพร้อม user ที่เป็นเจ้าของ
SELECT p.id, p.name, p.slug, u.username as owner
FROM "Project" p
JOIN "Users" u ON p."userId" = u.id;

-- นับจำนวน projects ของแต่ละ user
SELECT u.username, COUNT(p.id) as project_count
FROM "Users" u
LEFT JOIN "Project" p ON u.id = p."userId"
GROUP BY u.id, u.username;
```

#### ดูข้อมูล Transcripts
```sql
-- ดูทั้งหมด
SELECT * FROM "Transcript";

-- ดูพร้อม project
SELECT t.id, t.language, p.name as project_name
FROM "Transcript" t
JOIN "Project" p ON t."projectId" = p.id;
```

---

## 🔍 คำสั่งเพิ่มเติม

### ดูขนาด Database
```sql
-- ขนาดของแต่ละ database
SELECT 
    datname as database_name,
    pg_size_pretty(pg_database_size(datname)) as size
FROM pg_database
ORDER BY pg_database_size(datname) DESC;

-- ขนาดของแต่ละตาราง
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### ดู Active Connections
```sql
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query
FROM pg_stat_activity
WHERE datname = 'transcription_db';
```

### Kill Connection
```sql
-- Kill connection ที่ระบุ
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'transcription_db' AND pid <> pg_backend_pid();
```

---

## Quick 

### เปิด Prisma Studio
```bash
npx prisma studio
```

### ดูข้อมูล (Windows)
```cmd
psql -U postgres -d transcription_db -c "SELECT * FROM "Users";"
```

### ดูข้อมูล (Linux)
```bash
sudo -u postgres psql -d transcription_db -c "SELECT * FROM "Users";"
```

### Backup (Windows)
```cmd
pg_dump -U postgres -d transcription_db -F c -f backup.dump
```

### Backup (Linux)
```bash
sudo -u postgres pg_dump -d transcription_db -F c -f backup.dump
```
