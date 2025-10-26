// JWT utilities - สร้างและ verify token
import jwt from 'jsonwebtoken';

// Secret keys จาก environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

// Token expiry
const ACCESS_TOKEN_EXPIRY = '24h'; // 24 ชั่วโมง
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 วัน

// สร้าง access token
export const generateAccessToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

// สร้าง refresh token
export const generateRefreshToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

// Verify access token
export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};
