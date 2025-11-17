/**
 * ไฟล์: audioService.ts
 *
 * คำอธิบาย:
 * Service สำหรับจัดการ Audio Files
 * - อัปโหลดไฟล์เสียง
 * - ดึงข้อมูลไฟล์เสียง
 * - ลบไฟล์เสียง
 *
 * Author: Backend Team
 * Created: 2024-11-17
 */

import { prisma } from '../utils/prisma';
import { deleteFile } from '../utils/storage';

/**
 * สร้าง audio file record
 */
export async function createAudioFile(
  projectId: string,
  userId: string,
  file: Express.Multer.File
) {
  // ตรวจสอบว่า project เป็นของ user นี้หรือไม่
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // คำนวณเวลาหมดอายุของไฟล์ (default 1 ชั่วโมง)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  // สร้าง audio file record
  const audioFile = await prisma.audioFile.create({
    data: {
      projectId,
      originalFilename: file.originalname,
      storedFilename: file.filename,
      filePath: file.path,
      fileSizeBytes: file.size,
      mimeType: file.mimetype,
      status: 'UPLOADED',
      expiresAt,
    },
  });

  return audioFile;
}

/**
 * ดึงข้อมูล audio file
 */
export async function getAudioFile(audioId: string, userId: string) {
  const audioFile = await prisma.audioFile.findFirst({
    where: {
      id: audioId,
      deletedAt: null,
      project: {
        userId,
        deletedAt: null,
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          userId: true,
        },
      },
    },
  });

  return audioFile;
}

/**
 * ดึงรายการ audio files ของ project
 */
export async function getAudioFilesByProject(projectId: string, userId: string) {
  // ตรวจสอบว่า project เป็นของ user นี้หรือไม่
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const audioFiles = await prisma.audioFile.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    orderBy: {
      uploadedAt: 'desc',
    },
  });

  return audioFiles;
}

/**
 * ลบ audio file
 */
export async function deleteAudioFile(audioId: string, userId: string) {
  // ตรวจสอบ ownership
  const audioFile = await prisma.audioFile.findFirst({
    where: {
      id: audioId,
      deletedAt: null,
      project: {
        userId,
        deletedAt: null,
      },
    },
  });

  if (!audioFile) {
    throw new Error('Audio file not found');
  }

  // Soft delete audio file
  await prisma.audioFile.update({
    where: { id: audioId },
    data: {
      deletedAt: new Date(),
    },
  });

  // ลบไฟล์จาก storage
  try {
    deleteFile(audioFile.storedFilename);
  } catch (error) {
    console.error('Failed to delete file from storage:', error);
  }

  // ลบ transcripts ที่เกี่ยวข้อง
  await prisma.transcript.updateMany({
    where: {
      audioFileId: audioId,
    },
    data: {
      // Note: Prisma doesn't support soft delete on related records directly
      // We'll handle this in the application logic
    },
  });

  return { success: true };
}

/**
 * อัปเดตสถานะ audio file
 */
export async function updateAudioFileStatus(
  audioId: string,
  status: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED'
) {
  const audioFile = await prisma.audioFile.update({
    where: { id: audioId },
    data: {
      status,
      processedAt: status === 'COMPLETED' ? new Date() : undefined,
    },
  });

  return audioFile;
}
