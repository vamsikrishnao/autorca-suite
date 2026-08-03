import React from 'react';
import { SEVERITY_STYLES } from '../../config/theme';

export interface BadgeProps {
  label: string;
  variant?: 'severity' | 'custom';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'severity',
  className = '',
}) => {
  const styles =
    variant === 'severity'
      ? SEVERITY_STYLES[label] || {
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-200',
        }
      : {
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          border: 'border-indigo-200',
        };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold border ${styles.bg} ${styles.text} ${styles.border} ${className}`}
    >
      {label}
    </span>
  );
};
