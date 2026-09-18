import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  size = 'md',
  icon,
}) => {
  const variantClass = `badge-${variant}`;
  const sizeStyle = size === 'sm' ? { fontSize: '0.7rem', padding: '0.15rem 0.5rem' } : {};

  return (
    <span className={`badge ${variantClass}`} style={sizeStyle}>
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
};
