# CSC481 Project

❗️ ตั้งสติก่อน push ขึ้น main
 - ง่วงห้าม push main
 - ไม่ชัวร์ห้าม push main
 - git status ก่อน push #เช็ค branch
 - พนมมือสวดมนต์ก่อน push 
 - commit ไม่มี comment ขอให้แมวไม่รัก

## Backend

### ต้องติดตั้ง
1. Node.js เวอร์ชั่น 18 ขึ้นไป
2. PostgreSQL เวอร์ชั่น 15 ขึ้นไป

### วิธีการติดตั้งและรัน Backend

1.
```
cd backend
```
2.
```
npm install
```
3. สร้างไฟล์ .env ในโฟลเดอร์ backend และกำหนดค่าต่อไปนี้:
```
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/csc481"
JWT_SECRET="your_secret_key"
```
4. สร้าง db และ table
```
.\scripts\setup-database.bat
npx prisma migrate dev
npx prisma db seed
```

5. รันแบบ dev
```
npm run dev
```
หรือรัน prod
```
npm build
npn start
```
เซิร์ฟเวอร์จะทำงานที่ http://localhost:3001

## Frontend

### สิ่งที่ต้องติดตั้ง
1. Node.js เวอร์ชั่น 18 ขึ้นไป

### วิธีการติดตั้งและรัน Frontend
1. 
```
cd frontend
```

2. 
```
npm install
```

3. สร้างไฟล์ .env.local ในโฟลเดอร์ frontend ตั้งค่านี้:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. รันแบบ dev
```
npm run dev
```
หรือรัน prod
```
npm build
npn start
```

เว็บไซต์จะทำงานที่ http://localhost:3000


## Prisma

แบบ gui เพื่อความง่ายของชีวืต
```
npm run prisma:studio
```
หรือ
```
npx  prisma studio
```
## แก้ Clone ละรันไม่ได้

วิธี 1. ล้างแคช
```
npm cache clean --force
```
วิธี 2. ล้าง module
```
npm ci
```
วิธี 3. 
- ลบโฟเดอร์ node_modules
- ลบไฟล์ package-lock.json
- nom install ใหม่

วิธี 4. เปลี่ยนแผ่นรองเมาส์
