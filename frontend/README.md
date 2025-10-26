# ทำหน้าแรกเสร็จแล้ว

ตอนนี้หน้าเว็บสวยขึ้นเยอะ มีปุ่ม มีข้อความ มีการ์ดแสดงฟีเจอร์ ใช้สีม่วงกับพื้นหลังมืดตามที่วางแผนไว้

## ทำอะไรไปบ้าง

- ทำ Navigation Bar ด้านบน มี logo กับปุ่ม login/register
- ทำ Hero Section (ส่วนหลัก) มีหัวข้อใหญ่ๆ กับปุ่ม CTA
- ทำพื้นหลังแบบ gradient สีม่วง ดูเท่ดี
- ทำ Features Section แสดง 3 ฟีเจอร์หลัก (ถอดเสียง, แปลภาษา, แก้ไข)
- ทำ Footer ด้านล่าง

## ปัญหาที่เจอ

- ตอนแรกไม่รู้ว่าจะทำ gradient ยังไง ต้องไปดู Tailwind docs
- ลอง blur-3xl หลายค่าถึงจะได้แบบที่ชอบ
- ยังไม่มี Button component เลยใช้ `<a>` tag ธรรมดาก่อน
- ตรงนี้ยังไม่สวยเท่าไหร่ แต่ใช้ได้ก่อน

## สิ่งที่เรียนรู้

- การใช้ Tailwind CSS ทำ gradient background
- การใช้ `backdrop-blur` ทำ navbar แบบโปร่งใส
- การใช้ grid layout แสดง cards
- การทำ responsive ด้วย `md:` prefix

## ต่อไปจะทำอะไร

- ทำ Button component แบบ 3D
- ทำหน้า register กับ login
- ทำ Input component สำหรับ form
