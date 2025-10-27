"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";

// หน้าสมัครสมาชิก
export default function RegisterPage() {
  // เก็บข้อมูล form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  // เก็บ error messages
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle input change - อัปเดตค่าเมื่อพิมพ์
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

  // Validate form - เชคว่ากรอกถูกต้องไหม
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // เชค email
    if (!formData.email) {
      newErrors.email = "กรุณากรอกอีเมล";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    // เชค password
    if (!formData.password) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
    } else if (formData.password.length < 8) {
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
    }

    // เชคว่า password ตรงกันไหม
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }

    // เชค username
    if (!formData.username) {
      newErrors.username = "กรุณากรอกชื่อผู้ใช้";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit - ส่งข้อมูล
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate ก่อน
    if (!validateForm()) {
      return;
    }

    // TODO: เชื่อมกับ backend
    console.log("Form data:", formData);
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
              สมัครสมาชิก
            </h1>
            <p className="text-text-secondary">
              สร้างบัญชีเพื่อเริ่มใช้งาน
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

            {/* Username */}
            <Input
              type="text"
              name="username"
              label="ชื่อผู้ใช้"
              placeholder="ชื่อที่ต้องการให้เราเรียกคุณ"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
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

            {/* Confirm Password */}
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
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
            >
              สมัครสมาชิก
            </Button>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-text-secondary">
                มีบัญชีอยู่แล้ว?{" "}
                <Link
                  href="/login"
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
