// Entry point ของ Backend Server
import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// โหลด environment variables
dotenv.config();

// สร้าง Express app
const app: Application = express();

// กำหนด port - ใช้ port 4000
const PORT = process.env.PORT || 4000;

// === Middleware ===

// CORS - ให้ frontend เรียก API ได้
app.use(
  cors({
    origin: 'http://localhost:3000', // frontend URL
    credentials: true,
  })
);

// JSON parser - แปลง request body เป็น JSON
app.use(express.json());

// URL-encoded parser - แปลง form data
app.use(express.urlencoded({ extended: true }));

// === Routes ===

// Health check - เช็คว่า server ทำงานไหม
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API info
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'Transcription API',
    version: '1.0.0',
    description: 'Audio Transcription and Translation System API',
  });
});

// Import routes
import authRoutes from './routes/authRoutes';

// API Routes
app.use('/api/v1/auth', authRoutes);

// === Error Handling ===

// 404 handler - ถ้าไม่เจอ route
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// === Start Server ===

// เริ่ม server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
