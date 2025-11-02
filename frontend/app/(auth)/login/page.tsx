"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button, Input } from "@/components/ui";
import { api, tokenManager } from "@/lib/api";

/**
 * Login Page
 * 
 * หน้าเข้าสู่ระบบ
 * - Form fields: email/username, password
 * - Client-side validation
 * - รองรับการล็อกอินด้วย email หรือ username
 * - 3D button effects
 * - Loading state
 * - Error handling
 * - Remember me checkbox
 * - Forgot password link
 */

export default function LoginPage() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Handle input change
   * อัปเดตค่า form เมื่อผู้ใช้พิมพ์
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error เมื่อผู้ใช้เริ่มพิมพ์
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  /**
   * Validate form
   * ตรวจสอบความถูกต้องของข้อมูล
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email or Username validation
    if (!formData.email) {
      newErrors.email = "กรุณากรอกอีเมลหรือชื่อผู้ใช้";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submit
   * ส่งข้อมูลไปยัง API
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // เรียก API login
      const response = await api.login({
        email: formData.email,
        password: formData.password,
      });

      // ตรวจสอบ error
      if (response.error) {
        setErrors({
          submit: response.error.message,
        });
        return;
      }

      // บันทึก tokens และ user data
      if (response.data?.tokens) {
        tokenManager.saveTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
      }
      if (response.data?.user) {
        tokenManager.saveUser(response.data.user);
      }

      // Redirect ไป dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        submit: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="เข้าสู่ระบบ"
      subtitle="ยินดีต้อนรับกลับมา"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email or Username Input */}
        <Input
          type="text"
          name="email"
          label="อีเมลหรือชื่อผู้ใช้"
          placeholder="your@email.com หรือ username"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          fullWidth
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />

        {/* Password Input */}
        <Input
          type="password"
          name="password"
          label="รหัสผ่าน"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
          fullWidth
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          {/* Remember Me Checkbox */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-background-tertiary bg-background-secondary text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-background cursor-pointer"
            />
            <span className="text-sm text-text-secondary">จดจำฉันไว้</span>
          </label>

          {/* Forgot Password Link */}
          <Link
            href="/forgot-password"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            ลืมรหัสผ่าน?
          </Link>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-4">
            <p className="text-sm text-error">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-background-tertiary"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background-secondary text-text-tertiary">
              หรือ
            </span>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-text-secondary">
            ยังไม่มีบัญชี?{" "}
            <Link
              href="/register"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
