import { type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type TimeSlotState = "available" | "selected" | "busy" | "pending";

type TimeSlotProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  state?: TimeSlotState;
};

export function TimeSlot({ className, state = "available", children, disabled, ...props }: TimeSlotProps) {
  const unavailable = disabled || state === "busy";

  return (
    <button
      aria-pressed={state === "selected"}
      className={cn(
        "inline-flex h-[42px] min-w-[82px] items-center justify-center rounded-[10px] px-3 text-xs font-semibold transition-colors",
        state === "available" && "border border-[#E4E7EC] bg-white text-brand hover:border-brand",
        state === "selected" && "bg-brand text-white",
        state === "busy" && "cursor-not-allowed bg-[#EEF1F4] text-[#667085]",
        state === "pending" && "bg-[#EEF0FF] text-[#6675E0]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35",
        className,
      )}
      disabled={unavailable}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
