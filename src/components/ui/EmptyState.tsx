import * as React from "react";
import { cn } from "@/lib/utils";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#222222] bg-[#070707] p-8 text-center sm:p-12 animate-fade-in",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#121212] border border-[#222222] text-purple-400 mb-4 shadow-purple-glow-sm">
        {icon || <FolderOpen className="h-6 w-6 text-zinc-500" />}
      </div>
      <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs text-zinc-400 leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
