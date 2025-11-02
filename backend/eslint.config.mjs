/**
 * ไฟล์: eslint.config.mjs
 * 
 * คำอธิบาย:
 * ESLint Configuration สำหรับ Backend (ESLint v9 Flat Config)
 * - ตรวจสอบ code style และ syntax errors
 * - รองรับ TypeScript
 * - กำหนดกฎการเขียนโค้ด
 * 
 * Author: Backend Team
 * Created: 2025-10-23
 */

import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  // กำหนดไฟล์ที่ต้องการ lint
  {
    files: ['src/**/*.ts'],
  },
  
  // ใช้ recommended rules จาก ESLint
  eslint.configs.recommended,
  
  // กำหนดค่าสำหรับ TypeScript
  {
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // กฎพื้นฐาน
      'indent': ['error', 2],
      'linebreak-style': 'off', // ปิดเพราะ Windows ใช้ CRLF, Unix ใช้ LF
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      
      // อนุญาตให้ใช้ console.log (สำหรับ logging)
      'no-console': 'off',
      
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' }
      ],
      
      // ปิดกฎที่ขัดแย้งกับ TypeScript
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
  
  // ไฟล์ที่ไม่ต้อง lint
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.js',
      'prisma/**',
    ],
  },
];
