## Requirements

### 1. Node.js
- **Version**: 18.17.0 ขึ้นไป
- **ดาวน์โหลด**: https://nodejs.org/
- **ตรวจสอบ**: `node --version`

### 2. npm หรือ yarn
- **npm**: มาพร้อม Node.js
- **yarn**: `npm install -g yarn`

---

## ติดตั้ง

### 1. Clone Repository
```bash
git clone https://github.com/luckywaydev/CSC481.git
cd frontend
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment
```bash
cp .env.example .env.local
```

แก้ไข `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws
```

### 4. รัน Development Server
```bash
npm run dev
```

เปิด http://localhost:3000


```bash
npm run dev          # รัน development server
npm run build        # Build สำหรับ production
npm run start        # รัน production server
npm run lint         # ตรวจสอบ code
npm run type-check   # ตรวจสอบ TypeScript
```

### Color Theme
- **Background**: `#0a0a0f` (เกือบดำ), `#13131a` (เทาเข้ม), `#1a1a24` (เทา)
- **Purple**: `#a855f7` (หลัก), `#9333ea` (เข้ม), `#c084fc` (อ่อน)
- **Text**: `#ffffff` (ขาว), `#a0a0b0` (เทาอ่อน), `#6b6b80` (เทา)

### Button Style
- **3D Floating Effect**: ปุ่มมีเงาด้านล่าง ยกขึ้นเมื่อ hover
- **4 Variants**: primary, secondary, outline, ghost
- **3 Sizes**: sm, md, lg

---

- **Framework**: Next.js 14
- **Language**: TypeScript
- **UI Library**: React 
- **Styling**: Tailwind
- **Build Tool**: Turbopack

---

## แก้ไขปัญหา

### Port 3000 ถูกใช้งาน
```bash
PORT=3001 npm run dev
```

### Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
npm run type-check
```
