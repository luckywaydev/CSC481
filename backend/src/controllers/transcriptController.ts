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

/**
 * GET /api/v1/transcripts/:id/download/txt


/**
 * GET /api/v1/transcripts/:id/download/txt
 * ดาวน์โหลด transcript เป็นไฟล์ TXT
 */
export async function downloadTranscriptTxtController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    // Support both token in query and Authorization header
    const token = req.query.token as string || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token && !req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    // If token in query, verify it
    let userId = req.user?.userId;
    if (!userId && token) {
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
        userId = decoded.userId;
      } catch (error) {
        res.status(401).json({
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token',
          },
        });
        return;
      }
    }

    if (!userId) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const { id } = req.params;

    const transcript = await getTranscript(id, userId);

    if (!transcript) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Transcript not found',
        },
      });
      return;
    }

    // Generate TXT content
    let txtContent = '';
    
    // Format as plain text
    transcript.segments.forEach((segment) => {
      const speakerName = segment.speaker?.name || 'Unknown';
      txtContent += `${speakerName}: ${segment.text}\n\n`;
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="transcript-${id}.txt"`);
    res.send(txtContent);
  } catch (error) {
    console.error('Download TXT error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to download transcript',
      },
    });
  }
}

/**
 * GET /api/v1/transcripts/:id/download/srt
 * ดาวน์โหลด transcript เป็นไฟล์ SRT (subtitle)
 */
export async function downloadTranscriptSrtController(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    // Support both token in query and Authorization header
    const token = req.query.token as string || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token && !req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    // If token in query, verify it
    let userId = req.user?.userId;
    if (!userId && token) {
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
        userId = decoded.userId;
      } catch (error) {
        res.status(401).json({
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token',
          },
        });
        return;
      }
    }

    if (!userId) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const { id } = req.params;

    const transcript = await getTranscript(id, userId);

    if (!transcript) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Transcript not found',
        },
      });
      return;
    }

    // Generate SRT content
    let srtContent = '';
    
    transcript.segments.forEach((segment, index) => {
      const startTime = formatSrtTime(segment.startTime);
      const endTime = formatSrtTime(segment.endTime || segment.startTime + 2);
      const speakerName = segment.speaker?.name || 'Unknown';
      
      srtContent += `${index + 1}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `${speakerName}: ${segment.text}\n\n`;
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="transcript-${id}.srt"`);
    res.send(srtContent);
  } catch (error) {
    console.error('Download SRT error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to download transcript',
      },
    });
  }
}

/**
 * Format time for SRT (HH:MM:SS,mmm)
 */
function formatSrtTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
}
