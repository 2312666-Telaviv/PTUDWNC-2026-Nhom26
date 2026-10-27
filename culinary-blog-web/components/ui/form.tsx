/**
 * Form utilities for shadcn/ui form components.
 * Dùng cùng react-hook-form và zod.
 */
import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface FormFieldProps {
  id: string;
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

export interface FormControlProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function FormControl({
  className,
  error,
  type = 'text',
  ...props
}: FormControlProps) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive',
        className
      )}
      {...props}
    />
  );
}
