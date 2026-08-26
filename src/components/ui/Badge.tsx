import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium border transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-[#262626] bg-[#121212] text-zinc-300",
        purple:
          "border-purple-500/30 bg-purple-950/40 text-purple-300",
        secondary:
          "border-transparent bg-zinc-800 text-zinc-300",
        success:
          "border-emerald-800/40 bg-emerald-950/50 text-emerald-400",
        warning:
          "border-amber-800/40 bg-amber-950/50 text-amber-300",
        danger:
          "border-red-800/40 bg-red-950/50 text-red-400",
        outline:
          "border-[#2A2A2A] bg-transparent text-zinc-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dotColor?: string;
}

function Badge({ className, variant, dotColor, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dotColor && (
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ backgroundColor: dotColor }}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
