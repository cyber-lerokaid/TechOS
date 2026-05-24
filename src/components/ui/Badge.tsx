import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

export const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: BadgeVariant }) => {
  const baseClass = "badge";
  const variantClass = variant === 'default' ? '' : `badge-${variant}`;
  
  return (
    <span className={`${baseClass} ${variantClass}`.trim()}>
      {children}
    </span>
  );
};
