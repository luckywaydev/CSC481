// หน้าแรกของเว็บ ตอนนี้ยังเป็นแค่ข้อความธรรมดา
export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          ระบบถอดเสียงและแปลภาษา
        </h1>
        <p className="text-text-secondary">
          ตอนนี้ยังทำไม่เสร็จ แค่ setup พื้นฐาน
        </p>
      </div>
    </div>
  );
}
