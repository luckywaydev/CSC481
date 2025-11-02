"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button, Input } from "@/components/ui";
import { api, tokenManager } from "@/lib/api";

/**
 * Register Page
 * 
 * หน้าสมัครสมาชิก
 * - Form fields: email, password, confirm password, username
 * - Client-side validation
 * - 3D button effects
 * - Loading state
 * - Error handling
 */

export default function RegisterPage() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Handle input change
   * อัปเดตค่า form เมื่อผู้ใช้พิมพ์
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    // Email validation
    if (!formData.email) {
      newErrors.email = "กรุณากรอกอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
    } else if (formData.password.length < 8) {
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = "กรุณากรอกชื่อที่ต้องการให้เราเรียกคุณ";
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
      // เรียก API register
      const response = await api.register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        username: formData.username,
      });

      // ตรวจสอบ error
      if (response.error) {
        if (response.error.details) {
          // Validation errors
          const newErrors: Record<string, string> = {};
          response.error.details.forEach((detail) => {
            newErrors.submit = detail;
          });
          setErrors(newErrors);
        } else {
          // Other errors
          setErrors({
            submit: response.error.message,
          });
        }
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
      console.error("Register error:", error);
      setErrors({
        submit: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="สมัครสมาชิก"
      subtitle="สร้างบัญชีเพื่อเริ่มใช้งาน"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <Input
          type="email"
          name="email"
          label="อีเมล"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          fullWidth
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
        />

        {/* Username Field */}
        <Input
          type="text"
          name="username"
          label="ต้องการให้เราเรียกคุณว่าอะไร"
          placeholder="ชื่อผู้ใช้ (Username)"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
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
          helperText="ต้องมีอย่างน้อย 8 ตัวอักษร"
          required
          fullWidth
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />

        {/* Confirm Password Input */}
        <Input
          type="password"
          name="confirmPassword"
          label="ยืนยันรหัสผ่าน"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
          fullWidth
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

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
          {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
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

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-text-secondary">
            มีบัญชีอยู่แล้ว?{" "}
            <Link
              href="/login"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
