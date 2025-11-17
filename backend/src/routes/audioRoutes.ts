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
  deleteAudioFileController,
  getProjectAudioFilesController,
  transcribeAudioController,
  uploadAndTranscribeController,
} from '../controllers/audioController';
import {
  getTranscriptController,
  updateSegmentController,
  updateSpeakerController,
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
 * ดาวน์โหลด/Stream ไฟล์เสียง (requires authentication)
 */
router.get('/audio/:audioId/file', authenticate, serveAudioFileController);

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
 * GET /api/v1/transcripts/:id
 * ดึง transcript detail (requires authentication)
 */
router.get('/transcripts/:id', authenticate, getTranscriptController);

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
