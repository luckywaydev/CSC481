# ทำหน้า login เสร็จแล้ว

ตอนนี้มีหน้า login ที่ใช้ Input และ Button component แล้ว ง่ายกว่าหน้า register เพราะมีแค่ 2 ช่อง

## ทำอะไรไปบ้าง

- สร้างหน้า `/login`
- ใช้ Input component สำหรับ:
  - Email
  - Password
- ใช้ Button component แบบ 3D
- ทำ validation แบบง่ายๆ:
  - เชคว่ากรอกครบไหม
  - ไม่ได้เชค format เพราะ login ไม่จำเป็น
- เพิ่มลิงก์ "ลืมรหัสผ่าน?" (ยังไม่ได้ทำหน้านั้น)
- เพิ่มลิงก์ไปหน้า register

## ปัญหาที่เจอ

- ไม่แน่ใจว่าต้อง validate email format ไหม
  - ตัดสินใจว่าไม่ต้อง เพราะ login แค่เชคว่ากรอกหรือยัง
  - ถ้า format ผิด backend จะบอกอยู่แล้ว
  
- ยังไม่ได้เชื่อม backend
  - ตอนนี้แค่ console.log
  - TODO: เชื่อมทีหลัง

## สิ่งที่เรียนรู้

- หน้า login ง่ายกว่าหน้า register เยอะ
- ใช้ component ที่สร้างไว้ทำให้เขียนโค้ดเร็วขึ้น
- การทำ validation แบบง่ายๆ ก็พอ

## ต่อไปจะทำอะไร

- ทำหน้า dashboard
- เชื่อม backend API
- ทำหน้า forgot password (ถ้ามีเวลา)
