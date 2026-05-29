import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-primary text-white hover:bg-primary-dark': variant === 'primary',
            'bg-white text-text-main border border-border hover:bg-gray-50': variant === 'secondary',
            'bg-danger text-white hover:bg-danger-dark': variant === 'danger',
            'border-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/50': variant === 'outline',
            'hover:bg-gray-100 text-text-main': variant === 'ghost',
            'h-10 px-5 text-sm': size === 'sm',
            'h-14 px-8 text-base': size === 'md',
            'h-16 px-10 text-lg': size === 'lg',
            'h-14 w-14': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
