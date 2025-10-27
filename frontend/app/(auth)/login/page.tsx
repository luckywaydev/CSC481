"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";

// หน้า login
export default function LoginPage() {
  // เก็บข้อมูล form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // เก็บ error messages
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // ลบ error เมื่อเริ่มพิมพ์
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form - ลอง validate แบบง่ายๆ ก่อน
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // เชค email
    if (!formData.email) {
      newErrors.email = "กรุณากรอกอีเมล";
    }

    // เชค password
    if (!formData.password) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate ก่อน
    if (!validateForm()) {
      return;
    }

    // TODO: เชื่อมกับ backend
    console.log("Login data:", formData);
    alert("ยังไม่ได้เชื่อม backend นะ");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-background-secondary border border-background-tertiary rounded-2xl p-8 shadow-card">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              เข้าสู่ระบบ
            </h1>
            <p className="text-text-secondary">
              ยินดีต้อนรับกลับมา
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
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
            />

            {/* Password */}
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
            />

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
            >
              เข้าสู่ระบบ
            </Button>

            {/* Register Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-text-secondary">
                ยังไม่มีบัญชี?{" "}
                <Link
                  href="/register"
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  สมัครสมาชิก
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
