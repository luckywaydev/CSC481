/**
 * ไฟล์: authService.ts
 *
 * คำอธิบาย:
 * Service สำหรับจัดการ authentication
 * - Register user ใหม่
 * - Login
 * - Refresh token
 * - Password reset
 *
 * Author: Backend Team
 * Created: 2025-10-24
 */

import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokens } from '../utils/jwt';
import { isValidEmail, sanitizeString } from '../utils/validation';
import { validatePasswordStrength } from '../utils/password';

/**
 * Interface สำหรับ register input
 */
export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
  username?: string;
}

/**
 * Interface สำหรับ register result
 */
export interface RegisterResult {
  user: {
    id: string;
    email: string;
    username: string | null;
    role: {
      name: string;
    };
    createdAt: Date;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Error class สำหรับ validation errors
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: string[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Interface สำหรับ login input
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Interface สำหรับ login result
 */
export interface LoginResult {
  user: {
    id: string;
    email: string;
    username: string | null;
    role: {
      name: string;
    };
    lastLoginAt: Date;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * สมัครสมาชิกใหม่
 *
 * @param input - ข้อมูลการสมัครสมาชิก
 * @returns Promise<RegisterResult> - ข้อมูล user และ tokens
 * @throws ValidationError - ถ้าข้อมูล input ไม่ถูกต้อง
 * @throws Error - ถ้า email ซ้ำหรือเกิด error อื่น
 *
 * @example
 * ```typescript
 * const result = await register({
 *   email: 'user@example.com',
 *   password: 'Password123!',
 *   confirmPassword: 'Password123!',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 * ```
 */
export async function register(
  input: RegisterInput
): Promise<RegisterResult> {
  const errors: string[] = [];

  // Sanitize input
  const email = sanitizeString(input.email).toLowerCase();
  const password = input.password;
  const confirmPassword = input.confirmPassword;
  const username = sanitizeString(input.username);

  // Validate email
  if (!email) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Invalid email format');
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  } else {
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  // Validate confirm password
  if (!confirmPassword) {
    errors.push('Confirm password is required');
  } else if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  // ถ้ามี validation errors ให้ throw
  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  // ตรวจสอบว่า email ซ้ำหรือไม่
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // หา default role (free)
  const freeRole = await prisma.role.findUnique({
    where: { name: 'free' },
  });

  if (!freeRole) {
    throw new Error('Default role not found');
  }

  // สร้าง user ใหม่
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      username: username || null,
      roleId: freeRole.id,
      isActive: true,
    },
    include: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  // Generate JWT tokens
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    roleId: user.roleId,
  });

  // Return user data และ tokens
  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
    },
    tokens,
  };
}


/**
 * เข้าสู่ระบบ
 *
 * @param input - ข้อมูลการเข้าสู่ระบบ (email หรือ username)
 * @returns Promise<LoginResult> - ข้อมูล user และ tokens
 * @throws ValidationError - ถ้าข้อมูล input ไม่ถูกต้อง
 * @throws Error - ถ้า credentials ไม่ถูกต้องหรือ user ไม่ active
 *
 * @example
 * ```typescript
 * const result = await login({
 *   email: 'user@example.com',
 *   password: 'Password123!'
 * });
 * ```
 */
export async function login(input: LoginInput): Promise<LoginResult> {
  const errors: string[] = [];

  // Sanitize input
  const emailOrUsername = sanitizeString(input.email).toLowerCase();
  const password = input.password;

  // Validate email or username
  if (!emailOrUsername) {
    errors.push('Email or username is required');
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  }

  // ถ้ามี validation errors ให้ throw
  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  // หา user จาก email หรือ username
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: emailOrUsername },
        { username: emailOrUsername },
      ],
    },
    include: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  // ตรวจสอบว่ามี user หรือไม่
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // ตรวจสอบว่า user active หรือไม่
  if (!user.isActive) {
    throw new Error('User account is inactive');
  }

  // เปรียบเทียบรหัสผ่าน
  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // อัปเดต last_login_at
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
    },
    include: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  // Generate JWT tokens
  const tokens = generateTokens({
    userId: updatedUser.id,
    email: updatedUser.email,
    roleId: updatedUser.roleId,
  });

  // Return user data และ tokens
  return {
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      role: updatedUser.role,
      lastLoginAt: updatedUser.lastLoginAt!,
    },
    tokens,
  };
}


/**
 * Interface สำหรับ refresh token input
 */
export interface RefreshTokenInput {
  refreshToken: string;
}

/**
 * Interface สำหรับ refresh token result
 */
export interface RefreshTokenResult {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Refresh access token
 *
 * @param input - ข้อมูล refresh token
 * @returns Promise<RefreshTokenResult> - tokens ใหม่
 * @throws ValidationError - ถ้าข้อมูล input ไม่ถูกต้อง
 * @throws Error - ถ้า refresh token ไม่ถูกต้องหรือหมดอายุ
 *
 * @example
 * ```typescript
 * const result = await refreshToken({
 *   refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 * });
 * ```
 */
export async function refreshToken(
  input: RefreshTokenInput
): Promise<RefreshTokenResult> {
  const errors: string[] = [];

  // Validate refresh token
  if (!input.refreshToken) {
    errors.push('Refresh token is required');
  }

  // ถ้ามี validation errors ให้ throw
  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  // Verify refresh token
  const { verifyRefreshToken } = await import('../utils/jwt');
  const decoded = verifyRefreshToken(input.refreshToken);

  if (!decoded) {
    throw new Error('Invalid or expired refresh token');
  }

  // ตรวจสอบว่า user ยังมีอยู่และ active
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.isActive) {
    throw new Error('User account is inactive');
  }

  // Generate tokens ใหม่
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    roleId: user.roleId,
  });

  // Return tokens ใหม่
  return {
    tokens,
  };
}
