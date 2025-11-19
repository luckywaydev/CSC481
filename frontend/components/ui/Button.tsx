/**
 * ไฟล์: Button.tsx
 * 
 * คำอธิบาย:
 * Component ปุ่มแบบ 3D floating effect สำหรับใช้ทั่วทั้งแอป
 * มีเอฟเฟกต์ลอยและ shadow ที่สร้างความรู้สึก 3 มิติ
 * รองรับ 4 variants และ 3 ขนาด พร้อม loading state
 * 
 * Features:
 * - 4 Variants: primary (ม่วงเข้ม), secondary (ม่วงอ่อน), outline (ขอบม่วง), ghost (โปร่งใส)
 * - 3 Sizes: sm (เล็ก), md (กลาง), lg (ใหญ่)
 * - Loading state พร้อม spinner animation
 * - Disabled state
 * - Full width option
 * - Hover effects (ยกขึ้น -translate-y-1 + shadow เพิ่ม)
 * - Active effects (กดลง translate-y-0 + shadow ลด)
 * - Focus ring สีม่วง
 * 
 * การใช้งาน:
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   คลิกที่นี่
 * </Button>
 * 
 * <Button loading={isLoading}>
 *   กำลังโหลด...
 * </Button>
 * ```
 * 
 * Dependencies:
 * - React
 * - Tailwind CSS (custom shadows: shadow-3d, shadow-3d-hover, shadow-3d-active)
 * 
 * Author: TranscribeAI Team
 * Created: 2024-10-23
 */

import React from 'react';

// === Types & Interfaces ===

/**
 * Interface: ButtonProps
 * 
 * Props สำหรับ Button component
 * Extends จาก HTML button attributes เพื่อรองรับ props มาตรฐานทั้งหมด
 * 
 * @property children - เนื้อหาภายในปุ่ม (text, icon, หรือ component อื่น)
 * @property variant - รูปแบบปุ่ม (default: 'primary')
 * @property size - ขนาดปุ่ม (default: 'md')
 * @property fullWidth - ปุ่มเต็มความกว้าง (default: false)
 * @property loading - แสดง loading spinner (default: false)
 * @property disabled - ปิดการใช้งาน (default: false)
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

// === Main Component ===

/**
 * Component: Button
 * 
 * ปุ่มแบบ 3D floating effect พร้อม animation
 * 
 * @param children - เนื้อหาภายในปุ่ม
 * @param variant - รูปแบบปุ่ม (default: 'primary')
 * @param size - ขนาดปุ่ม (default: 'md')
 * @param fullWidth - ปุ่มเต็มความกว้าง (default: false)
 * @param loading - แสดง loading spinner (default: false)
 * @param disabled - ปิดการใช้งาน (default: false)
 * @param className - CSS class เพิ่มเติม
 * @param type - ประเภทปุ่ม (default: 'button')
 * @param props - HTML button attributes อื่นๆ
 * 
 * @returns React component
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) => {
  // === Styles Configuration ===
  
  /**
   * Base Styles
   * 
   * สไตล์พื้นฐานที่ใช้กับทุกปุ่ม
   * - relative: สำหรับ positioning elements ภายใน
   * - inline-flex: แสดงเป็น flex แบบ inline
   * - items-center: จัดเนื้อหากึ่งกลางแนวตั้ง
   * - justify-center: จัดเนื้อหากึ่งกลางแนวนอน
   * - font-semibold: ตัวอักษรหนา (600)
   * - rounded-xl: มุมโค้ง 12px
   * - transition-all: animation ทุก property
   * - duration-200: ระยะเวลา animation 200ms
   * - focus:outline-none: ไม่แสดง outline เมื่อ focus
   * - focus:ring-2: แสดง ring ขนาด 2px เมื่อ focus
   * - focus:ring-purple-500: ring สีม่วง
   * - focus:ring-offset-2: ระยะห่างระหว่าง ring กับปุ่ม
   * - focus:ring-offset-background: สี offset เป็นสีพื้นหลัง
   * - disabled:opacity-50: ความโปร่งใส 50% เมื่อ disabled
   * - disabled:cursor-not-allowed: cursor แสดงว่าใช้ไม่ได้
   * - disabled:transform-none: ไม่มี transform เมื่อ disabled
   */
  const baseStyles = `
    relative
    inline-flex
    items-center
    justify-center
    font-semibold
    rounded-xl
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-purple-500
    focus:ring-offset-2
    focus:ring-offset-background
    disabled:opacity-50
    disabled:cursor-not-allowed
    disabled:transform-none
    ${fullWidth ? 'w-full' : ''}
  `;

  /**
   * Size Styles
   * 
   * กำหนดขนาดของปุ่มแต่ละแบบ
   * - sm (เล็ก): padding 16px x 8px, text 14px
   * - md (กลาง): padding 24px x 12px, text 16px
   * - lg (ใหญ่): padding 32px x 16px, text 18px
   */
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',    // เล็ก - สำหรับปุ่มรอง
    md: 'px-6 py-3 text-base',  // กลาง - ขนาดมาตรฐาน
    lg: 'px-8 py-4 text-lg',    // ใหญ่ - สำหรับ CTA หลัก
  };

  /**
   * Variant Styles
   * 
   * รูปแบบต่างๆ ของปุ่ม พร้อม 3D effect
   * แต่ละ variant มี:
   * - Background color/gradient
   * - Text color
   * - Shadow effects (3D)
   * - Hover effects (ยกขึ้น + shadow เพิ่ม)
   * - Active effects (กดลง + shadow ลด)
   */
  const variantStyles = {
    // Primary - ม่วงเข้ม พร้อม shadow 3D
    primary: `
      bg-gradient-to-br from-purple-500 to-purple-600
      text-white
      shadow-3d
      hover:shadow-3d-hover
      hover:-translate-y-1
      active:shadow-3d-active
      active:translate-y-0
    `,
    // Secondary - ม่วงอ่อน
    secondary: `
      bg-gradient-to-br from-purple-600 to-purple-700
      text-white
      shadow-3d
      hover:shadow-3d-hover
      hover:-translate-y-1
      active:shadow-3d-active
      active:translate-y-0
    `,
    // Outline - ขอบม่วง พื้นหลังโปร่งใส
    outline: `
      bg-transparent
      border-2
      border-purple-500
      text-purple-500
      hover:bg-purple-500/10
      hover:border-purple-400
      hover:text-purple-400
      active:bg-purple-500/20
    `,
    // Ghost - ไม่มีขอบ พื้นหลังโปร่งใส
    ghost: `
      bg-transparent
      text-purple-500
      hover:bg-purple-500/10
      hover:text-purple-400
      active:bg-purple-500/20
    `,
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {/* แสดง loading spinner ถ้ากำลังโหลด */}
      {loading && <LoadingSpinner />}
      
      {/* เนื้อหาปุ่ม */}
      {children}
    </button>
  );
};

export default Button;
