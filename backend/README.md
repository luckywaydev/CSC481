# server รันได้แล้ว

ตอนนี้ Express server รันได้แล้ว port 4000 มี health check endpoint

## ทำอะไรไปบ้าง

- สร้าง Express server
- ตั้งค่า middleware:
  - CORS (ให้ frontend เรียกได้)
  - JSON parser
  - URL-encoded parser
- สร้าง endpoints:
  - GET /health (health check)
  - GET /api/v1 (API info)
- ทำ error handling:
  - 404 handler

## วิธีรัน

```bash
npm install
npm run dev
```

เปิด http://localhost:4000/health จะเห็น `{"status":"ok"}`

## ปัญหาที่เจอ

- ตอนแรกไม่รู้ว่าต้องใส่ cors
  - frontend เรียก API แล้ว error CORS
  - ต้อง install cors และตั้งค่า origin
  
- ไม่รู้ว่า middleware ต้องเรียงลำดับยังไง
  - ต้องใส่ cors ก่อน routes
  - ต้องใส่ json parser ก่อนใช้ req.body

## สิ่งที่เรียนรู้

- การสร้าง Express server
- การใช้ middleware
- การตั้งค่า CORS
- การทำ health check endpoint

## ต่อไปจะทำอะไร

- เชื่อม database
- ทำ auth service
- ทำ API endpoints
