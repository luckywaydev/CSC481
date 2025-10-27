import React from 'react';

// ปุ่มแบบ 3D - ลองทำดู
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) => {
  // สไตล์พื้นฐาน
  const baseStyles = `
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
    disabled:opacity-50
    disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;

  // ขนาดต่างๆ
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // รูปแบบต่างๆ - ตรงนี้ลองทำ shadow แบบ 3D
  const variantStyles = {
    // ม่วงเข้ม พร้อม shadow 3D
    primary: `
      bg-gradient-to-br from-purple-500 to-purple-600
      text-white
      shadow-3d
      hover:shadow-3d-hover
      hover:-translate-y-1
      active:translate-y-0
    `,
    // ม่วงอ่อน
    secondary: `
      bg-gradient-to-br from-purple-600 to-purple-700
      text-white
      shadow-3d
      hover:shadow-3d-hover
      hover:-translate-y-1
    `,
    // ขอบม่วง พื้นหลังโปร่งใส
    outline: `
      bg-transparent
      border-2
      border-purple-500
      text-purple-500
      hover:bg-purple-500/10
    `,
    // ไม่มีขอบ
    ghost: `
      bg-transparent
      text-purple-500
      hover:bg-purple-500/10
    `,
  };

  return (
    <button
      type={type}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
