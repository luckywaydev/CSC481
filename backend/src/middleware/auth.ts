/**
 * ไฟล์: auth.ts
 *
 * คำอธิบาย:
 * Middleware สำหรับ authentication และ authorization
 * - ตรวจสอบ JWT token
 * - ดึงข้อมูล user จาก token
 * - ตรวจสอบ role และ permissions
 *
 * Author: Backend Team
 * Created: 2025-10-24
 */

import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyAccessToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';

/**
 * Interface สำหรับ authenticated request
 * เพิ่ม user property ใน Request object
 */
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roleId: string;
    roleName?: string;
  };
}

/**
 * Middleware สำหรับตรวจสอบ authentication
 * ตรวจสอบว่า request มี valid JWT token หรือไม่
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @example
 * ```typescript
 * // ใช้กับ route ที่ต้องการ authentication
 * router.get('/profile', authenticate, getProfile);
 * ```
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token จาก Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      });
      return;
    }

    // ดึงข้อมูล user จาก database เพื่อตรวจสอบว่ายังมีอยู่และ active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      res.status(401).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        error: {
          code: 'USER_INACTIVE',
          message: 'User account is inactive',
        },
      });
      return;
    }

    // เพิ่มข้อมูล user ใน request object
    req.user = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
    };

    // ไปต่อ
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication failed',
      },
    });
  }
}

/**
 * Middleware สำหรับตรวจสอบ role
 * ตรวจสอบว่า user มี role ที่กำหนดหรือไม่
 *
 * @param allowedRoles - array ของ role names ที่อนุญาต
 * @returns Express middleware function
 *
 * @example
 * ```typescript
 * // ใช้กับ route ที่ต้องการ admin role
 * router.get('/admin/users', authenticate, requireRole(['admin']), getUsers);
 *
 * // ใช้กับ route ที่อนุญาตหลาย roles
 * router.get('/premium', authenticate, requireRole(['admin', 'pro']), getPremiumContent);
 * ```
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // ตรวจสอบว่ามี user ใน request หรือไม่
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    // ตรวจสอบว่า user มี role ที่อนุญาตหรือไม่
    if (!req.user.roleName || !allowedRoles.includes(req.user.roleName)) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
      return;
    }

    // ไปต่อ
    next();
  };
}

/**
 * Middleware สำหรับ optional authentication
 * ถ้ามี token ก็ verify แต่ถ้าไม่มีก็ไปต่อได้
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @example
 * ```typescript
 * // ใช้กับ route ที่ authentication เป็น optional
 * router.get('/posts', optionalAuth, getPosts);
 * ```
 */
export async function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token จาก Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    // ถ้าไม่มี token ก็ไปต่อได้
    if (!token) {
      next();
      return;
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // ถ้า token invalid ก็ไปต่อได้ (แต่ไม่มี user)
    if (!decoded) {
      next();
      return;
    }

    // ดึงข้อมูล user จาก database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    // ถ้าเจอ user และ active ก็เพิ่มใน request
    if (user && user.isActive) {
      req.user = {
        userId: user.id,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name,
      };
    }

    // ไปต่อ (ไม่ว่าจะมี user หรือไม่)
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    // ถ้า error ก็ไปต่อได้ (แต่ไม่มี user)
    next();
  }
}
