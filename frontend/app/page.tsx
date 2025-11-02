import Link from "next/link";
import { Button } from "@/components/ui";

/**
 * Home Page - Vocalog-inspired Design
 * 
 * หน้าแรกของเว็บไซต์ ออกแบบตามสไตล์ Vocalog
 * - Navigation bar แบบ modern
 * - Hero section พร้อม gradient background
 * - Features showcase
 * - How it works section
 * - CTA section
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-background-tertiary">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-purple rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-2xl">🎙️</span>
              </div>
              <span className="text-xl font-bold text-text-primary">
                TranscribeAI
              </span>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-text-secondary hover:text-purple-400 transition-colors">
                ฟีเจอร์
              </Link>
              <Link href="#how-it-works" className="text-text-secondary hover:text-purple-400 transition-colors">
                วิธีใช้งาน
              </Link>
              <Link href="#pricing" className="text-text-secondary hover:text-purple-400 transition-colors">
                ราคา
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/register">
                <Button variant="ghost" size="sm">
                  สมัครสมาชิก
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="primary" size="sm">
                  เริ่มใช้งาน
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-background to-background"></div>
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-purple-400">Project CSC481</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-7xl font-bold text-text-primary mb-6 leading-tight">
              ถอดเสียงและแปลภาษา
              <br />
              <span className="bg-gradient-purple bg-clip-text text-transparent">
                ด้วย AI อัจฉริยะ
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto">
              อัปโหลดไฟล์เสียง ถอดเป็นข้อความพร้อม timestamp 
              และแปลเป็นภาษาอื่นได้อย่างรวดเร็วและแม่นยำ
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/login">
                <Button variant="primary" size="lg" className="min-w-[200px]">
                  เริ่มใช้งานฟรี →
                </Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  ดูตัวอย่าง
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-6 text-sm text-text-tertiary">
              <div className="flex items-center space-x-2">
                <span>✓</span>
                <span>ไม่ต้องใช้บัตรเครดิต</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>✓</span>
                <span>รองรับ 20+ ภาษา</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>✓</span>
                <span>ปลอดภัย 100%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-background-secondary/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              ฟีเจอร์ที่ทรงพลัง
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              ทุกสิ่งที่คุณต้องการสำหรับการถอดเสียงและแปลภาษา
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature Card 1 */}
            <div className="group bg-background-secondary border border-background-tertiary rounded-2xl p-8 hover:border-purple-500/50 hover:shadow-card-hover transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-purple rounded-xl flex items-center justify-center mb-6 shadow-3d group-hover:shadow-3d-hover transition-all">
                <span className="text-3xl">🎤</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">
                ถอดเสียงอัตโนมัติ
              </h3>
              <p className="text-text-secondary leading-relaxed">
                ใช้ AI ล่าสุดในการถอดเสียงเป็นข้อความพร้อม timestamp 
                ที่แม่นยำสูงสุด รองรับไฟล์หลายรูปแบบ
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="group bg-background-secondary border border-background-tertiary rounded-2xl p-8 hover:border-purple-500/50 hover:shadow-card-hover transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-purple rounded-xl flex items-center justify-center mb-6 shadow-3d group-hover:shadow-3d-hover transition-all">
                <span className="text-3xl">🌍</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">
                แปลหลายภาษา
              </h3>
              <p className="text-text-secondary leading-relaxed">
                รองรับการแปลภาษามากกว่า 20 ภาษา 
                ด้วย AI ที่เข้าใจบริบทและสำนวนภาษาได้อย่างแม่นยำ
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="group bg-background-secondary border border-background-tertiary rounded-2xl p-8 hover:border-purple-500/50 hover:shadow-card-hover transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-purple rounded-xl flex items-center justify-center mb-6 shadow-3d group-hover:shadow-3d-hover transition-all">
                <span className="text-3xl">✏️</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">
                แก้ไขแบบ Real-time
              </h3>
              <p className="text-text-secondary leading-relaxed">
                แก้ไขข้อความได้ทันที พร้อมระบุผู้พูดและ
                เล่นเสียงตามช่วงเวลาเพื่อตรวจสอบความถูกต้อง
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="group bg-background-secondary border border-background-tertiary rounded-2xl p-8 hover:border-purple-500/50 hover:shadow-card-hover transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-purple rounded-xl flex items-center justify-center mb-6 shadow-3d group-hover:shadow-3d-hover transition-all">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">
                ประมวลผลรวดเร็ว
              </h3>
              <p className="text-text-secondary leading-relaxed">
                ระบบ Queue ที่มีประสิทธิภาพ ประมวลผลไฟล์เสียง
                ได้รวดเร็วแม้ในช่วงเวลาที่มีผู้ใช้งานมาก
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="group bg-background-secondary border border-background-tertiary rounded-2xl p-8 hover:border-purple-500/50 hover:shadow-card-hover transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-purple rounded-xl flex items-center justify-center mb-6 shadow-3d group-hover:shadow-3d-hover transition-all">
                <span className="text-3xl">📥</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">
                Export หลายรูปแบบ
              </h3>
              <p className="text-text-secondary leading-relaxed">
                ดาวน์โหลดผลลัพธ์เป็น TXT, SRT, หรือ JSON
                พร้อมใช้งานได้ทันทีสำหรับโปรแกรมอื่นๆ
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="group bg-background-secondary border border-background-tertiary rounded-2xl p-8 hover:border-purple-500/50 hover:shadow-card-hover transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-purple rounded-xl flex items-center justify-center mb-6 shadow-3d group-hover:shadow-3d-hover transition-all">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">
                ปลอดภัยสูงสุด
              </h3>
              <p className="text-text-secondary leading-relaxed">
                เข้ารหัสข้อมูลทั้งหมด ไฟล์เสียงถูกลบอัตโนมัติ
                หลังประมวลผลเสร็จ ข้อมูลของคุณปลอดภัย 100%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              ใช้งานง่ายเพียง 3 ขั้นตอน
            </h2>
            <p className="text-xl text-text-secondary">
              เริ่มต้นใช้งานได้ทันทีภายในไม่กี่นาที
            </p>
          </div>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-purple rounded-2xl flex items-center justify-center text-2xl font-bold shadow-3d">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  อัปโหลดไฟล์เสียง
                </h3>
                <p className="text-text-secondary text-lg">
                  ลากไฟล์เสียงของคุณมาวาง หรือคลิกเพื่อเลือกไฟล์ 
                  รองรับ MP3, WAV, M4A และ FLAC
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-purple rounded-2xl flex items-center justify-center text-2xl font-bold shadow-3d">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  เลือกภาษาและโหมด
                </h3>
                <p className="text-text-secondary text-lg">
                  เลือกภาษาต้นฉบับและภาษาที่ต้องการแปล 
                  เลือกใช้ API Mode (เร็ว) หรือ Local Mode (ฟรี)
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-purple rounded-2xl flex items-center justify-center text-2xl font-bold shadow-3d">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  รับผลลัพธ์และแก้ไข
                </h3>
                <p className="text-text-secondary text-lg">
                  รอสักครู่ AI จะประมวลผลให้ จากนั้นคุณสามารถแก้ไข
                  ระบุผู้พูด และดาวน์โหลดผลลัพธ์ได้ทันที
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-purple relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            พร้อมเริ่มต้นแล้วหรือยัง?
          </h2>
          <p className="text-xl text-purple-100 mb-10">
            เริ่มใช้งานฟรีวันนี้ ไม่ต้องใช้บัตรเครดิต
          </p>
          <Link href="/login">
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-purple-50 min-w-[250px]"
            >
              เริ่มใช้งานเลย →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-background-tertiary py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-purple rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎙️</span>
                </div>
                <span className="text-xl font-bold text-text-primary">
                  TranscribeAI
                </span>
              </div>
              <p className="text-text-secondary max-w-md">
                ระบบถอดเสียงและแปลภาษาด้วย AI 
                ที่ทรงพลังและใช้งานง่าย
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-text-primary mb-4">ผลิตภัณฑ์</h4>
              <ul className="space-y-2 text-text-secondary">
                <li><Link href="#features" className="hover:text-purple-400">ฟีเจอร์</Link></li>
                <li><Link href="#pricing" className="hover:text-purple-400">ราคา</Link></li>
                <li><Link href="#" className="hover:text-purple-400">API</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-text-primary mb-4">บริษัท</h4>
              <ul className="space-y-2 text-text-secondary">
                <li><Link href="#" className="hover:text-purple-400">เกี่ยวกับเรา</Link></li>
                <li><Link href="#" className="hover:text-purple-400">ติดต่อ</Link></li>
                <li><Link href="#" className="hover:text-purple-400">นโยบายความเป็นส่วนตัว</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-background-tertiary pt-8 text-center text-text-secondary text-sm">
            <p>© 2024 TranscribeAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
