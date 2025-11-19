/**
 * Script to reset stuck PROCESSING files
 * Run this after server restart to fix files that got stuck
 */

import { prisma } from '../utils/prisma';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function resetStuckFiles() {
  console.log('🔍 Checking for stuck PROCESSING files...');

  // Find files that are PROCESSING
  const processingFiles = await prisma.audioFile.findMany({
    where: {
      status: 'PROCESSING',
    },
  });

  if (processingFiles.length === 0) {
    console.log('✅ No stuck files found');
    return;
  }

  console.log(`⚠️  Found ${processingFiles.length} PROCESSING files`);

  for (const file of processingFiles) {
    if (!file.replicatePredictionId) {
      console.log(`⚠️  File ${file.id} has no prediction ID, marking as FAILED`);
      await prisma.audioFile.update({
        where: { id: file.id },
        data: { status: 'FAILED' },
      });
      continue;
    }

    try {
      // Check Replicate status
      console.log(`🔍 Checking prediction ${file.replicatePredictionId}...`);
      const prediction = await replicate.predictions.get(file.replicatePredictionId);

      if (prediction.status === 'succeeded') {
        console.log(`✅ Prediction succeeded! But server missed it. Marking as COMPLETED.`);
        // Note: ต้องประมวลผล output และบันทึก transcript ด้วย
        // แต่สำหรับตอนนี้แค่เปลี่ยน status
        await prisma.audioFile.update({
          where: { id: file.id },
          data: { 
            status: 'COMPLETED',
            processedAt: new Date(),
          },
        });
      } else if (prediction.status === 'failed' || prediction.status === 'canceled') {
        console.log(`❌ Prediction ${prediction.status}, marking as FAILED`);
        await prisma.audioFile.update({
          where: { id: file.id },
          data: { status: 'FAILED' },
        });
      } else {
        console.log(`⏳ Prediction still ${prediction.status}, keeping as PROCESSING`);
      }
    } catch (error) {
      console.error(`❌ Error checking prediction:`, error);
      // Mark as FAILED if can't check
      await prisma.audioFile.update({
        where: { id: file.id },
        data: { status: 'FAILED' },
      });
    }
  }

  console.log('✅ Done checking stuck files');
}

// Run if called directly
if (require.main === module) {
  resetStuckFiles()
    .then(() => {
      console.log('✅ Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export { resetStuckFiles };
