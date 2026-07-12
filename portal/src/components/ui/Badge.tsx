import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  tone?: "blue" | "green" | "amber" | "slate";
  className?: string;
}

const TONES = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  slate: "bg-slate-100 text-slate-600",
};

export function Badge({ children, tone = "blue", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
