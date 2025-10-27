# ทำหน้าสมัครสมาชิกเสร็จแล้ว

ตอนนี้มีหน้า register ที่ใช้ Input component และ Button component แล้ว มี validation ด้วย

## ทำอะไรไปบ้าง

- สร้างหน้า `/register` 
- ใช้ Input component สำหรับ form fields
  - Email
  - Username
  - Password
  - Confirm Password
- ใช้ Button component แบบ 3D
- ทำ validation:
  - เชค email format
  - เชค password length (อย่างน้อย 8 ตัว)
  - เชคว่า password ตรงกันไหม
  - เชคว่ากรอกครบทุกช่องไหม
- แสดง error message ถ้ากรอกผิด

## ปัญหาที่เจอ

- ตอนแรกไม่รู้ว่าจะทำ validation ยังไง
  - ใช้ regex สำหรับ email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - เชค length สำหรับ password
  - เปรียบเทียบ password กับ confirmPassword
  
- ไม่รู้ว่าจะเก็บ error messages ยังไง
  - ใช้ object: `Record<string, string>`
  - เก็บ error แยกตาม field name
  
- ยังไม่ได้เชื่อม backend
  - ตอนนี้แค่ console.log ข้อมูล
  - TODO: เชื่อมกับ API ทีหลัง

## สิ่งที่เรียนรู้

- การทำ form validation ใน React
- การใช้ useState เก็บข้อมูล form
- การใช้ TypeScript Record type
- การใช้ regex validate email
- การใช้ component ที่สร้างไว้ (Input, Button)

## ต่อไปจะทำอะไร

- ทำหน้า login
- เชื่อม backend API
- เพิ่ม loading state
