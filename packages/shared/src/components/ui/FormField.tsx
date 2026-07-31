import React from 'react';

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  helpText,
  children,
}) => {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {helpText && !error && <p className="text-[11px] text-slate-400">{helpText}</p>}
      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
};
