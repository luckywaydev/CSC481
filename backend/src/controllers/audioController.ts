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
import { prisma } from '../utils/prisma';
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
 * ดาวน์โหลด/Stream ไฟล์เสียง (Public - สำหรับ Replicate)
 */
export async function serveAudioFileController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    // Allow public access for Replicate (no authentication required)
    const { audioId } = req.params;

    // ดึงข้อมูล audio file (public access - no user check)
    const audioFile = await prisma.audioFile.findUnique({
      where: { id: audioId },
    });

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
 * GET /api/v1/audio/:audioId/stream
 * Stream audio file สำหรับเล่นในเบราว์เซอร์
 */
export async function streamAudioFileController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    // Allow public access for Audio Player (no authentication required)
    const { audioId } = req.params;

    // Get audio file (public access - no user check)
    const audioFile = await prisma.audioFile.findUnique({
      where: { id: audioId },
    });

    if (!audioFile) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Audio file not found',
        },
      });
      return;
    }

    // Check if file exists
    const filePath = getFilePath(audioFile.storedFilename);
    if (!fileExists(audioFile.storedFilename)) {
      res.status(404).json({
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'Audio file not found on server',
        },
      });
      return;
    }

    // Get file stats
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Handle range request (for seeking)
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': audioFile.mimeType,
      });

      file.pipe(res);
    } else {
      // Stream entire file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': audioFile.mimeType,
        'Accept-Ranges': 'bytes',
      });

      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error('Stream audio file error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to stream audio file',
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
 * ถอดเสียงด้วย Replicate API (ส่งไฟล์โดยตรงไปยัง Replicate - เร็ว!)
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
    const { language, task, targetLanguage, numSpeakers, minSpeakers, maxSpeakers } = req.body;

    console.log('🎯 Transcribe request received:', { audioId, task, language, targetLanguage });

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
          message: 'Audio file not found on server',
        },
      });
      return;
    }

    // อัปเดตสถานะเป็น PROCESSING
    await updateAudioFileStatus(audioId, 'PROCESSING');

    console.log('🎙️  Starting transcription for:', audioFile.originalFilename);

    // ส่ง response กลับทันที แล้วทำงานต่อใน background
    res.status(202).json({
      message: 'Transcription started',
      data: {
        audioId,
        status: 'PROCESSING',
      },
    });

    // ทำงานต่อใน background - อ่านไฟล์และส่งไปยัง Replicate โดยตรง
    (async () => {
      try {
        // อ่านไฟล์จาก storage
        const audioBuffer = fs.readFileSync(filePath);
        
        console.log('📤 Uploading file to Replicate (via data URI)...');
        
        // แปลงไฟล์เป็น data URI สำหรับส่งไปยัง Replicate
        const base64Audio = audioBuffer.toString('base64');
        const dataUri = `data:${audioFile.mimeType};base64,${base64Audio}`;
        
        console.log('🎙️  Starting transcription with Replicate...');

        // Transcribe โดยส่งไฟล์โดยตรง (data URI)
        // สำคัญ: ต้องส่ง task: "transcribe" เสมอ ไม่ว่าผู้ใช้จะเลือกอะไร
        // เพราะ Whisper ต้องถอดเสียงก่อน แล้วค่อยแปลภาษาทีหลัง
        const { output: transcriptData, predictionId } = await transcribeAudio(dataUri, {
          task: 'transcribe', // บังคับให้เป็น transcribe เสมอ
          language: language || 'None',
          diariseAudio: true,
          numSpeakers: numSpeakers ? parseInt(numSpeakers) : undefined,
          minSpeakers: minSpeakers ? parseInt(minSpeakers) : undefined,
          maxSpeakers: maxSpeakers ? parseInt(maxSpeakers) : undefined,
        });

        // บันทึก prediction ID
        await prisma.audioFile.update({
          where: { id: audioId },
          data: { replicatePredictionId: predictionId },
        });

        // Save to database
        const transcript = await saveTranscript(audioId, transcriptData);

        console.log('✅ Transcription completed for:', audioFile.originalFilename);

        // ถ้าผู้ใช้เลือก task แปลภาษา ให้ทำการแปลต่อ (หลังจากถอดเสียงเสร็จแล้ว)
        console.log('🔍 Checking translation:', { task, targetLanguage, hasTranscript: !!transcript });
        if (task === 'translate' && targetLanguage && transcript) {
          console.log('🌐 Starting translation to:', targetLanguage);
          
          try {
            // สร้าง SRT text จาก segments
            const srtText = transcript.segments
              ?.map((seg: any, index: number) => {
                const startTime = formatSrtTime(seg.startTime);
                const endTime = formatSrtTime(seg.endTime);
                const speakerName = seg.speaker?.name || `Speaker ${index + 1}`;
                return `${index + 1}\n${startTime} --> ${endTime}\n${speakerName}: ${seg.text}\n`;
              })
              .join('\n');

            if (!srtText) {
              throw new Error('No segments to translate');
            }

            // แปลภาษา
            const { translateSrt } = await import('../services/replicateService');
            const translatedSrt = await translateSrt(srtText, targetLanguage);

            // Parse translated SRT และบันทึกเป็น transcript ใหม่
            const translatedSegments = parseSrt(translatedSrt);
            
            // สร้าง transcript ใหม่สำหรับผลลัพธ์การแปล
            const translatedTranscript = await prisma.transcript.create({
              data: {
                audioFileId: audioId,
                language: targetLanguage,
                wordCount: translatedSrt.split(/\s+/).length,
                confidenceScore: null,
              },
            });

            // บันทึก segments ที่แปลแล้ว
            for (let i = 0; i < translatedSegments.length; i++) {
              const seg = translatedSegments[i];
              const originalSeg = transcript.segments?.[i];
              
              await prisma.transcriptSegment.create({
                data: {
                  transcriptId: translatedTranscript.id,
                  segmentIndex: i,
                  startTime: seg.startTime,
                  endTime: seg.endTime,
                  text: seg.text,
                  speakerId: originalSeg?.speakerId || null,
                  confidenceScore: null,
                },
              });
            }

            // Copy speakers จาก transcript เดิม
            if (transcript.speakers && transcript.speakers.length > 0) {
              for (const speaker of transcript.speakers) {
                await prisma.speaker.create({
                  data: {
                    transcriptId: translatedTranscript.id,
                    name: speaker.name,
                    displayOrder: speaker.displayOrder,
                    segmentCount: speaker.segmentCount,
                  },
                });
              }
            }

            console.log('✅ Translation completed for:', audioFile.originalFilename);
          } catch (error) {
            console.error('❌ Translation failed:', error);
            // ไม่ต้อง fail ทั้งหมด เพราะ transcription สำเร็จแล้ว
          }
        }
      } catch (error) {
        console.error('❌ Transcription failed:', error);
        await updateAudioFileStatus(audioId, 'FAILED');
      }
    })();
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
 * Helper function: Format time to SRT format (HH:MM:SS,mmm)
 */
function formatSrtTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

/**
 * Helper function: Parse SRT text to segments
 */
function parseSrt(srtText: string): Array<{ startTime: number; endTime: number; text: string }> {
  const segments: Array<{ startTime: number; endTime: number; text: string }> = [];
  const blocks = srtText.trim().split('\n\n');
  
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 3) continue;
    
    // Parse timestamp line (e.g., "00:00:00,000 --> 00:00:04,000")
    const timestampLine = lines[1];
    const timestampMatch = timestampLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    
    if (!timestampMatch) continue;
    
    const startTime = 
      parseInt(timestampMatch[1]) * 3600 + 
      parseInt(timestampMatch[2]) * 60 + 
      parseInt(timestampMatch[3]) + 
      parseInt(timestampMatch[4]) / 1000;
      
    const endTime = 
      parseInt(timestampMatch[5]) * 3600 + 
      parseInt(timestampMatch[6]) * 60 + 
      parseInt(timestampMatch[7]) + 
      parseInt(timestampMatch[8]) / 1000;
    
    // Text is everything after the timestamp line
    const text = lines.slice(2).join('\n');
    
    segments.push({ startTime, endTime, text });
  }
  
  return segments;
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
      // สร้าง public URL สำหรับ audio file
      const baseUrl =
        process.env.API_URL || `http://localhost:${process.env.PORT || 4000}`;
      const audioUrl = `${baseUrl}/api/v1/audio/${audioFile.id}/file`;
      
      // Transcribe โดยใช้ URL
      const { output: transcriptData, predictionId } = await transcribeAudio(audioUrl, {
        task: task || 'transcribe',
        language: language || 'None',
        diariseAudio: true,
        numSpeakers: numSpeakers ? parseInt(numSpeakers) : undefined,
        minSpeakers: minSpeakers ? parseInt(minSpeakers) : undefined,
        maxSpeakers: maxSpeakers ? parseInt(maxSpeakers) : undefined,
      });

      // บันทึก prediction ID
      await prisma.audioFile.update({
        where: { id: audioFile.id },
        data: { replicatePredictionId: predictionId },
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

/**
 * POST /api/v1/audio/:audioId/get-upload-url
 * ขอ presigned URL สำหรับอัปโหลดไฟล์ไปยัง Replicate โดยตรง
 */
export async function getUploadUrlController(
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
    const { filename } = req.body;

    if (!filename) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Filename is required',
        },
      });
      return;
    }

    // ตรวจสอบว่า audio file มีอยู่ใน database
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

    // สร้าง presigned URL จาก Replicate
    const { createFileUpload } = await import('../services/replicateService');
    const { uploadUrl, fileUrl } = await createFileUpload(filename);

    res.json({
      message: 'Upload URL created successfully',
      data: {
        uploadUrl,
        fileUrl,
      },
    });
  } catch (error) {
    console.error('Get upload URL error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create upload URL',
      },
    });
  }
}

/**
 * POST /api/v1/audio/:audioId/transcribe-from-url
 * ถอดเสียงจาก Replicate file URL (หลังจาก frontend อัปโหลดแล้ว)
 */
export async function transcribeFromUrlController(
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
    const { fileUrl, task, language, numSpeakers, minSpeakers, maxSpeakers } = req.body;

    if (!fileUrl) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'File URL is required',
        },
      });
      return;
    }

    // ตรวจสอบว่า audio file มีอยู่ใน database
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

    // อัปเดตสถานะเป็น PROCESSING
    await updateAudioFileStatus(audioId, 'PROCESSING');

    console.log('🎙️  Starting transcription from Replicate URL:', fileUrl);

    // ส่ง response กลับทันที
    res.status(202).json({
      message: 'Transcription started',
      data: {
        audioId,
        status: 'PROCESSING',
      },
    });

    // ทำงานต่อใน background
    try {
      const { output: transcriptData, predictionId } = await transcribeAudio(fileUrl, {
        task: task || 'transcribe',
        language: language || 'None',
        diariseAudio: true,
        numSpeakers: numSpeakers ? parseInt(numSpeakers) : undefined,
        minSpeakers: minSpeakers ? parseInt(minSpeakers) : undefined,
        maxSpeakers: maxSpeakers ? parseInt(maxSpeakers) : undefined,
      });

      // บันทึก prediction ID
      await prisma.audioFile.update({
        where: { id: audioId },
        data: { replicatePredictionId: predictionId },
      });

      // Save to database
      await saveTranscript(audioId, transcriptData);

      console.log('✅ Transcription completed for:', audioFile.originalFilename);
    } catch (error) {
      console.error('❌ Transcription failed:', error);
      await updateAudioFileStatus(audioId, 'FAILED');
    }
  } catch (error) {
    console.error('Transcribe from URL error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to start transcription',
      },
    });
  }
}
