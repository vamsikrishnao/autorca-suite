import React from 'react';
import { UI_CLASSES } from '../../config/theme';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  icon,
  children,
  className = '',
  ...props
}) => {
  const baseClass =
    variant === 'primary'
      ? UI_CLASSES.buttonPrimary
      : variant === 'danger'
      ? UI_CLASSES.buttonDanger
      : UI_CLASSES.buttonSecondary;

  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
