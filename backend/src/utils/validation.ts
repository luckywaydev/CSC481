/**
 * ไฟล์: validation.ts
 *
 * คำอธิบาย:
 * Utility functions สำหรับ validation
 * - ตรวจสอบรูปแบบ email
 * - ตรวจสอบข้อมูล input
 *
 * Author: Backend Team
 * Created: 2025-10-24
 */

/**
 * ตรวจสอบรูปแบบ email
 *
 * @param email - email ที่ต้องการตรวจสอบ
 * @returns boolean - true ถ้ารูปแบบถูกต้อง
 *
 * @example
 * ```typescript
 * const isValid = isValidEmail('user@example.com'); // true
 * const isInvalid = isValidEmail('invalid-email'); // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  // Regular expression สำหรับตรวจสอบ email
  // รองรับรูปแบบ: username@domain.tld
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * ตรวจสอบว่า string ไม่ว่างเปล่า
 *
 * @param value - string ที่ต้องการตรวจสอบ
 * @returns boolean - true ถ้าไม่ว่างเปล่า
 */
export function isNotEmpty(value: string | undefined | null): boolean {
  return value !== undefined && value !== null && value.trim().length > 0;
}

/**
 * Sanitize string โดยตัด whitespace
 *
 * @param value - string ที่ต้องการ sanitize
 * @returns string - string ที่ sanitize แล้ว
 */
export function sanitizeString(value: string | undefined | null): string {
  if (!value) return '';
  return value.trim();
}

/**
 * ตรวจสอบความยาวของ string
 *
 * @param value - string ที่ต้องการตรวจสอบ
 * @param min - ความยาวขั้นต่ำ
 * @param max - ความยาวสูงสุด (optional)
 * @returns boolean - true ถ้าความยาวอยู่ในช่วงที่กำหนด
 */
export function isValidLength(
  value: string,
  min: number,
  max?: number
): boolean {
  const length = value.length;
  if (length < min) return false;
  if (max !== undefined && length > max) return false;
  return true;
}
