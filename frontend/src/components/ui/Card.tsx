import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  className = '',
  glow = false,
  style,
  ...props
}) => {
  const cardClass = `card ${interactive ? 'card-interactive' : ''} ${className}`;
  const glowStyle = glow ? { boxShadow: 'var(--shadow-md)', borderColor: '#BFDBFE' } : {};

  return (
    <div className={cardClass} style={{ ...glowStyle, ...style }} {...props}>
      {children}
    </div>
  );
};
