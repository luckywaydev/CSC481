/**
 * Dashboard Page
 * 
 * หน้า Dashboard หลังจาก login สำเร็จ
 * - แสดงข้อความต้อนรับ
 * - แสดงข้อมูล user
 * - ปุ่ม logout
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tokenManager } from "@/lib/api";
import { Button } from "@/components/ui";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // ตรวจสอบว่ามี token หรือไม่
    const token = tokenManager.getAccessToken();
    if (!token) {
      // ถ้าไม่มี token ให้ redirect ไป login
      router.push("/login");
      return;
    }

    // ดึงข้อมูล user จาก localStorage
    const userData = tokenManager.getUser();
    if (userData) {
      setUser(userData);
    } else {
      // ถ้าไม่มีข้อมูล user ให้ redirect ไป login
      router.push("/login");
    }
  }, [router]);

  /**
   * Handle logout
   */
  const handleLogout = () => {
    // ลบ tokens
    tokenManager.clearTokens();
    // Redirect ไป login
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-secondary">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background-secondary border-b border-background-tertiary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-text-primary">
              Dashboard
            </h1>
            <Button
              variant="outline"
              size="md"
              onClick={handleLogout}
            >
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-background-secondary rounded-2xl p-8 border border-background-tertiary shadow-lg">
          <h2 className="text-3xl font-bold text-text-primary mb-2">
            ยินดีต้อนรับ! 🎉
          </h2>
          <p className="text-text-secondary mb-6">
            คุณเข้าสู่ระบบสำเร็จแล้ว
          </p>

          {/* User Info */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-text-tertiary">อีเมล:</span>
              <span className="text-text-primary font-medium">{user.email}</span>
            </div>
            {user.username && (
              <div className="flex items-center space-x-2">
                <span className="text-text-tertiary">ชื่อผู้ใช้:</span>
                <span className="text-text-primary font-medium">
                  {user.username}
                </span>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <p className="text-sm text-purple-300">
              💡 <strong>หมายเหตุ:</strong> นี่เป็นหน้า Dashboard พื้นฐาน
              ระบบ Authentication ทำงานได้แล้ว! Features อื่นๆ กำลังพัฒนา
            </p>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-background-secondary rounded-xl p-6 border border-background-tertiary">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              โปรเจกต์
            </h3>
            <p className="text-sm text-text-tertiary">กำลังพัฒนา...</p>
          </div>
          <div className="bg-background-secondary rounded-xl p-6 border border-background-tertiary">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              ไฟล์เสียง
            </h3>
            <p className="text-sm text-text-tertiary">กำลังพัฒนา...</p>
          </div>
          <div className="bg-background-secondary rounded-xl p-6 border border-background-tertiary">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              การตั้งค่า
            </h3>
            <p className="text-sm text-text-tertiary">กำลังพัฒนา...</p>
          </div>
        </div>
      </main>
    </div>
  );
}
