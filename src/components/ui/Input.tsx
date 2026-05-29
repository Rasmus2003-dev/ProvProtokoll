import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-text-main">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "flex h-14 w-full rounded-none border border-border bg-white px-4 py-2 text-base text-text-main transition-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted/60 focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-400",
              icon && "pl-11",
              error && "border-danger focus-visible:border-danger",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
