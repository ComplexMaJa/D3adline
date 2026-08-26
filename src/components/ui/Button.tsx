import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-purple-600 text-white hover:bg-purple-500 shadow-purple-glow-sm hover:shadow-purple-glow",
        secondary:
          "bg-[#141414] text-zinc-200 border border-[#222222] hover:bg-[#1A1A1A] hover:border-[#333333] hover:text-white",
        outline:
          "border border-[#262626] bg-transparent text-zinc-300 hover:bg-[#121212] hover:border-[#3A3A3A] hover:text-white",
        ghost:
          "text-zinc-400 hover:bg-[#141414] hover:text-zinc-200",
        danger:
          "bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/40 hover:text-red-300 hover:border-red-800",
        dangerSolid:
          "bg-red-600 text-white hover:bg-red-500 shadow-sm",
        purpleGhost:
          "text-purple-400 hover:bg-purple-950/30 hover:text-purple-300",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-base",
        icon: "h-9 w-9 p-0",
        iconSm: "h-7 w-7 p-0 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
