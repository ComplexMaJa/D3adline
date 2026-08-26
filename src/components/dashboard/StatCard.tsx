import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "purple" | "success" | "warning" | "danger";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: StatCardProps) {
  const variantStyles = {
    default: {
      card: "border-[#1A1A1A] bg-[#080808]",
      iconBg: "bg-[#141414] text-zinc-300 border-[#222222]",
      valueColor: "text-zinc-100",
    },
    purple: {
      card: "border-purple-900/40 bg-purple-950/10 shadow-purple-glow-sm",
      iconBg: "bg-purple-900/30 text-purple-300 border-purple-800/40",
      valueColor: "text-purple-300",
    },
    success: {
      card: "border-emerald-950/60 bg-emerald-950/10",
      iconBg: "bg-emerald-950/40 text-emerald-400 border-emerald-800/40",
      valueColor: "text-emerald-400",
    },
    warning: {
      card: "border-amber-950/60 bg-amber-950/10",
      iconBg: "bg-amber-950/40 text-amber-400 border-amber-800/40",
      valueColor: "text-amber-400",
    },
    danger: {
      card: "border-red-950/60 bg-red-950/10",
      iconBg: "bg-red-950/40 text-red-400 border-red-800/40",
      valueColor: "text-red-400",
    },
  }[variant];

  return (
    <div
      className={cn(
        "rounded-xl border p-4 sm:p-5 transition-all duration-200 hover:border-[#2C2C2C] hover:bg-[#0C0C0C]",
        variantStyles.card
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-medium text-zinc-400">{title}</span>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border",
            variantStyles.iconBg
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span
          className={cn(
            "text-2xl sm:text-3xl font-bold tracking-tight",
            variantStyles.valueColor
          )}
        >
          {value}
        </span>
        {trend && (
          <span className="text-[11px] font-medium text-zinc-500">{trend}</span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] text-zinc-500">{subtitle}</p>
      )}
    </div>
  );
}
