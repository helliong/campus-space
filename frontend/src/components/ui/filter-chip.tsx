import { Check } from "lucide-react";
import { type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type FilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

export function FilterChip({ className, selected = false, children, ...props }: FilterChipProps) {
  return (
    <button
      aria-pressed={selected}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-1 rounded-full border px-4 text-xs font-medium transition-colors",
        selected
          ? "border-brand bg-brand text-white hover:bg-brand-hover"
          : "border-[#E4E7EC] bg-white text-ink hover:border-[#C7CDD7]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35",
        className,
      )}
      type="button"
      {...props}
    >
      {selected && <Check aria-hidden className="size-3.5" strokeWidth={2.5} />}
      {children}
    </button>
  );
}
