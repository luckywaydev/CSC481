/**
 * ไฟล์: audioController.ts
 *
 * คำอธิบาย:
 * Controller สำหรับจัดการ Audio Files endpoints
 * - POST /projects/:projectId/audio/upload - อัปโหลดไฟล์เสียง
 * - GET /audio/:audioId - ดึงข้อมูลไฟล์เสียง
 * - GET /audio/:audioId/file - ดาวน์โหลดไฟล์เสียง
 * - DELETE /audio/:audioId - ลบไฟล์เสียง
 *
 * Author: Backend Team
 * Created: 2024-11-17
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createAudioFile,
  getAudioFile,
  getAudioFilesByProject,
  deleteAudioFile,
  updateAudioFileStatus,
} from '../services/audioService';
import { getFilePath, fileExists } from '../utils/storage';
import {
  transcribeAudio,
  saveTranscript,
} from '../services/replicateService';
import fs from 'fs';

/**
 * POST /api/v1/projects/:projectId/audio/upload
 * อัปโหลดไฟล์เสียง
 */
export async function uploadAudioController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const { projectId } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded',
        },
      });
      return;
    }

    // สร้าง audio file record
    const audioFile = await createAudioFile(projectId, req.user.userId, file);

    // แปลง BigInt เป็น Number เพื่อให้ JSON.stringify ทำงานได้
    const audioFileResponse = {
      ...audioFile,
      fileSizeBytes: Number(audioFile.fileSizeBytes),
      durationSeconds: audioFile.durationSeconds ? Number(audioFile.durationSeconds) : null,
    };

    res.status(201).json({
      message: 'File uploaded successfully',
      data: {
        audioFile: audioFileResponse,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Project not found') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found',
        },
      });
      return;
    }

    console.error('Upload audio error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to upload file',
      },
    });
  }
}

/**
 * GET /api/v1/audio/:audioId
 * ดึงข้อมูลไฟล์เสียง
 */
export async function getAudioFileController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const { audioId } = req.params;

    const audioFile = await getAudioFile(audioId, req.user.userId);

    if (!audioFile) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Audio file not found',
        },
      });
      return;
    }

    res.json({
      message: 'Audio file retrieved successfully',
      data: {
        audioFile,
      },
    });
  } catch (error) {
    console.error('Get audio file error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get audio file',
      },
    });
  }
}

/**
 * GET /api/v1/audio/:audioId/file
 * ดาวน์โหลด/Stream ไฟล์เสียง
 */
export async function serveAudioFileController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const { audioId } = req.params;

    // ดึงข้อมูล audio file
    const audioFile = await getAudioFile(audioId, req.user.userId);

    if (!audioFile) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Audio file not found',
        },
      });
      return;
    }

    // ตรวจสอบว่าไฟล์มีอยู่จริง
    const filePath = getFilePath(audioFile.storedFilename);
    if (!fileExists(audioFile.storedFilename)) {
      res.status(404).json({
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found on server',
        },
      });
      return;
    }

    // Set headers
    res.setHeader('Content-Type', audioFile.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${audioFile.originalFilename}"`
    );
    res.setHeader('Content-Length', audioFile.fileSizeBytes.toString());

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Serve audio file error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to serve audio file',
      },
    });
  }
}

/**
 * DELETE /api/v1/audio/:audioId
 * ลบไฟล์เสียง
 */
export async function deleteAudioFileController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const { audioId } = req.params;

    await deleteAudioFile(audioId, req.user.userId);

    res.json({
      message: 'Audio file deleted successfully',
      data: {
        success: true,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Audio file not found') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Audio file not found',
        },
      });
      return;
    }

    console.error('Delete audio file error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete audio file',
      },
    });
  }
}

/**
 * GET /api/v1/projects/:projectId/audio
 * ดึงรายการไฟล์เสียงของ project
 */
export async function getProjectAudioFilesController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const { projectId } = req.params;

    const audioFiles = await getAudioFilesByProject(
      projectId,
      req.user.userId
    );

    res.json({
      message: 'Audio files retrieved successfully',
      data: {
        audioFiles,
        count: audioFiles.length,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Project not found') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found',
        },
      });
      return;
    }

    console.error('Get project audio files error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get audio files',
      },
    });
  }
}

/**
 * POST /api/v1/audio/:audioId/transcribe
 * ถอดเสียงด้วย Replicate API
 */
export async function transcribeAudioController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const { audioId } = req.params;
    const { language, task, numSpeakers, minSpeakers, maxSpeakers } = req.body;

    // ดึงข้อมูล audio file
    const audioFile = await getAudioFile(audioId, req.user.userId);

    if (!audioFile) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Audio file not found',
        },
      });
      return;
    }

    // ตรวจสอบว่าไฟล์มีอยู่จริง
    if (!fileExists(audioFile.storedFilename)) {
      res.status(404).json({
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'Audio file not found on server',
        },
      });
      return;
    }

    // อัปเดตสถานะเป็น PROCESSING
    await updateAudioFileStatus(audioId, 'PROCESSING');

    // สร้าง public URL สำหรับ audio file
    // ใช้ full URL ที่ Replicate สามารถเข้าถึงได้
    const baseUrl =
      process.env.API_URL || `http://localhost:${process.env.PORT || 4000}`;
    const audioUrl = `${baseUrl}/api/v1/audio/${audioId}/file`;

    console.log('🎙️  Starting transcription for:', audioFile.originalFilename);
    console.log('Audio URL:', audioUrl);

    // เริ่ม transcription (async)
    // ส่ง response กลับทันที แล้วทำงานต่อใน background
    res.status(202).json({
      message: 'Transcription started',
      data: {
        audioId,
        status: 'PROCESSING',
      },
    });

    // ทำงานต่อใน background
    try {
      // Transcribe
      const transcriptData = await transcribeAudio(audioUrl, {
        task: task || 'transcribe',
        language: language || 'None',
        diariseAudio: true,
        numSpeakers: numSpeakers ? parseInt(numSpeakers) : undefined,
        minSpeakers: minSpeakers ? parseInt(minSpeakers) : undefined,
        maxSpeakers: maxSpeakers ? parseInt(maxSpeakers) : undefined,
      });

      // Save to database
      await saveTranscript(audioId, transcriptData);

      console.log('✅ Transcription completed for:', audioFile.originalFilename);
    } catch (error) {
      console.error('❌ Transcription failed:', error);

      // อัปเดตสถานะเป็น FAILED
      await updateAudioFileStatus(audioId, 'FAILED');
    }
  } catch (error) {
    console.error('Transcribe audio error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to start transcription',
      },
    });
  }
}

/**
 * POST /api/v1/projects/:projectId/audio/upload-and-transcribe
 * อัปโหลดไฟล์เสียงและเริ่มถอดเสียงทันที
 */
export async function uploadAndTranscribeController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const { projectId } = req.params;
    const file = req.file;
    const { task, language, numSpeakers, minSpeakers, maxSpeakers } = req.body;

    if (!file) {
      res.status(400).json({
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded',
        },
      });
      return;
    }

    // สร้าง audio file record
    const audioFile = await createAudioFile(projectId, req.user.userId, file);

    // อัปเดตสถานะเป็น PROCESSING
    await updateAudioFileStatus(audioFile.id, 'PROCESSING');

    // สร้าง public URL สำหรับ audio file
    const baseUrl =
      process.env.API_URL || `http://localhost:${process.env.PORT || 4000}`;
    const audioUrl = `${baseUrl}/api/v1/audio/${audioFile.id}/file`;

    console.log('🎙️  Starting upload and transcription for:', audioFile.originalFilename);
    console.log('Audio URL:', audioUrl);
    console.log('Options:', { task, language, numSpeakers, minSpeakers, maxSpeakers });

    // ส่ง response กลับทันที
    // แปลง BigInt เป็น Number เพื่อให้ JSON.stringify ทำงานได้
    const audioFileResponse = {
      ...audioFile,
      fileSizeBytes: Number(audioFile.fileSizeBytes),
      durationSeconds: audioFile.durationSeconds ? Number(audioFile.durationSeconds) : null,
    };

    res.status(202).json({
      message: 'File uploaded and transcription started',
      data: {
        audioFile: audioFileResponse,
        transcription: {
          audioId: audioFile.id,
          status: 'PROCESSING',
        },
      },
    });

    // ทำงานต่อใน background
    try {
      // อ่านไฟล์จาก storage
      const filePath = getFilePath(audioFile.storedFilename);
      const audioBuffer = fs.readFileSync(filePath);
      
      // Transcribe โดยส่งไฟล์โดยตรง
      const transcriptData = await transcribeAudio(audioBuffer, {
        task: task || 'transcribe',
        language: language || 'None',
        diariseAudio: true,
        numSpeakers: numSpeakers ? parseInt(numSpeakers) : undefined,
        minSpeakers: minSpeakers ? parseInt(minSpeakers) : undefined,
        maxSpeakers: maxSpeakers ? parseInt(maxSpeakers) : undefined,
      });

      // Save to database
      await saveTranscript(audioFile.id, transcriptData);

      console.log('✅ Transcription completed for:', audioFile.originalFilename);
    } catch (error) {
      console.error('❌ Transcription failed:', error);

      // อัปเดตสถานะเป็น FAILED
      await updateAudioFileStatus(audioFile.id, 'FAILED');
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Project not found') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found',
        },
      });
      return;
    }

    console.error('Upload and transcribe error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to upload and transcribe',
      },
    });
  }
}
