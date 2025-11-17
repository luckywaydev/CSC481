/**
 * ไฟล์: authRoutes.ts
 *
 * คำอธิบาย:
 * Routes สำหรับ authentication endpoints
 * - POST /auth/register - สมัครสมาชิก
 * - POST /auth/login - เข้าสู่ระบบ
 * - POST /auth/refresh - refresh token
 * - POST /auth/forgot-password - ลืมรหัสผ่าน
 * - POST /auth/reset-password - รีเซ็ตรหัสผ่าน
 * - GET /auth/me - ดูข้อมูลผู้ใช้ปัจจุบัน
 *
 * Author: Backend Team
 * Created: 2025-10-24
 */

import { Router } from 'express';
import {
  registerController,
  loginController,
  refreshTokenController,
  getCurrentUserController,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

/**
 * สร้าง router instance
 */
const router = Router();

/**
 * POST /api/v1/auth/register
 * สมัครสมาชิกใหม่
 */
router.post('/register', registerController);

/**
 * POST /api/v1/auth/login
 * เข้าสู่ระบบ
 */
router.post('/login', loginController);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post('/refresh', refreshTokenController);

/**
 * GET /api/v1/auth/me
 * Get current user data (requires authentication)
 */
router.get('/me', authenticate, getCurrentUserController);

/**
 * Export router
 */
export default router;
