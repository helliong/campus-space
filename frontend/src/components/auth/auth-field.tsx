import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(({ id, label, error, className, ...props }, ref) => (
  <label className="block text-xs font-semibold text-ink" htmlFor={id}>
    {label}
    <input
      aria-describedby={error ? `${id}-error` : undefined}
      aria-invalid={Boolean(error)}
      className={cn("mt-2 h-[50px] w-full rounded-xl border bg-white px-[15px] text-sm font-normal text-ink outline-none transition placeholder:text-[#98A2B3]", error ? "border-[#D94A5C] focus:border-[#D94A5C] focus:ring-2 focus:ring-[#D94A5C]/10" : "border-[#E4E7EC] focus:border-brand focus:ring-2 focus:ring-brand/10", className)}
      id={id}
      ref={ref}
      {...props}
    />
    {error && <span className="mt-1.5 block text-[11px] font-medium text-[#D94A5C]" id={`${id}-error`} role="alert">{error}</span>}
  </label>
));

AuthField.displayName = "AuthField";
