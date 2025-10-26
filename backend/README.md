# ทำระบบ login เสร็จ

ตอนนี้มี password hashing กับ JWT token แล้ว

## ทำอะไรไปบ้าง

- ติดตั้ง bcrypt สำหรับ hash password
- ติดตั้ง jsonwebtoken สำหรับ JWT
- สร้าง password utilities:
  - hashPassword() - hash password
  - comparePassword() - เช็ค password
- สร้าง JWT utilities:
  - generateAccessToken() - สร้าง access token (24h)
  - generateRefreshToken() - สร้าง refresh token (7d)
  - verifyAccessToken() - verify token
  - verifyRefreshToken() - verify refresh token

## ปัญหาที่เจอ

- ไม่รู้ว่า bcrypt ใช้ยังไง
  - ต้องใช้ async/await
  - ต้องกำหนด salt rounds (ใช้ 10)
  
- ไม่รู้ว่า JWT ทำงานยังไง
  - ต้องมี secret key
  - ต้องกำหนด expiry time
  - access token หมดอายุเร็ว (24h)
  - refresh token หมดอายุช้า (7d)

## ต่อไปจะทำอะไร

- ทำ register API
- ทำ login API
- ทำ token refresh API
