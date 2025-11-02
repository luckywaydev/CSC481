# ระบบถอดเสียงและแปลภาษา - Backend API

Backend API สำหรับระบบถอดเสียงและแปลภาษา พัฒนาด้วย Node.js, Express, และ TypeScript

## 📋 คำอธิบาย

Backend API นี้ให้บริการ:
- ระบบ Authentication (Register, Login, JWT)
- จัดการโปรเจกต์และไฟล์เสียง
- ถอดเสียงเป็นข้อความพร้อม timestamp
- แปลข้อความเป็นภาษาอื่น
- จัดการผู้พูด (Speaker)
- ระบบ Admin Dashboard
- Queue System สำหรับงานประมวลผล

## 🛠️ เทคโนโลยีที่ใช้

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma / TypeORM (จะเลือกในภายหลัง)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Queue**: Redis + Bull (จะเพิ่มในภายหลัง)

## 📦 โปรแกรมที่ต้องติดตั้ง

ก่อนเริ่มต้น ต้องติดตั้งโปรแกรมเหล่านี้:

- **Node.js**: เวอร์ชัน 18.17 ขึ้นไป
  - ดาวน์โหลดได้ที่: https://nodejs.org/
  - ตรวจสอบเวอร์ชัน: `node --version`

- **PostgreSQL**: เวอร์ชัน 14 ขึ้นไป
  - ดาวน์โหลดได้ที่: https://www.postgresql.org/download/
  - ตรวจสอบเวอร์ชัน: `psql --version`

- **npm** หรือ **yarn**:
  - npm มาพร้อมกับ Node.js
  - yarn: `npm install -g yarn`

## 🚀 การติดตั้งและรันโปรเจกต์

### 1. Clone Repository

```bash
git clone <repository-url>
cd backend
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ติดตั้ง PostgreSQL

**สำคัญ**: ต้องติดตั้ง PostgreSQL ก่อนจึงจะรัน Backend ได้

ดูวิธีติดตั้งใน [DATABASE.md](./DATABASE.md#การติดตั้ง-postgresql)

### 4. สร้าง Database

```bash
# เข้าสู่ PostgreSQL
psql -U postgres

# สร้าง database และ user
CREATE DATABASE transcription_db;
CREATE USER transcription_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE transcription_db TO transcription_user;
\q
```

ดูรายละเอียดเพิ่มเติมใน [DATABASE.md](./DATABASE.md#การสร้าง-database-และ-user)

### 5. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` จาก `.env.example`:

```bash
copy .env.example .env
```

แก้ไขค่าใน `.env`:

```env
# Server
PORT=4000
NODE_ENV=development

# Database (เปลี่ยน password ตามที่ตั้งไว้)
DATABASE_URL=postgresql://transcription_user:your_password@localhost:5432/transcription_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000
```

### 6. ทดสอบการเชื่อมต่อ Database

```bash
npm run db:test
```

ควรเห็น: `✅ Database connection successful!`

### 7. Generate Prisma Client

```bash
npm run prisma:generate
```

### 8. รัน Development Server

```bash
npm run dev
```

Server จะรันที่ [http://localhost:4000](http://localhost:4000)

**หมายเหตุ**: ดูคู่มือติดตั้งแบบละเอียดใน [INSTALLATION.md](./INSTALLATION.md)

### 6. ทดสอบ API

เปิดเบราว์เซอร์ไปที่:
- Health Check: http://localhost:4000/health
- API Info: http://localhost:4000/api/v1

## 📁 โครงสร้าง Folder

ดูรายละเอียดครบถ้วนใน **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**

```
backend/
├── src/                   # Source code
│   ├── controllers/       # HTTP request handlers
│   ├── services/          # Business logic
│   ├── repositories/      # Database access
│   ├── models/            # Database models
│   ├── middleware/        # Express middleware
│   ├── utils/             # Utilities
│   ├── types/             # TypeScript types
│   └── index.ts           # Entry point
├── prisma/                # Prisma ORM
│   └── schema.prisma      # Database schema
├── dist/                  # Compiled JS (generated)
├── uploads/               # Uploaded files (generated)
├── .env                   # Environment variables
├── package.json           # Dependencies
└── README.md              # เอกสารนี้
```

**ไฟล์สำคัญ**:
- `src/index.ts` - Entry point ของ server
- `src/utils/prisma.ts` - Prisma client instance
- `prisma/schema.prisma` - Database schema
- `.env` - Environment variables
- `DATABASE.md` - คู่มือ database

## 🎯 Scripts ที่ใช้งาน

```bash
# Development
npm run dev          # รัน development server with hot reload

# Production
npm run build        # Compile TypeScript to JavaScript
npm run start        # รัน production server

# Database
npm run db:test      # ทดสอบการเชื่อมต่อ database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # รัน database migrations
npm run prisma:studio    # เปิด Prisma Studio (GUI)
npm run prisma:push      # Push schema to database (dev only)

# Code Quality
npm run lint         # ตรวจสอบ code style
npm run lint:fix     # แก้ไข code style อัตโนมัติ
npm run format       # จัดรูปแบบโค้ดด้วย Prettier
npm run format:check # ตรวจสอบรูปแบบโค้ด

# Testing
npm run test         # รัน tests (จะเพิ่มในภายหลัง)
```

## ✅ Features ที่พร้อมใช้งาน

### Phase 1: Foundation (เสร็จแล้ว)
- ✅ **Backend Setup** (Task 1.2)
  - Express + TypeScript
  - ESLint + Prettier
  - Folder structure
  
- ✅ **Database Setup** (Task 1.3)
  - PostgreSQL 18
  - Prisma ORM
  - Connection pooling
  - Migration tools
  
- ✅ **User & Role System** (Task 2.1)
  - User model
  - Role model (admin, free, pro)
  - Role settings
  - User settings
  - Seed data

### Phase 2: Database Schema (เสร็จแล้ว ✅)
- ✅ **Project & Audio Tables** (Task 2.2)
  - Project model with slug
  - AudioFile model with status
  - Soft delete & cascade
  
- ✅ **Transcript & Translation Tables** (Task 2.3)
  - Transcript with segments
  - Speaker management
  - Translation support
  
- ✅ **AI Model & Job Tables** (Task 2.4)
  - AI model configuration
  - Job queue system
  - Notifications
  - Logging

### Phase 3: Authentication (กำลังพัฒนา)
- ✅ **Password Hashing & JWT** (Task 3.1)
  - Password utilities (bcrypt)
  - JWT token generation
  - Authentication middleware
- ✅ **Register API** (Task 3.2)
  - POST /api/v1/auth/register
  - Validation (email, password)
  - Email uniqueness check
  - JWT tokens generation
- ✅ **Login API** (Task 3.3)
  - POST /api/v1/auth/login
  - Credentials validation
  - User active check
  - Last login tracking
  - JWT tokens generation
- ✅ **Token Refresh API** (Task 3.4)
  - POST /api/v1/auth/refresh
  - Refresh token validation
  - Generate new tokens
- ⏳ **Forgot/Reset Password** (Task 3.5)

## 📝 API Endpoints

ดูรายละเอียดใน [API.md](./API.md)

**สถานะปัจจุบัน**: Database schema พร้อม, รอสร้าง API endpoints

### Authentication
- `POST /api/v1/auth/register` - สมัครสมาชิก
- `POST /api/v1/auth/login` - เข้าสู่ระบบ
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/forgot-password` - ลืมรหัสผ่าน
- `POST /api/v1/auth/reset-password` - รีเซ็ตรหัสผ่าน
- `GET /api/v1/auth/me` - ดูข้อมูลผู้ใช้ปัจจุบัน

### Projects
- `GET /api/v1/projects` - ดูรายการโปรเจกต์
- `POST /api/v1/projects` - สร้างโปรเจกต์ใหม่
- `GET /api/v1/projects/:id` - ดูรายละเอียดโปรเจกต์
- `PATCH /api/v1/projects/:id` - แก้ไขโปรเจกต์
- `DELETE /api/v1/projects/:id` - ลบโปรเจกต์

### Audio Files
- `POST /api/v1/projects/:id/audio/upload` - อัปโหลดไฟล์เสียง
- `GET /api/v1/audio/:id` - ดูข้อมูลไฟล์เสียง
- `GET /api/v1/audio/:id/stream` - Stream ไฟล์เสียง
- `DELETE /api/v1/audio/:id` - ลบไฟล์เสียง

(จะเพิ่ม endpoints อื่นๆ ในภายหลัง)

## 📊 Database Schema

### Tables (14 ตาราง)

**User Management**:
- `users` - ข้อมูลผู้ใช้
- `roles` - บทบาท (admin, free, pro)
- `role_settings` - การตั้งค่าตาม role
- `user_settings` - การตั้งค่าเฉพาะผู้ใช้

**Content Management**:
- `projects` - โปรเจกต์ของผู้ใช้
- `audio_files` - ไฟล์เสียงที่อัปโหลด
- `transcripts` - ข้อความที่ถอดจากเสียง
- `transcript_segments` - ข้อความแต่ละช่วงเวลา
- `speakers` - ผู้พูดในไฟล์เสียง
- `translations` - ข้อความที่แปลแล้ว

**AI & Processing**:
- `ai_models` - AI model configurations
- `jobs` - Queue jobs สำหรับประมวลผล

**System**:
- `notifications` - การแจ้งเตือนผู้ใช้
- `logs` - System logs
- `usage_stats` - สถิติการใช้งานรายเดือน

### Default Data
- 3 Roles พร้อม settings
- 1 Admin user (admin@transcription.local / Admin@123)
- 5 AI Models (3 STT, 2 Translation)

ดูรายละเอียดใน [docs/DATABASE.md](./docs/DATABASE.md)

## 🔒 Security

- Password hashing ด้วย bcrypt (cost factor 12)
- JWT authentication with refresh tokens (จะเพิ่มในภายหลัง)
- Rate limiting (จะเพิ่มในภายหลัง)
- Input validation
- SQL injection prevention (Prisma)
- XSS protection
- CORS configuration

## 🧪 Testing

(จะเพิ่มในภายหลัง)

## � Lเอกสารเพิ่มเติม

### คู่มือหลัก
- [docs/INSTALLATION.md](./docs/INSTALLATION.md) - คู่มือติดตั้งแบบละเอียด
- [docs/QUICKSTART.md](./docs/QUICKSTART.md) - เริ่มต้นอย่างรวดเร็ว
- [docs/DATABASE.md](./docs/DATABASE.md) - คู่มือ database
- [docs/API.md](./docs/API.md) - API documentation
- [docs/CHANGELOG.md](./docs/CHANGELOG.md) - บันทึกการเปลี่ยนแปลง

### เอกสารเทคนิค
- [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) - โครงสร้างโปรเจกต์
- [docs/CONNECTION_POOLING.md](./docs/CONNECTION_POOLING.md) - Connection pooling
- [docs/DATABASE_SETUP.md](./docs/DATABASE_SETUP.md) - สรุปการติดตั้ง database

### Task Summaries
- [docs/TASK_1.2_SUMMARY.md](./docs/TASK_1.2_SUMMARY.md) - Backend Setup
- [docs/TASK_1.3_SUMMARY.md](./docs/TASK_1.3_SUMMARY.md) - Database Setup
- [docs/TASK_2.1_SUMMARY.md](./docs/TASK_2.1_SUMMARY.md) - User & Role Tables
- [docs/TASK_2.2_SUMMARY.md](./docs/TASK_2.2_SUMMARY.md) - Project & Audio Tables
- [docs/TASK_2.3_SUMMARY.md](./docs/TASK_2.3_SUMMARY.md) - Transcript & Translation Tables
- [docs/TASK_2.4_SUMMARY.md](./docs/TASK_2.4_SUMMARY.md) - AI Model & Job Tables
- [docs/TASK_3.1_SUMMARY.md](./docs/TASK_3.1_SUMMARY.md) - Password Hashing & JWT
- [docs/TASK_3.2_SUMMARY.md](./docs/TASK_3.2_SUMMARY.md) - Register API
- [docs/TASK_3.3_SUMMARY.md](./docs/TASK_3.3_SUMMARY.md) - Login API
- [docs/TASK_3.4_SUMMARY.md](./docs/TASK_3.4_SUMMARY.md) - Token Refresh API

### Scripts
- [scripts/README.md](./scripts/README.md) - Database setup scripts
- [scripts/MANUAL_SETUP.md](./scripts/MANUAL_SETUP.md) - Manual database setup

## 📄 License

MIT License

## 👥 ทีมพัฒนา

- Backend Developer: CSC481 Team

## 📞 ติดต่อ

หากมีคำถามหรือปัญหา กรุณาติดต่อ: [อีเมลของคุณ]
