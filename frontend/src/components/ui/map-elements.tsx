import { type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type MapRoomProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  name: string;
  meta: string;
  status?: "available" | "pending" | "busy";
};

const roomStyles = {
  available: "bg-[#E8F8F5] hover:bg-[#DDF4F0]",
  pending: "bg-[#EEF0FF] hover:bg-[#E5E8FF]",
  busy: "cursor-not-allowed bg-[#EEF1F4] text-[#667085]",
};

export function MapRoom({ name, meta, status = "available", className, disabled, ...props }: MapRoomProps) {
  return (
    <button
      className={cn(
        "flex h-[92px] w-[146px] flex-col items-start justify-center rounded-lg border border-white px-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35",
        roomStyles[status],
        className,
      )}
      disabled={disabled || status === "busy"}
      type="button"
      {...props}
    >
      <strong className="text-base font-bold text-ink">{name}</strong>
      <span className="mt-1.5 text-[11px] font-medium text-[#667085]">{meta}</span>
    </button>
  );
}

type MapSeatProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  selected?: boolean;
  label?: string;
};

export function MapDesk({ className, selected = false, disabled = false, label = "Рабочий стол", ...props }: MapSeatProps) {
  return (
    <button
      aria-label={label}
      aria-pressed={selected}
      className={cn(
        "relative size-14 rounded-lg border border-white bg-[#E8F8F5] transition hover:bg-[#DDF4F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35",
        selected && "ring-2 ring-[#22B8A7] ring-offset-2",
        disabled && "cursor-not-allowed grayscale opacity-50",
        className,
      )}
      disabled={disabled}
      type="button"
      {...props}
    >
      <span className="absolute left-[11px] top-[9px] h-[22px] w-8 rounded-[5px] bg-[#22B8A7]" />
      <span className="absolute left-[15px] top-[35px] h-2 w-6 rounded-[3px] bg-[#22B8A7]" />
    </button>
  );
}

export function MapPcSeat({ className, selected = false, disabled = false, label = "Стол с компьютером", ...props }: MapSeatProps) {
  return (
    <button
      aria-label={label}
      aria-pressed={selected}
      className={cn(
        "relative size-14 rounded-lg border border-white bg-[#EEF0FF] transition hover:bg-[#E5E8FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35",
        selected && "ring-2 ring-[#6675E0] ring-offset-2",
        disabled && "cursor-not-allowed grayscale opacity-50",
        className,
      )}
      disabled={disabled}
      type="button"
      {...props}
    >
      <span className="absolute left-[13px] top-[10px] h-5 w-7 rounded bg-[#6675E0]" />
      <span className="absolute left-6 top-8 h-[7px] w-1.5 rounded-sm bg-[#6675E0]" />
      <span className="absolute left-[17px] top-[39px] h-1 w-5 rounded-sm bg-[#6675E0]" />
    </button>
  );
}
