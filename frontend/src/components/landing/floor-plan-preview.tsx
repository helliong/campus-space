"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useApiData } from "@/hooks/use-api-data";
import { cn } from "@/lib/cn";
import type { Space } from "@/lib/types";

const positions = [
  "left-[7%] top-[12%] h-[25%] w-[28%]",
  "left-[38%] top-[12%] h-[25%] w-[24%]",
  "right-[7%] top-[12%] h-[25%] w-[28%]",
  "bottom-[12%] left-[7%] h-[22%] w-[23%]",
  "bottom-[12%] left-[32%] h-[22%] w-[31%]",
  "bottom-[12%] right-[7%] h-[22%] w-[29%]",
];

export function FloorPlanPreview() {
  const { data, loading } = useApiData<Space[]>("/spaces");
  const [selectedId, setSelectedId] = useState("");
  const floorSpaces = useMemo(() => {
    if (!data?.length) return [];
    const first = data[0];
    return data.filter((space) => space.building_code === first.building_code && space.floor_number === first.floor_number).slice(0, positions.length);
  }, [data]);
  const selected = floorSpaces.find((space) => space.id === selectedId);
  const first = floorSpaces[0];
  const availableCount = floorSpaces.filter((space) => space.is_available).length;

  return (
    <div className="rounded-3xl border border-[#E4E7EC] bg-white p-[26px]">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-base font-bold text-ink">{first ? `Корпус ${first.building_code} · ${first.floor_number} этаж` : "Карта пространств"}</h2><p className="mt-1 text-xs font-medium text-accent">{first ? `${availableCount} доступно сейчас` : "Актуальные данные из каталога"}</p></div><div className="flex items-center gap-5 pt-1 text-[10px] font-medium text-[#667085]"><Legend color="bg-accent" label="Свободно" /><Legend color="bg-[#98A2B3]" label="Занято" /><Legend color="bg-[#6675E0]" label="По заявке" /></div></div>

      <div className="relative mt-5 aspect-[564/286] min-h-[250px] rounded-2xl bg-canvas">
        <div aria-label="Коридор" className="absolute left-[7%] top-[43%] h-[15%] w-[86%] rounded-xl border border-[#E4E7EC] bg-white" />
        {loading && <div className="absolute inset-6 animate-pulse rounded-xl bg-[#EDEFF3]" />}
        {!loading && floorSpaces.length === 0 && <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-xs leading-5 text-[#667085]">Помещения появятся здесь после добавления в систему.</div>}
        {floorSpaces.map((space, index) => (
          <button aria-pressed={selectedId === space.id} className={cn("absolute rounded-[10px] border border-[#E4E7EC] p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40", space.requires_approval ? "bg-[#EEF0FF] hover:bg-[#E5E8FF]" : space.is_available ? "bg-[#E8F8F5] hover:bg-[#DDF4F0]" : "bg-[#EEF1F4]", selectedId === space.id && "ring-2 ring-brand ring-offset-2", positions[index])} key={space.id} onClick={() => setSelectedId(space.id)} type="button"><strong className="block truncate text-xs font-bold text-ink">{space.code}</strong><span className="mt-2 block truncate text-[10px] font-medium text-[#667085]">{space.capacity} мест</span></button>
        ))}
      </div>

      <div className="mt-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><p className="text-xs font-medium text-[#667085]">{selected ? `Выбрано: ${selected.name} · ${selected.capacity} мест` : floorSpaces.length ? "Нажмите на помещение, чтобы посмотреть детали" : "Каталог пока пуст"}</p><Link className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover" href="/spaces">Открыть каталог&nbsp; →</Link></div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) { return <span className="inline-flex items-center gap-1"><span className={`size-2 rounded-full ${color}`} />{label}</span>; }
