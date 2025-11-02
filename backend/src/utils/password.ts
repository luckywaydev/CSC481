/**
 * ไฟล์: password.ts
 *
 * คำอธิบาย:
 * Utility functions สำหรับจัดการรหัสผ่าน
 * - Hash รหัสผ่านด้วย bcrypt
 * - เปรียบเทียบรหัสผ่านกับ hash
 *
 * Security:
 * - ใช้ bcrypt cost factor 12 (ตาม requirement 33.1)
 * - ป้องกัน timing attacks
 *
 * Author: Backend Team
 * Created: 2025-10-24
 */

import bcrypt from 'bcrypt';

/**
 * Cost factor สำหรับ bcrypt hashing
 * ค่าสูงขึ้น = ปลอดภัยขึ้น แต่ช้าลง
 * Requirement 33.1: ต้องมีค่าอย่างน้อย 10
 */
const SALT_ROUNDS = 12;

/**
 * Hash รหัสผ่านด้วย bcrypt
 *
 * @param password - รหัสผ่านที่ต้องการ hash (plain text)
 * @returns Promise<string> - รหัสผ่านที่ hash แล้ว
 *
 * @example
 * ```typescript
 * const hashedPassword = await hashPassword('MyPassword123');
 * // $2b$12$...
 * ```
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // Hash รหัสผ่านด้วย bcrypt
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    // Log error และ throw ต่อ
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * เปรียบเทียบรหัสผ่าน plain text กับ hash
 *
 * @param password - รหัสผ่าน plain text
 * @param hash - รหัสผ่านที่ hash แล้ว
 * @returns Promise<boolean> - true ถ้าตรงกัน, false ถ้าไม่ตรงกัน
 *
 * @example
 * ```typescript
 * const isValid = await comparePassword('MyPassword123', hashedPassword);
 * if (isValid) {
 *   console.log('Password correct!');
 * }
 * ```
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    // เปรียบเทียบรหัสผ่าน
    // bcrypt.compare ป้องกัน timing attacks อัตโนมัติ
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    // Log error และ return false
    console.error('Error comparing password:', error);
    return false;
  }
}

/**
 * ตรวจสอบความแข็งแรงของรหัสผ่าน
 *
 * @param password - รหัสผ่านที่ต้องการตรวจสอบ
 * @returns object - { isValid: boolean, errors: string[] }
 *
 * กฎการตรวจสอบ:
 * - ความยาวอย่างน้อย 8 ตัวอักษร
 *
 * หมายเหตุ: สามารถเพิ่มกฎเพิ่มเติมได้ที่ฟังก์ชันนี้
 * เช่น ตัวพิมพ์ใหญ่/เล็ก, ตัวเลข, อักขระพิเศษ
 *
 * @example
 * ```typescript
 * const result = validatePasswordStrength('weak');
 * if (!result.isValid) {
 *   console.log('Errors:', result.errors);
 * }
 * ```
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // ตรวจสอบความยาว
  if (password.length < 8) {
    errors.push('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
  }

  // เพิ่มกฎเพิ่มเติมได้ที่นี่ เช่น:
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว');
  // }
  // if (!/[a-z]/.test(password)) {
  //   errors.push('รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว');
  // }
  // if (!/[0-9]/.test(password)) {
  //   errors.push('รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว');
  // }
  // if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
  //   errors.push('รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว');
  // }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
