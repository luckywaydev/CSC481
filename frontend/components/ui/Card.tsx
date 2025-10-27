import React from 'react';

// Card component - กล่องสำหรับใส่เนื้อหา
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
  // ขนาด padding ต่างๆ
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

export default Card;
