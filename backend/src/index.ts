/**
 * ไฟล์: index.ts
 *
 * คำอธิบาย:
 * Entry point ของ Backend Server
 * - โหลด environment variables
 * - สร้าง Express app
 * - เชื่อมต่อ database
 * - เริ่ม server
 *
 * Author: Backend Team
 * Created: 2025-10-23
 */

import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// โหลด environment variables จาก .env file
dotenv.config();

// สร้าง Express application
const app: Application = express();

// กำหนด port จาก environment variable หรือใช้ 4000 เป็นค่าเริ่มต้น
// แปลงเป็น number เพราะ process.env.PORT เป็น string
const PORT = parseInt(process.env.PORT || '4000', 10);

// === Middleware Configuration ===

/**
 * CORS Middleware
 * อนุญาตให้ Frontend เรียก API ได้
 * รองรับทั้ง localhost, IP address, และ VPS domain
 */
app.use(
  cors({
    origin: function (origin, callback) {
      // อนุญาตทุก origin ใน development
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
        return;
      }

      // Production: ตรวจสอบ origin ที่อนุญาต
      const allowedOrigins = [
        'http://localhost:3000',
        'http://192.168.1.83:3000', //เทสมือถือ
        'http://194.233.68.191:3000', //vps ip
        'http://luckyway.dev', //vps domain (ผ่าน nginx)
        'https://luckyway.dev', //vps domain https
        'http://api.luckyway.dev', //api subdomain
        'https://api.luckyway.dev', //api subdomain https
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

/**
 * JSON Parser Middleware
 * แปลง request body ที่เป็น JSON ให้เป็น JavaScript object
 */
app.use(express.json());

/**
 * URL-encoded Parser Middleware
 * แปลง form data ให้เป็น JavaScript object
 */
app.use(express.urlencoded({ extended: true }));

// === Routes ===

/**
 * Health Check Endpoint
 * ใช้สำหรับตรวจสอบว่า server ทำงานปกติหรือไม่
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * API Version 1 Base Route
 * แสดงข้อมูลเกี่ยวกับ API
 */
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'Transcription API',
    version: '1.0.0',
    description: 'Audio Transcription and Translation System API',
  });
});

/**
 * Import routes
 */
import authRoutes from './routes/authRoutes';

/**
 * API Routes
 */
app.use('/api/v1/auth', authRoutes);

// === Error Handling ===

/**
 * 404 Not Found Handler
 * จัดการ request ที่ไม่ตรงกับ route ใดๆ
 */
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

/**
 * Global Error Handler
 * จัดการ error ทั้งหมดที่เกิดขึ้นใน application
 */
app.use(
  (
    err: Error & { statusCode?: number; code?: string },
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Error:', err);

    res.status(err.statusCode || 500).json({
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: err.message || 'An unexpected error occurred',
      },
    });
  }
);

// === Start Server ===

/**
 * เริ่มต้น HTTP Server
 * รอรับ request จาก client
 * 
 * สำหรับ VPS: ต้อง listen 0.0.0.0 เพื่อให้เข้าถึงได้จากภายนอก
 */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`� Servter is running on http://0.0.0.0:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🌐 External access: http://YOUR_VPS_IP:${PORT}`);
});

// Export app สำหรับใช้ใน testing
export default app;
