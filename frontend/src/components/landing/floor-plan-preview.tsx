"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/cn";

type Room = {
  id: string;
  name: string;
  meta: string;
  status: "available" | "busy" | "pending" | "partial";
  className: string;
};

const rooms: Room[] = [
  { id: "a-201", name: "А-201", meta: "12 мест", status: "available", className: "left-[7%] top-[12%] h-[25%] w-[28%]" },
  { id: "lab-2", name: "Лаб. 2", meta: "по заявке", status: "pending", className: "left-[38%] top-[12%] h-[25%] w-[24%]" },
  { id: "a-204", name: "А-204", meta: "занято", status: "busy", className: "right-[7%] top-[12%] h-[25%] w-[28%]" },
  { id: "pc-5", name: "ПК-5", meta: "свободно", status: "available", className: "bottom-[12%] left-[7%] h-[22%] w-[23%]" },
  { id: "coworking", name: "Коворкинг", meta: "12 столов", status: "available", className: "bottom-[12%] left-[32%] h-[22%] w-[31%]" },
  { id: "a-208", name: "А-208", meta: "частично", status: "partial", className: "bottom-[12%] right-[7%] h-[22%] w-[29%]" },
];

const roomStyles = {
  available: "bg-[#E8F8F5] hover:bg-[#DDF4F0]",
  pending: "bg-[#EEF0FF] hover:bg-[#E5E8FF]",
  busy: "bg-[#EEF1F4]",
  partial: "bg-[#FEF3D8] hover:bg-[#FCECC2]",
};

export function FloorPlanPreview() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const selected = rooms.find((room) => room.id === selectedRoom);

  return (
    <div className="rounded-3xl border border-[#E4E7EC] bg-white p-[26px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-ink">Корпус А · 2 этаж</h2>
          <p className="mt-1 text-xs font-medium text-accent">Сейчас свободно 14 мест</p>
        </div>
        <div className="flex items-center gap-6 pt-1 text-[10px] font-medium text-[#667085]">
          <Legend icon="/icons/status-free.svg" label="Свободно" />
          <Legend icon="/icons/status-busy.svg" label="Занято" />
          <Legend icon="/icons/status-pending.svg" label="По заявке" />
        </div>
      </div>

      <div className="relative mt-5 aspect-[564/286] min-h-[250px] rounded-2xl bg-canvas">
        <div aria-label="Коридор" className="absolute left-[7%] top-[43%] h-[15%] w-[86%] rounded-xl border border-[#E4E7EC] bg-white" />
        {rooms.map((room) => (
          <button
            aria-pressed={selectedRoom === room.id}
            className={cn(
              "absolute rounded-[10px] border border-[#E4E7EC] p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
              roomStyles[room.status],
              selectedRoom === room.id && "ring-2 ring-brand ring-offset-2",
              room.className,
            )}
            disabled={room.status === "busy"}
            key={room.id}
            onClick={() => setSelectedRoom(room.id)}
            type="button"
          >
            <strong className="block text-xs font-bold text-ink">{room.name}</strong>
            <span className="mt-2 block text-[10px] font-medium text-[#667085]">{room.meta}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-xs font-medium text-[#667085]">
          {selected ? `Выбрано: ${selected.name} · ${selected.meta}` : "Нажмите на комнату, чтобы узнать доступные слоты"}
        </p>
        <Link className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover" href="/map">
          Открыть карту&nbsp; →
        </Link>
      </div>
    </div>
  );
}

function Legend({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Image alt="" height={8} src={icon} width={8} />
      {label}
    </span>
  );
}
