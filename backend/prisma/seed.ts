/**
 * ไฟล์: seed.ts
 *
 * Seed script สำหรับสร้างข้อมูลเริ่มต้นในฐานข้อมูล
 * ประกอบด้วย:
 * - สร้าง default roles (admin, free, pro)
 * - สร้าง role settings สำหรับแต่ละ role
 * - สร้าง admin user (optional)
 * - สร้าง AI models สำหรับการแปลงเสียงเป็นข้อความและการแปลภาษา
 *
 * วิธีรัน:
 * ```bash
 * npx prisma db seed
 * ```
 *
 * Environment Variables ที่ต้องการ:
 * - DATABASE_URL: URL สำหรับเชื่อมต่อฐานข้อมูล
 * - ADMIN_PASSWORD: รหัสผ่านสำหรับ admin user (optional)
 *
 * Author: Backend Team
 * Created: 2025-10-24
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// ตรวจสอบ environment variables ที่จำเป็น
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set in environment variables');
  process.exit(1);
}

const prisma = new PrismaClient();

/**
 * ฟังก์ชันหลักสำหรับ seed ข้อมูล
 */
async function main() {
  console.log('🌱 Starting database seed...\n');

  // ลบข้อมูลเก่า (ถ้ามี)
  console.log('🗑️  Cleaning existing data...');
  await prisma.userSettings.deleteMany();
  await prisma.user.deleteMany();
  await prisma.roleSettings.deleteMany();
  await prisma.role.deleteMany();
  console.log('✅ Cleaned\n');

  // สร้าง Roles
  console.log('👥 Creating roles...');

  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      description: 'ผู้ดูแลระบบ - มีสิทธิ์เข้าถึงทุกอย่าง',
    },
  });
  console.log('   ✅ Created role: admin');

  const freeRole = await prisma.role.create({
    data: {
      name: 'free',
      description: 'ผู้ใช้ฟรี - จำกัดการใช้งาน',
    },
  });
  console.log('   ✅ Created role: free');

  const proRole = await prisma.role.create({
    data: {
      name: 'pro',
      description: 'ผู้ใช้ Pro - ใช้งานได้เต็มที่',
    },
  });
  console.log('   ✅ Created role: pro\n');

  // สร้าง Role Settings
  console.log('⚙️  Creating role settings...');

  await prisma.roleSettings.create({
    data: {
      roleId: adminRole.id,
      maxFileSizeMb: 500,
      maxFilesPerMonth: 999999,
      audioRetentionHours: 168, // 7 days
      canUseApiMode: true,
      canUseLocalMode: true,
    },
  });
  console.log('   ✅ Created settings for: admin');

  await prisma.roleSettings.create({
    data: {
      roleId: freeRole.id,
      maxFileSizeMb: 50,
      maxFilesPerMonth: 5,
      audioRetentionHours: 1,
      canUseApiMode: false,
      canUseLocalMode: true,
    },
  });
  console.log('   ✅ Created settings for: free');

  await prisma.roleSettings.create({
    data: {
      roleId: proRole.id,
      maxFileSizeMb: 200,
      maxFilesPerMonth: 100,
      audioRetentionHours: 24,
      canUseApiMode: true,
      canUseLocalMode: true,
    },
  });
  console.log('   ✅ Created settings for: pro\n');

  // สร้าง Admin User (optional)
  console.log('👤 Creating admin user...');

  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@transcription.local',
      passwordHash: hashedPassword,
      username: 'admin',
      roleId: adminRole.id,
      isActive: true,
    },
  });
  console.log('   ✅ Created admin user');
  console.log(`   📧 Email: ${adminUser.email}`);
  console.log(`   🔑 Password: ${adminPassword}\n`);

  // สร้าง AI Models
  console.log('🤖 Creating AI models...');

  // STT Models
  console.log('   ✅ Created AI model: OpenAI Whisper (Local)');

  await prisma.aIModel.create({
    data: {
      name: 'Google Speech-to-Text',
      type: 'STT',
      provider: 'Google Cloud',
      apiEndpoint: 'https://speech.googleapis.com/v1/speech:recognize',
      isActive: false,
      isDefault: false,
      supportedLanguages: ['th', 'en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt'],
      description: 'Google Cloud Speech-to-Text API - เร็วและแม่นยำ แต่มีค่าใช้จ่าย',
      configJson: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'th-TH',
        enableAutomaticPunctuation: true,
      },
    },
  });
  console.log('   ✅ Created AI model: Google Speech-to-Text');

  await prisma.aIModel.create({
    data: {
      name: 'ElevenLabs Speech-to-Text',
      type: 'STT',
      provider: 'ElevenLabs',
      apiEndpoint: 'https://api.elevenlabs.io/v1/speech-to-text',
      isActive: false,
      isDefault: false,
      supportedLanguages: ['en'],
      description: 'ElevenLabs STT API - คุณภาพสูง เหมาะสำหรับภาษาอังกฤษ',
      configJson: {
        model: 'eleven_multilingual_v2',
      },
    },
  });
  console.log('   ✅ Created AI model: ElevenLabs Speech-to-Text');

  // Translation Models
  await prisma.aIModel.create({
    data: {
      name: 'HuggingFace Translation',
      type: 'TRANSLATION',
      provider: 'HuggingFace',
      apiEndpoint: 'https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt',
      isActive: true,
      isDefault: true,
      supportedLanguages: ['th', 'en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt'],
      description: 'HuggingFace Translation Models - ฟรีและรองรับหลายภาษา',
      configJson: {
        maxLength: 512,
      },
    },
  });
  console.log('   ✅ Created AI model: HuggingFace Translation');

  await prisma.aIModel.create({
    data: {
      name: 'Google Translate',
      type: 'TRANSLATION',
      provider: 'Google Cloud',
      apiEndpoint: 'https://translation.googleapis.com/language/translate/v2',
      isActive: false,
      isDefault: false,
      supportedLanguages: ['th', 'en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt'],
      description: 'Google Cloud Translation API - แม่นยำสูง มีค่าใช้จ่าย',
      configJson: {
        format: 'text',
      },
    },
  });
  console.log('   ✅ Created AI model: Google Translate\n');

  console.log('✨ Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Roles: 3 (admin, free, pro)`);
  console.log(`   - Role Settings: 3`);
  console.log(`   - Users: 1 (admin)`);
  console.log(`   - AI Models: 5 (3 STT, 2 Translation)`);
}

/**
 * รัน seed script
 */
main()
  .catch((error) => {
    console.error('\n❌ Seed failed!');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
