// Password utilities - hash และ compare password
import bcrypt from 'bcrypt';

// จำนวนรอบการ hash (ยิ่งเยอะยิ่งปลอดภัย แต่ช้า)
const SALT_ROUNDS = 10;

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// Compare password กับ hash
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
