/**
 * ไฟล์: replicateService.ts
 *
 * คำอธิบาย:
 * Service สำหรับเชื่อมต่อ Replicate API
 * - Transcribe audio (Speech-to-Text)
 * - Speaker diarization
 * - Save transcript to database
 *
 * Author: Backend Team
 * Created: 2024-11-17
 */

import Replicate from 'replicate';
import { prisma } from '../utils/prisma';

/**
 * Initialize Replicate client
 */
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

/**
 * Interface สำหรับ Replicate output
 */
interface ReplicateSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

interface ReplicateOutput {
  text: string;
  segments?: ReplicateSegment[];
  language?: string;
}

/**
 * Transcribe audio file ด้วย Replicate API
 */
export async function transcribeAudio(
  audio: string | Buffer,
  options: {
    task?: 'transcribe' | 'translate';
    language?: string;
    diariseAudio?: boolean;
    numSpeakers?: number;
    minSpeakers?: number;
    maxSpeakers?: number;
  } = {}
) {
  try {
    console.log('🎙️  Starting transcription with Replicate...');
    console.log('Audio type:', typeof audio === 'string' ? 'URL' : 'Buffer');
    console.log('Options:', options);

    // Prepare input for Replicate API
    const input: any = {
      audio: audio, // Replicate รับทั้ง URL และ Buffer
      batch_size: 24,
      diarise_audio: options.diariseAudio !== false, // Default true
      hf_token: process.env.HF_TOKEN,
      language: options.language || 'None', // Auto-detect
      task: options.task || 'transcribe',
      timestamp: 'chunk',
    };

    // Add speaker configuration if provided
    if (options.numSpeakers) {
      input.num_speakers = options.numSpeakers;
    } else if (options.minSpeakers || options.maxSpeakers) {
      if (options.minSpeakers) {
        input.min_speakers = options.minSpeakers;
      }
      if (options.maxSpeakers) {
        input.max_speakers = options.maxSpeakers;
      }
    }

    console.log('Replicate input (without audio data):', {
      ...input,
      audio: typeof audio === 'string' ? audio : `<Buffer ${audio.length} bytes>`,
    });

    // เรียก Replicate API
    const output = (await replicate.run(
      'nicknaskida/incredibly-fast-whisper:968947af412ab5fc4574dde1bcaf09ae6b2c925ca8817c431f8e73ae61883c67',
      { input }
    )) as ReplicateOutput;

    console.log('✅ Transcription completed');
    console.log('Output:', JSON.stringify(output, null, 2));

    return output;
  } catch (error) {
    console.error('❌ Transcription failed:', error);
    throw error;
  }
}

/**
 * บันทึก transcript ลงฐานข้อมูล
 */
export async function saveTranscript(
  audioFileId: string,
  transcriptData: ReplicateOutput
) {
  try {
    console.log('💾 Saving transcript to database...');

    // นับจำนวนคำ
    const wordCount = transcriptData.text
      ? transcriptData.text.split(/\s+/).length
      : 0;

    // สร้าง transcript record
    const transcript = await prisma.transcript.create({
      data: {
        audioFileId,
        language: transcriptData.language || 'unknown',
        wordCount,
        confidenceScore: null, // Replicate ไม่ return confidence score
      },
    });

    console.log('✅ Transcript created:', transcript.id);

    // บันทึก segments
    if (transcriptData.segments && transcriptData.segments.length > 0) {
      console.log(`📝 Saving ${transcriptData.segments.length} segments...`);

      // สร้าง speakers map
      const speakersMap = new Map<string, string>();
      let speakerCounter = 1;

      // สร้าง segments
      for (let i = 0; i < transcriptData.segments.length; i++) {
        const seg = transcriptData.segments[i];

        // จัดการ speaker
        let speakerId: string | null = null;
        if (seg.speaker) {
          if (!speakersMap.has(seg.speaker)) {
            // สร้าง speaker ใหม่
            const speaker = await prisma.speaker.create({
              data: {
                transcriptId: transcript.id,
                name: `Speaker ${speakerCounter}`,
                displayOrder: speakerCounter,
                segmentCount: 0,
              },
            });
            speakersMap.set(seg.speaker, speaker.id);
            speakerCounter++;
          }
          speakerId = speakersMap.get(seg.speaker) || null;
        }

        // สร้าง segment
        await prisma.transcriptSegment.create({
          data: {
            transcriptId: transcript.id,
            segmentIndex: i,
            startTime: seg.start,
            endTime: seg.end,
            text: seg.text,
            speakerId,
            confidenceScore: null,
          },
        });
      }

      // อัปเดต segment count สำหรับแต่ละ speaker
      for (const [, speakerId] of speakersMap) {
        const segmentCount = await prisma.transcriptSegment.count({
          where: {
            transcriptId: transcript.id,
            speakerId,
          },
        });

        await prisma.speaker.update({
          where: { id: speakerId },
          data: { segmentCount },
        });
      }

      console.log('✅ Segments saved');
    }

    // อัปเดตสถานะ audio file
    await prisma.audioFile.update({
      where: { id: audioFileId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    console.log('✅ Audio file status updated');

    // ดึงข้อมูล transcript พร้อม segments และ speakers
    const fullTranscript = await prisma.transcript.findUnique({
      where: { id: transcript.id },
      include: {
        segments: {
          orderBy: { segmentIndex: 'asc' },
          include: {
            speaker: true,
          },
        },
        speakers: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    return fullTranscript;
  } catch (error) {
    console.error('❌ Failed to save transcript:', error);
    throw error;
  }
}

/**
 * ดึง transcript พร้อม segments
 */
export async function getTranscript(transcriptId: string, userId: string) {
  const transcript = await prisma.transcript.findFirst({
    where: {
      id: transcriptId,
      audioFile: {
        project: {
          userId,
          deletedAt: null,
        },
        deletedAt: null,
      },
    },
    include: {
      audioFile: {
        select: {
          id: true,
          originalFilename: true,
          projectId: true,
        },
      },
      segments: {
        orderBy: { segmentIndex: 'asc' },
        include: {
          speaker: true,
        },
      },
      speakers: {
        orderBy: { displayOrder: 'asc' },
      },
    },
  });

  return transcript;
}

/**
 * อัปเดต segment text
 */
export async function updateSegmentText(
  segmentId: string,
  userId: string,
  text: string
) {
  // ตรวจสอบ ownership
  const segment = await prisma.transcriptSegment.findFirst({
    where: {
      id: segmentId,
      transcript: {
        audioFile: {
          project: {
            userId,
            deletedAt: null,
          },
          deletedAt: null,
        },
      },
    },
  });

  if (!segment) {
    throw new Error('Segment not found');
  }

  // อัปเดต segment
  const updatedSegment = await prisma.transcriptSegment.update({
    where: { id: segmentId },
    data: {
      text,
      isEdited: true,
    },
  });

  return updatedSegment;
}

/**
 * อัปเดต speaker name
 */
export async function updateSpeakerName(
  speakerId: string,
  userId: string,
  name: string
) {
  // ตรวจสอบ ownership
  const speaker = await prisma.speaker.findFirst({
    where: {
      id: speakerId,
      transcript: {
        audioFile: {
          project: {
            userId,
            deletedAt: null,
          },
          deletedAt: null,
        },
      },
    },
  });

  if (!speaker) {
    throw new Error('Speaker not found');
  }

  // อัปเดต speaker
  const updatedSpeaker = await prisma.speaker.update({
    where: { id: speakerId },
    data: { name },
  });

  return updatedSpeaker;
}
