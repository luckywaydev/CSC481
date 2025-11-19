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
 * สร้าง presigned URL สำหรับอัปโหลดไฟล์ไปยัง Replicate
 */
export async function createFileUpload(filename: string): Promise<{ uploadUrl: string; fileUrl: string }> {
  try {
    console.log('📤 Creating file upload URL for:', filename);
    
    // ใช้ Replicate API โดยตรง
    const response = await fetch('https://api.replicate.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        content_type: 'audio/mpeg',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create file upload: ${error}`);
    }

    const data: any = await response.json();
    console.log('✅ Upload URL created');
    console.log('Response:', data);
    
    return {
      uploadUrl: data.upload_url,
      fileUrl: data.urls.get,
    };
  } catch (error) {
    console.error('❌ Failed to create upload URL:', error);
    throw error;
  }
}

/**
 * Transcribe audio file ด้วย Replicate API (รับ URL เท่านั้น)
 */
export async function transcribeAudio(
  audioUrl: string,
  options: {
    task?: 'transcribe' | 'translate';
    language?: string;
    diariseAudio?: boolean;
    numSpeakers?: number;
    minSpeakers?: number;
    maxSpeakers?: number;
  } = {}
): Promise<{ output: ReplicateOutput; predictionId: string }> {
  try {
    console.log('🎙️  Starting transcription with Replicate...');
    const isDataUri = audioUrl.startsWith('data:');
    console.log('Audio type:', isDataUri ? 'Data URI' : 'URL');
    if (!isDataUri) {
      console.log('Audio URL:', audioUrl);
    }
    console.log('Options:', options);

    // Prepare input for Replicate API
    const input: any = {
      audio: audioUrl, // ใช้ URL หรือ data URI
      batch_size: 24,
      diarise_audio: true, // บังคับให้เป็น true เสมอ
      hf_token: process.env.HF_TOKEN,
      language: options.language || 'None', // Auto-detect
      task: options.task || 'transcribe',
      timestamp: 'chunk',
    };

    console.log('🔍 diarise_audio value:', input.diarise_audio);
    console.log('🔍 HF_TOKEN exists:', !!process.env.HF_TOKEN);

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

    // Log input without audio data (to avoid logging huge base64 strings)
    console.log('Replicate input (without audio):', {
      ...input,
      audio: isDataUri ? '<Data URI>' : input.audio,
    });

    // สร้าง prediction และรอผลลัพธ์
    const prediction = await replicate.predictions.create({
      version: '968947af412ab5fc4574dde1bcaf09ae6b2c925ca8817c431f8e73ae61883c67',
      input,
    });

    console.log('📝 Prediction created:', prediction.id);
    console.log('🔗 Status URL:', prediction.urls?.get);

    // Return prediction ID for tracking
    const predictionId = prediction.id;

    // รอผลลัพธ์ (polling)
    let finalPrediction = prediction;
    while (
      finalPrediction.status === 'starting' ||
      finalPrediction.status === 'processing'
    ) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // รอ 2 วินาที
      finalPrediction = await replicate.predictions.get(predictionId);
      console.log(`⏳ Status: ${finalPrediction.status}`);
    }

    if (finalPrediction.status === 'failed') {
      console.error('❌ Transcription failed:', finalPrediction.error);
      const errorMsg = typeof finalPrediction.error === 'string' 
        ? finalPrediction.error 
        : JSON.stringify(finalPrediction.error) || 'Transcription failed';
      throw new Error(errorMsg);
    }

    if (finalPrediction.status === 'canceled') {
      throw new Error('Transcription was canceled');
    }

    console.log('✅ Transcription completed');
    console.log('📊 Final prediction output type:', typeof finalPrediction.output);
    console.log('📊 Is array:', Array.isArray(finalPrediction.output));
    
    // แปลง output เป็น ReplicateOutput format
    const output: ReplicateOutput = {
      text: '',
      segments: [],
      language: 'unknown',
    };

    if (Array.isArray(finalPrediction.output)) {
      console.log('📝 Processing', finalPrediction.output.length, 'segments...');
      
      // Output เป็น array ของ segments
      output.segments = finalPrediction.output
        .filter((seg: any) => seg.timestamp && Array.isArray(seg.timestamp)) // กรองเฉพาะที่มี timestamp
        .map((seg: any) => {
          console.log('Segment:', JSON.stringify(seg));
          return {
            start: seg.timestamp[0],
            end: seg.timestamp[1],
            text: seg.text,
            speaker: seg.speaker,
          };
        });
      output.text = finalPrediction.output.map((seg: any) => seg.text).join(' ');
      console.log('✅ Parsed', output.segments.length, 'segments');
      console.log('📝 Total text length:', output.text.length);
    } else {
      console.warn('⚠️  Output is not an array:', finalPrediction.output);
    }

    return { output, predictionId };
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

    // บันทึก segments (ถ้ามี)
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

/**
 * แปลภาษา SRT ด้วย Replicate API
 */
export async function translateSrt(
  srtText: string,
  targetLanguage: string
): Promise<string> {
  try {
    console.log('🌐 Starting translation to:', targetLanguage);
    console.log('📝 SRT text length:', srtText.length);

    const input: any = {
      text: srtText,
      target_lang: targetLanguage,
    };

    console.log('Replicate translation input (target_lang):', targetLanguage);

    // ใช้ replicate.run() สำหรับ simple-translate
    const output = await replicate.run(
      "intelligent-utilities/simple-translate",
      { input }
    );

    console.log('✅ Translation completed');
    console.log('📊 Output type:', typeof output);
    
    // Output เป็น string ของ SRT ที่แปลแล้ว
    const translatedText = typeof output === 'string' 
      ? output 
      : JSON.stringify(output);

    return translatedText;
  } catch (error) {
    console.error('❌ Translation failed:', error);
    throw error;
  }
}
