import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors focus-visible:outline-none focus-visible:border-purple-500/80 focus-visible:ring-2 focus-visible:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            error && "border-red-600/80 focus-visible:border-red-500 focus-visible:ring-red-500/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
