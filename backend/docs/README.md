# Backend Documentation

เอกสารทั้งหมดสำหรับ Backend API

## 📚 คู่มือหลัก

### [INSTALLATION.md](./INSTALLATION.md)
คู่มือติดตั้งแบบละเอียด ทีละขั้นตอน
- ติดตั้ง Node.js
- ติดตั้ง PostgreSQL
- ตั้งค่า environment variables
- รัน development server

### [QUICKSTART.md](./QUICKSTART.md)
เริ่มต้นอย่างรวดเร็ว สำหรับผู้ที่มีประสบการณ์
- ขั้นตอนย่อ
- คำสั่งสำคัญ
- Troubleshooting

### [DATABASE.md](./DATABASE.md)
คู่มือ PostgreSQL Database
- ติดตั้ง PostgreSQL
- สร้าง database และ user
- รัน migrations
- Prisma commands
- Troubleshooting

### [API.md](./API.md)
API Documentation
- Authentication endpoints
- Projects endpoints
- Audio endpoints
- Error codes
- Request/Response examples

### [CHANGELOG.md](./CHANGELOG.md)
บันทึกการเปลี่ยนแปลงทั้งหมด
- Features ใหม่
- Bug fixes
- Breaking changes

## 🔧 เอกสารเทคนิค

### [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
โครงสร้างโปรเจกต์แบบละเอียด
- Folder structure
- File descriptions
- Architecture diagram
- Development workflow

### [CONNECTION_POOLING.md](./CONNECTION_POOLING.md)
Connection Pooling ด้วย Prisma
- Configuration
- Best practices
- Monitoring

### [DATABASE_SETUP.md](./DATABASE_SETUP.md)
สรุปการติดตั้ง Database
- สิ่งที่ทำเสร็จ
- ขั้นตอนถัดไป
- Troubleshooting

## 📝 Task Summaries

### [TASK_1.2_SUMMARY.md](./TASK_1.2_SUMMARY.md)
Backend Project Setup
- Express + TypeScript
- ESLint + Prettier
- Folder structure

### [TASK_1.3_SUMMARY.md](./TASK_1.3_SUMMARY.md)
Database Setup
- PostgreSQL installation
- Prisma configuration
- Connection pooling

### [TASK_2.1_SUMMARY.md](./TASK_2.1_SUMMARY.md)
User และ Role Tables
- Database schema
- Seed data
- Default roles

### [TASK_2.2_SUMMARY.md](./TASK_2.2_SUMMARY.md)
Project และ Audio Tables
- Project model with slug
- AudioFile model with status
- Soft delete & cascade

## 🔍 การใช้งาน

### หาเอกสารที่ต้องการ

**ต้องการติดตั้งโปรเจกต์**:
→ [INSTALLATION.md](./INSTALLATION.md)

**ต้องการเริ่มต้นอย่างรวดเร็ว**:
→ [QUICKSTART.md](./QUICKSTART.md)

**มีปัญหาเกี่ยวกับ Database**:
→ [DATABASE.md](./DATABASE.md)

**ต้องการดู API endpoints**:
→ [API.md](./API.md)

**ต้องการเข้าใจโครงสร้างโปรเจกต์**:
→ [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

**ต้องการดูประวัติการเปลี่ยนแปลง**:
→ [CHANGELOG.md](./CHANGELOG.md)

## 📂 โครงสร้างเอกสาร

```
docs/
├── README.md                  # เอกสารนี้
│
├── คู่มือหลัก
│   ├── INSTALLATION.md
│   ├── QUICKSTART.md
│   ├── DATABASE.md
│   ├── API.md
│   └── CHANGELOG.md
│
├── เอกสารเทคนิค
│   ├── PROJECT_STRUCTURE.md
│   ├── CONNECTION_POOLING.md
│   └── DATABASE_SETUP.md
│
└── Task Summaries
    ├── TASK_1.2_SUMMARY.md
    ├── TASK_1.3_SUMMARY.md
    └── TASK_2.1_SUMMARY.md
```

## 🔄 การอัปเดตเอกสาร

เมื่อทำ task ใหม่เสร็จ:
1. สร้าง `TASK_X.X_SUMMARY.md`
2. อัปเดต `CHANGELOG.md`
3. อัปเดต `API.md` (ถ้ามี endpoint ใหม่)
4. อัปเดต `DATABASE.md` (ถ้ามีตารางใหม่)
5. อัปเดต `README.md` (root)

## 📞 ติดต่อ

หากพบข้อผิดพลาดในเอกสาร กรุณาแจ้งทีมพัฒนา
