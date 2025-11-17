/**
 * ไฟล์: storage.ts
 *
 * คำอธิบาย:
 * Utility สำหรับจัดการ file storage
 * - Multer configuration
 * - File validation
 * - File path management
 *
 * Author: Backend Team
 * Created: 2024-11-17
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Upload directory
 */
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads/audio';

/**
 * สร้าง upload directory ถ้ายังไม่มี
 */
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`📁 Created upload directory: ${UPLOAD_DIR}`);
}

/**
 * Multer storage configuration
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedName}${ext}`);
  },
});

/**
 * File filter - ตรวจสอบประเภทไฟล์
 */
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed file types
  const allowedMimeTypes = [
    'audio/mpeg', // MP3
    'audio/wav', // WAV
    'audio/x-wav', // WAV (alternative)
    'audio/mp4', // M4A
    'audio/x-m4a', // M4A (alternative)
    'audio/flac', // FLAC
    'audio/x-flac', // FLAC (alternative)
  ];

  const allowedExtensions = ['.mp3', '.wav', '.m4a', '.flac'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`
      )
    );
  }
};

/**
 * Multer upload configuration
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '100') * 1024 * 1024, // Default 100MB
  },
});

/**
 * Get file path
 */
export function getFilePath(filename: string): string {
  return path.join(UPLOAD_DIR, filename);
}

/**
 * Delete file
 */
export function deleteFile(filename: string): void {
  const filePath = getFilePath(filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`🗑️  Deleted file: ${filename}`);
  }
}

/**
 * Check if file exists
 */
export function fileExists(filename: string): boolean {
  const filePath = getFilePath(filename);
  return fs.existsSync(filePath);
}

/**
 * Get file size
 */
export function getFileSize(filename: string): number {
  const filePath = getFilePath(filename);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    return stats.size;
  }
  return 0;
}
