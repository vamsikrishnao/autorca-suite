import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { CONNECTION_STATUS_STYLES } from '../../config/theme';

export interface StatusIndicatorProps {
  status: 'Connected' | 'Indexed' | 'Not Connected' | 'Connection Error' | 'Error' | string;
  size?: 'sm' | 'xs';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'xs',
  className = '',
}) => {
  const style = CONNECTION_STATUS_STYLES[status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300',
    iconColor: 'text-slate-500',
    label: status,
  };

  const isError = status === 'Connection Error' || status === 'Error';
  const isNotConnected = status === 'Not Connected';
  const isSuccess = status === 'Connected' || status === 'Indexed';

  const IconComponent = isError || isNotConnected ? AlertCircle : isSuccess ? CheckCircle2 : HelpCircle;

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-sm border uppercase ${style.bg} ${style.text} ${style.border} ${
        size === 'sm' ? 'text-[11px] px-2 py-1' : 'text-[10px] px-2 py-0.5'
      } ${className}`}
    >
      <IconComponent className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-3 h-3'} ${style.iconColor}`} />
      <span>{style.label}</span>
    </span>
  );
};
