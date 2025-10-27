# ทำ refresh token ละจู้


## ทำแล้ว

- เพิ่ม refreshToken() function
  - รับ refresh token จาก request
  - verify refresh token
  - สร้าง access token และ refresh token ใหม่
  - return tokens ใหม่
- เพิ่ม POST /refresh route

## วิธีทดสอบ

```bash
POST http://localhost:4000/api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token-here"
}
```

## ปัญหาที่เจอ

- ตรงนี้ยังไม่แน่ใจว่าทำถูกไหม แต่ใช้ได้
  - verify refresh token
  - สร้าง tokens ใหม่ทั้งคู่
  - ควรจะเก็บ refresh token ใน database ไหม?
  - ตอนนี้ยังไม่ได้เก็บ
