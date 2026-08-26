import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  color?: string;
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  color,
  size = "default",
  showLabel = false,
  className,
  ...props
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const sizeClasses = {
    sm: "h-1",
    default: "h-2",
    lg: "h-3",
  }[size];

  const defaultColor =
    clampedValue === 100
      ? "bg-emerald-500"
      : clampedValue > 50
      ? "bg-purple-500"
      : "bg-purple-600/80";

  return (
    <div className={cn("w-full space-y-1.5", className)} {...props}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Progress</span>
          <span className="font-medium text-zinc-200">{clampedValue}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-[#1A1A1A] border border-[#222222]/50",
          sizeClasses
        )}
      >
        <div
          className={cn("h-full transition-all duration-300 ease-out rounded-full", defaultColor)}
          style={{
            width: `${clampedValue}%`,
            ...(color ? { backgroundColor: color } : {}),
          }}
        />
      </div>
    </div>
  );
}
