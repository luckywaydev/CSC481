/**
 * ไฟล์: authController.ts
 *
 * คำอธิบาย:
 * Controller สำหรับจัดการ authentication endpoints
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

import { Request, Response } from 'express';
import {
  register,
  login,
  refreshToken,
  ValidationError,
} from '../services/authService';

/**
 * POST /api/v1/auth/register
 * สมัครสมาชิกใหม่
 *
 * Request Body:
 * - email: string (required)
 * - password: string (required)
 * - confirmPassword: string (required)
 * - username: string (optional)
 *
 * Response:
 * - 201: สมัครสมาชิกสำเร็จ
 * - 400: ข้อมูล input ไม่ถูกต้อง
 * - 409: Email ซ้ำ
 * - 500: Server error
 */
export async function registerController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // ดึงข้อมูลจาก request body
    const { email, password, confirmPassword, username } = req.body;

    // เรียก register service
    const result = await register({
      email,
      password,
      confirmPassword,
      username,
    });

    // ส่ง response กลับ
    res.status(201).json({
      message: 'Registration successful',
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    });
  } catch (error) {
    // จัดการ errors
    if (error instanceof ValidationError) {
      // Validation errors
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: error.errors,
        },
      });
      return;
    }

    if (error instanceof Error && error.message === 'Email already exists') {
      // Email ซ้ำ
      res.status(409).json({
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already exists',
        },
      });
      return;
    }

    // Server error
    console.error('Register error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Registration failed',
      },
    });
  }
}


/**
 * POST /api/v1/auth/login
 * เข้าสู่ระบบ (ใช้ email หรือ username ได้)
 *
 * Request Body:
 * - email: string (required) - สามารถใส่ email หรือ username
 * - password: string (required)
 *
 * Response:
 * - 200: เข้าสู่ระบบสำเร็จ
 * - 400: ข้อมูล input ไม่ถูกต้อง
 * - 401: Credentials ไม่ถูกต้อง
 * - 403: User account ไม่ active
 * - 500: Server error
 */
export async function loginController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // ดึงข้อมูลจาก request body
    const { email, password } = req.body;

    // เรียก login service
    const result = await login({
      email,
      password,
    });

    // ส่ง response กลับ
    res.status(200).json({
      message: 'Login successful',
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    });
  } catch (error) {
    // จัดการ errors
    if (error instanceof ValidationError) {
      // Validation errors
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: error.errors,
        },
      });
      return;
    }

    if (error instanceof Error && error.message === 'Invalid credentials') {
      // Credentials ไม่ถูกต้อง
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message === 'User account is inactive'
    ) {
      // User account ไม่ active
      res.status(403).json({
        error: {
          code: 'USER_INACTIVE',
          message: 'User account is inactive',
        },
      });
      return;
    }

    // Server error
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Login failed',
      },
    });
  }
}


/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 *
 * Request Body:
 * - refreshToken: string (required)
 *
 * Response:
 * - 200: Refresh สำเร็จ
 * - 400: ข้อมูล input ไม่ถูกต้อง
 * - 401: Refresh token ไม่ถูกต้องหรือหมดอายุ
 * - 403: User account ไม่ active
 * - 500: Server error
 */
export async function refreshTokenController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // ดึงข้อมูลจาก request body
    const { refreshToken: token } = req.body;

    // เรียก refreshToken service
    const result = await refreshToken({
      refreshToken: token,
    });

    // ส่ง response กลับ
    res.status(200).json({
      message: 'Token refreshed successfully',
      data: {
        tokens: result.tokens,
      },
    });
  } catch (error) {
    // จัดการ errors
    if (error instanceof ValidationError) {
      // Validation errors
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: error.errors,
        },
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message === 'Invalid or expired refresh token'
    ) {
      // Refresh token ไม่ถูกต้องหรือหมดอายุ
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired refresh token',
        },
      });
      return;
    }

    if (error instanceof Error && error.message === 'User not found') {
      // User ไม่พบ
      res.status(401).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message === 'User account is inactive'
    ) {
      // User account ไม่ active
      res.status(403).json({
        error: {
          code: 'USER_INACTIVE',
          message: 'User account is inactive',
        },
      });
      return;
    }

    // Server error
    console.error('Refresh token error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Token refresh failed',
      },
    });
  }
}
