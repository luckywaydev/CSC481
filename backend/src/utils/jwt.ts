/**
 * ไฟล์: jwt.ts
 *
 * คำอธิบาย:
 * Utility functions สำหรับจัดการ JWT tokens
 * - สร้าง access token และ refresh token
 * - Verify และ decode tokens
 * - Extract token จาก request header
 *
 * Security:
 * - Access token หมดอายุใน 24 ชั่วโมง (ตาม requirement 33.2)
 * - Refresh token หมดอายุใน 7 วัน
 * - ใช้ secret keys แยกกัน
 *
 * Author: Backend Team
 * Created: 2025-10-24
 */

import jwt from 'jsonwebtoken';

/**
 * Interface สำหรับ JWT payload
 */
export interface JwtPayload {
  userId: string;
  email: string;
  roleId: string;
}

/**
 * Interface สำหรับ decoded JWT
 */
export interface DecodedToken extends JwtPayload {
  iat: number; // issued at
  exp: number; // expiration time
}

/**
 * ดึง JWT secrets จาก environment variables
 */
const JWT_SECRET: string = process.env.JWT_SECRET || 'default-secret-key';
const JWT_REFRESH_SECRET: string =
  process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key';

/**
 * ระยะเวลาหมดอายุของ tokens
 */
const ACCESS_TOKEN_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h'; // 24 ชั่วโมง
const REFRESH_TOKEN_EXPIRES_IN: string = '7d'; // 7 วัน

/**
 * สร้าง access token
 *
 * @param payload - ข้อมูลที่ต้องการเก็บใน token (userId, email, roleId)
 * @returns string - JWT access token
 *
 * @example
 * ```typescript
 * const token = generateAccessToken({
 *   userId: '123',
 *   email: 'user@example.com',
 *   roleId: 'role-id'
 * });
 * ```
 */
export function generateAccessToken(payload: JwtPayload): string {
  try {
    // สร้าง JWT token
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    } as jwt.SignOptions);
    return token;
  } catch (error) {
    console.error('Error generating access token:', error);
    throw new Error('Failed to generate access token');
  }
}

/**
 * สร้าง refresh token
 *
 * @param payload - ข้อมูลที่ต้องการเก็บใน token (userId, email, roleId)
 * @returns string - JWT refresh token
 *
 * @example
 * ```typescript
 * const refreshToken = generateRefreshToken({
 *   userId: '123',
 *   email: 'user@example.com',
 *   roleId: 'role-id'
 * });
 * ```
 */
export function generateRefreshToken(payload: JwtPayload): string {
  try {
    // สร้าง JWT refresh token (ใช้ secret แยกต่างหาก)
    const token = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    } as jwt.SignOptions);
    return token;
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
}

/**
 * สร้าง access token และ refresh token พร้อมกัน
 *
 * @param payload - ข้อมูลที่ต้องการเก็บใน tokens
 * @returns object - { accessToken, refreshToken }
 *
 * @example
 * ```typescript
 * const tokens = generateTokens({
 *   userId: '123',
 *   email: 'user@example.com',
 *   roleId: 'role-id'
 * });
 * console.log(tokens.accessToken);
 * console.log(tokens.refreshToken);
 * ```
 */
export function generateTokens(payload: JwtPayload): {
  accessToken: string;
  refreshToken: string;
} {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
  };
}

/**
 * Verify และ decode access token
 *
 * @param token - JWT access token
 * @returns DecodedToken | null - decoded payload หรือ null ถ้า invalid
 *
 * @example
 * ```typescript
 * const decoded = verifyAccessToken(token);
 * if (decoded) {
 *   console.log('User ID:', decoded.userId);
 * }
 * ```
 */
export function verifyAccessToken(token: string): DecodedToken | null {
  try {
    // Verify และ decode token
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    // Token invalid หรือหมดอายุ
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid access token:', error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.error('Access token expired:', error.message);
    } else {
      console.error('Error verifying access token:', error);
    }
    return null;
  }
}

/**
 * Verify และ decode refresh token
 *
 * @param token - JWT refresh token
 * @returns DecodedToken | null - decoded payload หรือ null ถ้า invalid
 *
 * @example
 * ```typescript
 * const decoded = verifyRefreshToken(refreshToken);
 * if (decoded) {
 *   // สร้าง access token ใหม่
 *   const newAccessToken = generateAccessToken({
 *     userId: decoded.userId,
 *     email: decoded.email,
 *     roleId: decoded.roleId
 *   });
 * }
 * ```
 */
export function verifyRefreshToken(token: string): DecodedToken | null {
  try {
    // Verify และ decode refresh token (ใช้ secret แยกต่างหาก)
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    // Token invalid หรือหมดอายุ
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid refresh token:', error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.error('Refresh token expired:', error.message);
    } else {
      console.error('Error verifying refresh token:', error);
    }
    return null;
  }
}

/**
 * Extract JWT token จาก Authorization header
 *
 * @param authHeader - Authorization header value (Bearer <token>)
 * @returns string | null - token หรือ null ถ้าไม่มี
 *
 * @example
 * ```typescript
 * const token = extractTokenFromHeader(req.headers.authorization);
 * if (token) {
 *   const decoded = verifyAccessToken(token);
 * }
 * ```
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  // ตรวจสอบว่าเป็น Bearer token
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  // Extract token (ตัดคำว่า "Bearer " ออก)
  const token = authHeader.substring(7);
  return token;
}

/**
 * Decode token โดยไม่ verify (ใช้สำหรับดูข้อมูลเท่านั้น)
 *
 * @param token - JWT token
 * @returns DecodedToken | null - decoded payload หรือ null ถ้า invalid
 *
 * @example
 * ```typescript
 * const decoded = decodeToken(token);
 * if (decoded) {
 *   console.log('Token expires at:', new Date(decoded.exp * 1000));
 * }
 * ```
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    // Decode โดยไม่ verify
    const decoded = jwt.decode(token) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}
