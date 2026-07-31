import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullPage = false,
  label = 'Loading...',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full animate-spin`} />
      {label && <span className="text-xs text-slate-400 font-medium">{label}</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return <div className="p-8 flex items-center justify-center">{spinner}</div>;
};
