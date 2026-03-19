"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-[#1B3A6D] text-white hover:bg-[#15305a] active:bg-[#0F2444] focus-visible:ring-[#1B3A6D]",
      accent:
        "bg-[#F7C72C] text-[#1B3A6D] font-semibold hover:bg-[#e5b825] active:bg-[#d4a520] focus-visible:ring-[#F7C72C]",
      outline:
        "border-2 border-[#1B3A6D] text-[#1B3A6D] hover:bg-[#1B3A6D] hover:text-white focus-visible:ring-[#1B3A6D]",
      ghost:
        "text-brand-text hover:bg-gray-100 focus-visible:ring-gray-400",
      danger:
        "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2.5 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };


