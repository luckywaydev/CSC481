/**
 * Script to fix encoding issues in database
 * Run: npx ts-node src/scripts/fixEncoding.ts
 */

import { prisma } from '../utils/prisma';

async function fixEncoding() {
  console.log('🔧 Fixing encoding issues...');

  try {
    // Get all audio files
    const audioFiles = await prisma.audioFile.findMany({
      select: {
        id: true,
        originalFilename: true,
      },
    });

    console.log(`Found ${audioFiles.length} audio files`);

    for (const file of audioFiles) {
      const originalName = file.originalFilename;
      
      // Check if filename has encoding issues (contains � or weird characters)
      if (originalName.includes('�') || /[\x80-\xFF]/.test(originalName)) {
        console.log(`\n❌ File with encoding issue: ${file.id}`);
        console.log(`   Current name: ${originalName}`);
        
        // Try to fix by converting from Latin1 to UTF-8
        try {
          const buffer = Buffer.from(originalName, 'latin1');
          const fixedName = buffer.toString('utf8');
          
          console.log(`   Fixed name: ${fixedName}`);
          
          // Update database
          await prisma.audioFile.update({
            where: { id: file.id },
            data: { originalFilename: fixedName },
          });
          
          console.log(`   ✅ Updated successfully`);
        } catch (error) {
          console.log(`   ⚠️  Could not fix: ${error}`);
        }
      }
    }

    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  fixEncoding()
    .then(() => {
      console.log('✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { fixEncoding };
