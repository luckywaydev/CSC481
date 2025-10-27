// Auth Controller - จัดการ authentication
import { Request, Response } from 'express';
import { hashPassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import prisma from '../utils/prisma';

// Register - สมัครสมาชิก
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    // เชค email ซ้ำไหม
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already exists',
        },
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // สร้าง user ใหม่
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        roleId: 2, // default role: free user
      },
    });

    // สร้าง tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Return user data และ tokens
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during registration',
      },
    });
  }
};


// Login - เข้าสู่ระบบ
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // หา user จาก email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // เชค password
    const { comparePassword } = require('../utils/password');
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // สร้าง tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Return user data และ tokens
    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during login',
      },
    });
  }
};
