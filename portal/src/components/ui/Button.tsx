import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "icon";
}

const VARIANTS = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "text-slate-500 hover:bg-slate-100",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  icon: "h-9 w-9 items-center justify-center p-0",
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
