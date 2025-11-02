# CSC481 Project

## Backend

### สิ่งที่ต้องติดตั้ง
1. Node.js เวอร์ชั่น 18 ขึ้นไป
2. PostgreSQL เวอร์ชั่น 15 ขึ้นไป
3. Git

### วิธีการติดตั้งและรัน Backend
1. เปิด PowerShell และไปที่โฟลเดอร์ backend
```powershell
cd backend
```

2. ติดตั้ง dependencies
```powershell
npm install
```

3. สร้างไฟล์ .env ในโฟลเดอร์ backend และกำหนดค่าต่อไปนี้:
```
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/csc481"
JWT_SECRET="your_secret_key"
```

4. รันคำสั่งเพื่อสร้างฐานข้อมูลและตาราง
```powershell
.\scripts\setup-database.bat
npx prisma migrate dev
npx prisma db seed
```

5. รันเซิร์ฟเวอร์ในโหมดพัฒนา
```powershell
npm run dev
```

เซิร์ฟเวอร์จะทำงานที่ http://localhost:3001

## Frontend

### สิ่งที่ต้องติดตั้ง
1. Node.js เวอร์ชั่น 18 ขึ้นไป
2. Git

### วิธีการติดตั้งและรัน Frontend
1. เปิด PowerShell อีกหน้าต่างและไปที่โฟลเดอร์ frontend
```powershell
cd frontend
```

2. ติดตั้ง dependencies
```powershell
npm install
```

3. สร้างไฟล์ .env.local ในโฟลเดอร์ frontend และกำหนดค่าต่อไปนี้:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. รันแอพพลิเคชันในโหมดพัฒนา
```powershell
npm run dev
```

เว็บไซต์จะทำงานที่ http://localhost:3000