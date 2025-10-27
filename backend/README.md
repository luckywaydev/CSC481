# API login เสร็จ

ตอนนี้ทดสอบแล้วใช้ได้

## ทำอะไรไปบ้าง

- เพิ่ม login() function ใน authController
  - หา user จาก email
  - เชค password ด้วย comparePassword()
  - สร้าง tokens
  - return user data และ tokens
- เพิ่ม POST /login route

## วิธีทดสอบ

```bash
POST http://localhost:4000/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

## ปัญหาที่เจอ

- ไม่รู้ว่าควร return error message แบบไหน
  - ถ้า email ไม่เจอ หรือ password ผิด
  - ควร return message เดียวกัน "Invalid email or password"
  - เพื่อความปลอดภัย ไม่บอกว่า email มีหรือไม่มี

## ต่อไปจะทำอะไร

- ทำ token refresh API
- เพิ่ม rate limiting
