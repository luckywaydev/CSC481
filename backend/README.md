# ตั้งค่า backend เสร็จแล้ว

ตอนนี้ติดตั้ง Node.js + TypeScript เสร็จแล้ว ยังไม่มี server แค่ setup project พื้นฐาน

## ติดตั้งอะไรบ้าง

- Node.js + TypeScript
- Express (ยังไม่ได้ใช้)
- dotenv สำหรับ environment variables
- nodemon สำหรับ hot reload

## โครงสร้างโฟลเดอร์

```
src/
├── controllers/  # จะเก็บ API handlers
├── services/     # จะเก็บ business logic
├── routes/       # จะเก็บ route definitions
└── utils/        # จะเก็บ utilities
```

## ปัญหาที่เจอ

- ไม่รู้ว่าต้องติดตั้งอะไรบ้าง ต้องไปดู docs
- TypeScript config ยุ่งยาก ต้องลองหลายครั้ง
- ตอนแรกไม่รู้ว่าต้องสร้างโฟลเดอร์อะไรบ้าง

## ต่อไปจะทำอะไร

- สร้าง Express server
- เชื่อม database
- ทำ API endpoints
