import React from 'react';
import { UI_CLASSES } from '../../config/theme';

export interface CardProps {
  title?: React.ReactNode;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  rightAction,
  children,
  className = '',
  bodyClassName = '',
}) => {
  return (
    <div className={`${UI_CLASSES.card} ${className}`}>
      {title && (
        <div className={UI_CLASSES.cardHeader}>
          <span>{title}</span>
          {rightAction && <div>{rightAction}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
};
