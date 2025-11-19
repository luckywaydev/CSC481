/**
 * ไฟล์: audioRoutes.ts
 *
 * คำอธิบาย:
 * Routes สำหรับ Audio Files endpoints
 * - POST /projects/:projectId/audio/upload - อัปโหลดไฟล์เสียง
 * - GET /projects/:projectId/audio - ดึงรายการไฟล์เสียง
 * - GET /audio/:audioId - ดึงข้อมูลไฟล์เสียง
 * - GET /audio/:audioId/file - ดาวน์โหลดไฟล์เสียง
 * - DELETE /audio/:audioId - ลบไฟล์เสียง
 *
 * Author: Backend Team
 * Created: 2024-11-17
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../utils/storage';
import {
  uploadAudioController,
  getAudioFileController,
  serveAudioFileController,
  streamAudioFileController,
  deleteAudioFileController,
  getProjectAudioFilesController,
  transcribeAudioController,
  uploadAndTranscribeController,
  getUploadUrlController,
  transcribeFromUrlController,
} from '../controllers/audioController';
import {
  getTranscriptController,
  updateSegmentController,
  updateSpeakerController,
  downloadTranscriptTxtController,
  downloadTranscriptSrtController,
} from '../controllers/transcriptController';

/**
 * สร้าง router instance
 */
const router = Router();

/**
 * POST /api/v1/projects/:projectId/audio/upload
 * อัปโหลดไฟล์เสียง (requires authentication)
 */
router.post(
  '/projects/:projectId/audio/upload',
  authenticate,
  upload.single('audio'),
  uploadAudioController
);

/**
 * POST /api/v1/projects/:projectId/audio/upload-and-transcribe
 * อัปโหลดไฟล์เสียงและเริ่มถอดเสียงทันที (requires authentication)
 */
router.post(
  '/projects/:projectId/audio/upload-and-transcribe',
  authenticate,
  upload.single('audio'),
  uploadAndTranscribeController
);

/**
 * GET /api/v1/projects/:projectId/audio
 * ดึงรายการไฟล์เสียงของ project (requires authentication)
 */
router.get(
  '/projects/:projectId/audio',
  authenticate,
  getProjectAudioFilesController
);

/**
 * GET /api/v1/audio/:audioId
 * ดึงข้อมูลไฟล์เสียง (requires authentication)
 */
router.get('/audio/:audioId', authenticate, getAudioFileController);

/**
 * GET /api/v1/audio/:audioId/file
 * ดาวน์โหลด/Stream ไฟล์เสียง (Public - สำหรับ Replicate)
 */
router.get('/audio/:audioId/file', serveAudioFileController);

/**
 * GET /api/v1/audio/:audioId/stream
 * Stream ไฟล์เสียงสำหรับเล่นในเบราว์เซอร์ (Public - สำหรับ Audio Player)
 */
router.get('/audio/:audioId/stream', streamAudioFileController);

/**
 * DELETE /api/v1/audio/:audioId
 * ลบไฟล์เสียง (requires authentication)
 */
router.delete('/audio/:audioId', authenticate, deleteAudioFileController);

/**
 * POST /api/v1/audio/:audioId/transcribe
 * ถอดเสียงด้วย Replicate API (requires authentication)
 */
router.post('/audio/:audioId/transcribe', authenticate, transcribeAudioController);

/**
 * POST /api/v1/audio/:audioId/get-upload-url
 * ขอ presigned URL สำหรับอัปโหลดไฟล์ไปยัง Replicate โดยตรง (requires authentication)
 */
router.post('/audio/:audioId/get-upload-url', authenticate, getUploadUrlController);

/**
 * POST /api/v1/audio/:audioId/transcribe-from-url
 * ถอดเสียงจาก Replicate file URL (requires authentication)
 */
router.post('/audio/:audioId/transcribe-from-url', authenticate, transcribeFromUrlController);

/**
 * GET /api/v1/transcripts/:id
 * ดึง transcript detail (requires authentication)
 */
router.get('/transcripts/:id', authenticate, getTranscriptController);

/**
 * GET /api/v1/transcripts/:id/download/txt
 * ดาวน์โหลด transcript เป็นไฟล์ TXT (supports token in query)
 */
router.get('/transcripts/:id/download/txt', downloadTranscriptTxtController);

/**
 * GET /api/v1/transcripts/:id/download/srt
 * ดาวน์โหลด transcript เป็นไฟล์ SRT (supports token in query)
 */
router.get('/transcripts/:id/download/srt', downloadTranscriptSrtController);

/**
 * PATCH /api/v1/transcript-segments/:id
 * แก้ไข segment text (requires authentication)
 */
router.patch('/transcript-segments/:id', authenticate, updateSegmentController);

/**
 * PATCH /api/v1/speakers/:id
 * แก้ไขชื่อ speaker (requires authentication)
 */
router.patch('/speakers/:id', authenticate, updateSpeakerController);

/**
 * Export router
 */
export default router;
