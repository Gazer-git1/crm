import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-rose-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-indigo-500",
  "bg-teal-500",
];

function colorFor(name: string) {
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

interface AvatarProps {
  name: string;
  imageUrl?: string;
  online?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
};

export function Avatar({ name, imageUrl, online, size = "md", className }: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className={cn("rounded-full object-cover", SIZE_MAP[size])}
        />
      ) : (
        <span
          className={cn(
            "flex items-center justify-center rounded-full font-semibold text-white",
            colorFor(name),
            SIZE_MAP[size],
          )}
        >
          {initialsFor(name)}
        </span>
      )}
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white",
            online ? "bg-emerald-500" : "bg-slate-300",
          )}
        />
      )}
    </span>
  );
}
