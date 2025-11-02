#!/bin/bash

# Script สำหรับ Setup Database บน VPS
# รันด้วย: bash setup-database.sh

echo "🗄️  Starting Database Setup..."
echo ""

# ขั้นตอนที่ 1: ตรวจสอบว่า PostgreSQL รันอยู่ไหม
echo "📌 Step 1: Checking PostgreSQL status..."
sudo systemctl status postgresql --no-pager | grep "Active:"
if [ $? -ne 0 ]; then
    echo "❌ PostgreSQL is not running!"
    echo "Starting PostgreSQL..."
    sudo systemctl start postgresql
fi
echo "✅ PostgreSQL is running"
echo ""

# ขั้นตอนที่ 2: สร้าง Database และ User (ถ้ายังไม่มี)
echo "📌 Step 2: Creating database and user..."
sudo -u postgres psql << EOF
-- ลองสร้าง database (ถ้ามีอยู่แล้วจะ error แต่ไม่เป็นไร)
CREATE DATABASE transcription_db;

-- ลองสร้าง user (ถ้ามีอยู่แล้วจะ error แต่ไม่เป็นไร)
CREATE USER transcription_user WITH PASSWORD 'csc481';

-- ให้สิทธิ์
GRANT ALL PRIVILEGES ON DATABASE transcription_db TO transcription_user;

-- เชื่อมต่อ database
\c transcription_db

-- ให้สิทธิ์ schema (สำหรับ PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO transcription_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO transcription_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO transcription_user;

-- แสดงผลลัพธ์
\l
\du
EOF
echo "✅ Database and user created"
echo ""

# ขั้นตอนที่ 3: ทดสอบ Connection
echo "📌 Step 3: Testing database connection..."
PGPASSWORD=csc481 psql -U transcription_user -d transcription_db -h localhost -c "SELECT 1 AS test;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo "Please check your PostgreSQL configuration"
    exit 1
fi
echo ""

# ขั้นตอนที่ 4: Generate Prisma Client
echo "📌 Step 4: Generating Prisma Client..."
npx prisma generate
if [ $? -eq 0 ]; then
    echo "✅ Prisma Client generated"
else
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi
echo ""

# ขั้นตอนที่ 5: Push Schema to Database
echo "📌 Step 5: Pushing schema to database..."
npx prisma db push --accept-data-loss
if [ $? -eq 0 ]; then
    echo "✅ Schema pushed successfully"
else
    echo "❌ Failed to push schema"
    exit 1
fi
echo ""

# ขั้นตอนที่ 6: Seed Data
echo "📌 Step 6: Seeding initial data..."
npx prisma db seed
if [ $? -eq 0 ]; then
    echo "✅ Data seeded successfully"
else
    echo "❌ Failed to seed data"
    exit 1
fi
echo ""

echo "🎉 Database setup completed!"
echo ""
echo "📊 Summary:"
echo "  - Database: transcription_db"
echo "  - User: transcription_user"
echo "  - Password: csc481"
echo "  - Tables: Created ✅"
echo "  - Seed Data: Inserted ✅"
echo ""
echo "🚀 You can now start the backend server:"
echo "   npm run dev"
