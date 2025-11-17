/**
 * ไฟล์: transcriptController.ts
 *
 * คำอธิบาย:
 * Controller สำหรับจัดการ Transcripts endpoints
 * - GET /transcripts/:id - ดึง transcript detail
 * - PATCH /transcript-segments/:id - แก้ไข segment text
 * - PATCH /speakers/:id - แก้ไขชื่อ speaker
 *
 * Author: Backend Team
 * Created: 2024-11-17
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getTranscript,
  updateSegmentText,
  updateSpeakerName,
} from '../services/replicateService';

/**
 * GET /api/v1/transcripts/:id
 * ดึง transcript detail
 */
export async function getTranscriptController(
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

    const { id } = req.params;

    const transcript = await getTranscript(id, req.user.userId);

    if (!transcript) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Transcript not found',
        },
      });
      return;
    }

    res.json({
      message: 'Transcript retrieved successfully',
      data: {
        transcript,
      },
    });
  } catch (error) {
    console.error('Get transcript error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get transcript',
      },
    });
  }
}

/**
 * PATCH /api/v1/transcript-segments/:id
 * แก้ไข segment text
 */
export async function updateSegmentController(
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

    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Text is required',
        },
      });
      return;
    }

    const segment = await updateSegmentText(id, req.user.userId, text);

    res.json({
      message: 'Segment updated successfully',
      data: {
        segment,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Segment not found') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Segment not found',
        },
      });
      return;
    }

    console.error('Update segment error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update segment',
      },
    });
  }
}

/**
 * PATCH /api/v1/speakers/:id
 * แก้ไขชื่อ speaker
 */
export async function updateSpeakerController(
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

    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name is required',
        },
      });
      return;
    }

    const speaker = await updateSpeakerName(id, req.user.userId, name);

    res.json({
      message: 'Speaker updated successfully',
      data: {
        speaker,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Speaker not found') {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Speaker not found',
        },
      });
      return;
    }

    console.error('Update speaker error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update speaker',
      },
    });
  }
}
