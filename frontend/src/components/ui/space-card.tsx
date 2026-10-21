import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";

import { AvailabilityBadge, type AvailabilityStatus } from "./availability-badge";
import { Button } from "./button";
import { TimeSlot } from "./time-slot";
import { cn } from "@/lib/cn";

export type SpaceCardData = {
  id: string;
  name: string;
  type: string;
  floor: number;
  seats: number;
  computers?: number;
  features?: string[];
  rating?: number;
  review?: string;
  status?: AvailabilityStatus;
  imageUrl?: string;
  slots?: string[];
};

type SpaceCardProps = {
  space: SpaceCardData;
  variant?: "summary" | "booking";
  className?: string;
};

function SpaceImage({ space, className }: { space: SpaceCardData; className?: string }) {
  if (space.imageUrl) {
    return <img alt={`Пространство ${space.name}`} className={cn("object-cover", className)} src={space.imageUrl} />;
  }

  return <div aria-hidden className={cn("bg-[#E8F8F5]", className)} />;
}

export function SpaceCard({ space, variant = "summary", className }: SpaceCardProps) {
  const facts = [
    `${space.seats} мест`,
    space.computers ? `${space.computers} ПК` : null,
    ...(space.features ?? []),
  ].filter(Boolean);

  if (variant === "booking") {
    return (
      <article className={cn("w-[280px] rounded-2xl border border-[#E4E7EC] bg-white p-5", className)}>
        <p className="mb-4 text-[11px] font-bold uppercase text-[#667085]">Pattern</p>
        <h3 className="mb-3 text-lg font-bold text-ink">Карточка пространства</h3>
        <SpaceImage className="h-28 w-full rounded-xl" space={space} />
        <h4 className="mt-5 text-sm font-bold text-ink">{space.name} · {space.type}</h4>
        <p className="mt-2 text-xs text-[#667085]">{facts.join(" · ")} · {space.rating?.toFixed(1)} ★</p>
        <p className="mb-3 mt-7 text-xs font-bold text-ink">Ближайшие свободные слоты</p>
        <div className="flex gap-2">
          {(space.slots ?? ["14:00", "14:30", "15:00"]).map((slot, index) => (
            <TimeSlot className="min-w-0 flex-1" key={slot} state={index === 1 ? "selected" : "available"}>
              {slot}
            </TimeSlot>
          ))}
        </div>
        <Button className="mt-12" fullWidth>Забронировать</Button>
      </article>
    );
  }

  return (
    <article className={cn("w-[328px] rounded-2xl border border-[#E4E7EC] bg-white p-[15px]", className)}>
      <div className="grid grid-cols-[88px_1fr] gap-4">
        <SpaceImage className="h-[72px] w-[88px] rounded-xl" space={space} />
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-6 text-ink">{space.name}</h3>
          <p className="mb-1.5 mt-0.5 text-xs text-[#667085]">{space.type} · {space.floor} этаж</p>
          <AvailabilityBadge status={space.status} />
        </div>
      </div>
      <p className="mt-3.5 truncate text-xs font-medium text-[#475467]">{facts.join("   ·   ")}</p>
      {(space.rating || space.review) && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-[#667085]">
          {space.rating && <><span>{space.rating.toFixed(1)}</span><Star aria-hidden className="size-3 fill-[#667085]" /></>}
          {space.review && <span>{space.review}</span>}
        </p>
      )}
      <Link className="mt-4 flex items-center gap-1.5 border-t border-[#E4E7EC] pt-3 text-xs font-semibold text-brand hover:text-brand-hover" href={`/spaces/${space.id}`}>
        Открыть карточку <ArrowRight aria-hidden className="size-3.5" />
      </Link>
    </article>
  );
}
