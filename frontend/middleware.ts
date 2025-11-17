/**
 * ไฟล์: middleware.ts
 * 
 * คำอธิบาย:
 * Next.js Middleware สำหรับ protect routes
 * - ตรวจสอบ JWT token
 * - Redirect ไป /login ถ้าไม่มี token
 * - Protect routes: /dashboard/*, /projects/*, /transcripts/*
 * 
 * Author: Frontend Team
 * Created: 2024-11-17
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware function
 * ทำงานก่อนที่ request จะถึง page
 */
export function middleware(request: NextRequest) {
  // ดึง token จาก localStorage (ผ่าน cookie หรือ header)
  // เนื่องจาก middleware ทำงานฝั่ง server จึงไม่สามารถเข้าถึง localStorage ได้
  // ต้องใช้ cookie แทน หรือตรวจสอบผ่าน header
  
  const token = request.cookies.get('accessToken')?.value;
  
  // ถ้าไม่มี token และพยายามเข้า protected routes
  if (!token && (
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/projects') ||
    request.nextUrl.pathname.startsWith('/transcripts')
  )) {
    // Redirect ไป login page
    const loginUrl = new URL('/login', request.url);
    // เก็บ URL ที่ต้องการเข้าถึงไว้ เพื่อ redirect กลับหลัง login
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // ถ้ามี token หรือไม่ใช่ protected route ให้ผ่านไปได้
  return NextResponse.next();
}

/**
 * Config
 * กำหนด routes ที่ต้องการให้ middleware ทำงาน
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/projects/:path*',
    '/transcripts/:path*',
  ],
};
