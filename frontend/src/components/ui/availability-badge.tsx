import { cn } from "@/lib/cn";

export type AvailabilityStatus = "available" | "partial" | "busy" | "pending" | "restricted";

const statusStyles: Record<AvailabilityStatus, { label: string; className: string; dot: string }> = {
  available: { label: "Свободно", className: "bg-[#E8F8F5] text-[#22B8A7]", dot: "bg-[#22B8A7]" },
  partial: { label: "Частично", className: "bg-[#FEF3D8] text-[#E8A317]", dot: "bg-[#E8A317]" },
  busy: { label: "Занято", className: "bg-[#EEF1F4] text-[#475467]", dot: "bg-[#475467]" },
  pending: { label: "Одобрение", className: "bg-[#EEF0FF] text-[#6675E0]", dot: "bg-[#6675E0]" },
  restricted: { label: "Ограничено", className: "bg-[#EDF0F3] text-[#475467]", dot: "bg-[#475467]" },
};

type AvailabilityBadgeProps = {
  status?: AvailabilityStatus;
  className?: string;
};

export function AvailabilityBadge({ status = "available", className }: AvailabilityBadgeProps) {
  const style = statusStyles[status];

  return (
    <span className={cn("inline-flex h-8 items-center gap-2 rounded-full px-3 text-[11px] font-semibold", style.className, className)}>
      <span aria-hidden className={cn("size-2 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}
