import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  placeholder?: string;
};

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ className, children, placeholder = "Выберите дату", defaultValue = "", ...props }, ref) => (
    <span className={cn("relative inline-flex", className)}>
      <select
        ref={ref}
        className="h-[52px] w-[260px] appearance-none rounded-xl border border-[#E4E7EC] bg-white px-[15px] pr-11 text-sm font-medium text-[#667085] outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:opacity-50"
        defaultValue={defaultValue}
        {...props}
      >
        <option disabled value="">
          {placeholder}
        </option>
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#667085]" />
    </span>
  ),
);

SelectField.displayName = "SelectField";
