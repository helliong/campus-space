"use client";

import Link from "next/link";
import { useState } from "react";

import { LocationPreview } from "./location-preview";

export function UpcomingBooking() {
  const [cancelled, setCancelled] = useState(false);

  return (
    <article className="rounded-[20px] border border-[#E4E7EC] bg-white p-[23px]">
      <div className="flex flex-col gap-[30px] xl:flex-row">
        <LocationPreview />
        <div className="min-w-0 flex-1">
          <span className={cancelled ? "inline-flex h-[26px] items-center rounded-full bg-[#EEF1F4] px-3 text-[10px] font-semibold text-[#667085]" : "inline-flex h-[26px] items-center rounded-full bg-[#E8F8F5] px-3 text-[10px] font-semibold text-accent"}>{cancelled ? "Отменено" : "Подтверждено"}</span>
          <h3 className="mt-3 text-2xl font-bold text-ink">К-214 · Коворкинг</h3>
          <p className="mt-1 text-sm text-[#667085]">Корпус А · 2 этаж</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            <BookingFact label="Сегодня" value="24 октября" />
            <BookingFact label="Время" value="14:00–16:00" />
            <BookingFact label="Место" value="Стол 12 · ПК" />
          </div>
        </div>
        <div className="flex shrink-0 flex-col justify-end xl:w-[377px]">
          {!cancelled && <p className="mb-4 text-xs font-semibold text-brand">Начнётся через 1 ч 35 мин</p>}
          <div className="flex flex-wrap gap-3">
            <Link className="inline-flex h-[42px] min-w-[180px] items-center justify-center rounded-[11px] bg-brand px-4 text-xs font-semibold text-white hover:bg-brand-hover" href="/map">Открыть на карте</Link>
            <button className="inline-flex h-[42px] min-w-[110px] items-center justify-center rounded-[11px] border border-[#E4E7EC] bg-white px-4 text-xs font-semibold text-brand disabled:cursor-not-allowed disabled:text-[#98A2B3]" disabled={cancelled} onClick={() => setCancelled(true)} type="button">{cancelled ? "Отменено" : "Отменить"}</button>
          </div>
        </div>
      </div>
    </article>
  );
}

function BookingFact({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[11px] font-medium text-[#667085]">{label}</p><p className="mt-1 text-[13px] font-semibold text-ink">{value}</p></div>;
}
