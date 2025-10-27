# ทำ Design System เสร็จแล้ว

ตอนนี้มี component ที่ใช้ซ้ำได้แล้ว ไม่ต้องเขียน style ซ้ำๆ มีปุ่มแบบ 3D, Input, และ Card

## ทำอะไรไปบ้าง

- สร้าง Button component แบบ 3D floating effect
  - มี 4 แบบ: primary, secondary, outline, ghost
  - มี 3 ขนาด: sm, md, lg
  - มี shadow แบบ 3D ตอน hover ยกขึ้น
  
- สร้าง Input component สำหรับ form
  - มี label และ error message
  - focus แล้วเป็นสีม่วง
  - ใช้กับหน้า login/register ได้
  
- สร้าง Card component
  - ใช้ใส่เนื้อหาต่างๆ
  - มี hover effect ได้
  
- เพิ่ม shadow-3d ใน tailwind.config.ts

## ปัญหาที่เจอ

- ตอนแรกไม่รู้ว่าจะทำ shadow 3D ยังไง ต้องลองหลายค่า
- ลอง shadow-3d หลายแบบถึงจะได้ที่ชอบ
- ไม่แน่ใจว่า forwardRef ใช้ยังไง ต้องไปดู docs
- TypeScript ต้องแก้หลายที
