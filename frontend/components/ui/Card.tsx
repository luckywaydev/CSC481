import React from 'react';

/**
 * Card Component - 3D Effect
 * 
 * Card container พร้อม 3D shadow effect
 * ใช้สำหรับแสดงเนื้อหาต่างๆ ในรูปแบบ card
 * 
 * Props:
 * - children: เนื้อหาภายใน card
 * - hover: เปิดใช้งาน hover effect
 * - padding: ขนาด padding (none, sm, md, lg)
 * - className: class เพิ่มเติม
 */

interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  padding = 'md',
  className = '',
}) => {
  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-background-secondary
        border
        border-background-tertiary
        rounded-2xl
        shadow-card
        ${hover ? 'hover:shadow-card-hover hover:-translate-y-1 cursor-pointer' : ''}
        ${paddingStyles[padding]}
        transition-all
        duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
};

/**
 * CardHeader Component
 * 
 * ส่วนหัวของ Card
 */
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

/**
 * CardTitle Component
 * 
 * หัวข้อของ Card
 */
interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
}) => {
  return (
    <h3 className={`text-xl font-bold text-text-primary ${className}`}>
      {children}
    </h3>
  );
};

/**
 * CardDescription Component
 * 
 * คำอธิบายของ Card
 */
interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className = '',
}) => {
  return (
    <p className={`text-sm text-text-secondary ${className}`}>
      {children}
    </p>
  );
};

/**
 * CardContent Component
 * 
 * เนื้อหาหลักของ Card
 */
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

/**
 * CardFooter Component
 * 
 * ส่วนท้ายของ Card
 */
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`mt-4 pt-4 border-t border-background-tertiary ${className}`}>
      {children}
    </div>
  );
};

export default Card;
