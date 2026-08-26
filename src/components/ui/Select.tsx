import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "flex h-9 w-full appearance-none rounded-lg border border-[#222222] bg-[#0A0A0A] px-3 py-1.5 pr-8 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors focus-visible:outline-none focus-visible:border-purple-500/80 focus-visible:ring-2 focus-visible:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
            error && "border-red-600/80 focus-visible:border-red-500 focus-visible:ring-red-500/20",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
        {error && (
          <p className="mt-1.5 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
