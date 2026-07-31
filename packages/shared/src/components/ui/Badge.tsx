import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
  status?: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant, children, className }) => {
  let resolvedVariant = variant || 'neutral';

  if (status) {
    const lower = status.toLowerCase();
    if (['completed', 'valid', 'approved', 'operational', 'resolved', 'good', 'satisfactory', 'at sea'].includes(lower)) {
      resolvedVariant = 'success';
    } else if (['due', 'upcoming', 'expiring soon', 'in progress', 'under investigation', 'requires service', 'action in progress'].includes(lower)) {
      resolvedVariant = 'warning';
    } else if (['overdue', 'expired', 'rejected', 'critical repair', 'open', 'fired / terminated', 'blacklisted'].includes(lower)) {
      resolvedVariant = 'danger';
    } else if (['planned', 'draft', 'vessel requested', 'in port', 'anchorage'].includes(lower)) {
      resolvedVariant = 'info';
    }
  }

  const variantStyles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    neutral: 'bg-slate-700/50 text-slate-300 border-slate-700',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[resolvedVariant],
        className
      )}
    >
      {children || status}
    </span>
  );
};
