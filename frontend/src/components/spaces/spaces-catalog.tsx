"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { cn } from "@/lib/cn";

const spaces = [
  { id: "k-214", name: "К-214", type: "Коворкинг", building: "Корпус А", capacity: 12, details: "12 мест · 6 ПК · Проектор", equipment: "projector", status: "available" },
  { id: "a-201", name: "А-201", type: "Аудитория", building: "Корпус А", capacity: 12, details: "12 мест · Доска · Проектор", equipment: "projector", status: "available" },
  { id: "pc-5", name: "ПК-5", type: "Компьютерный класс", building: "Корпус Б", capacity: 20, details: "20 ПК · Специализированное ПО", equipment: "pc", status: "pending" },
];

export function SpacesCatalog() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [capacity, setCapacity] = useState("all");
  const [equipment, setEquipment] = useState("all");
  const [availability, setAvailability] = useState("all");

  const filtered = useMemo(() => spaces.filter((space) => {
    const matchesQuery = `${space.name} ${space.type} ${space.building}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = type === "all" || space.type === type;
    const matchesCapacity = capacity === "all" || (capacity === "10" ? space.capacity <= 10 : space.capacity > 10);
    const matchesEquipment = equipment === "all" || space.equipment === equipment;
    const matchesAvailability = availability === "all" || space.status === availability;
    return matchesQuery && matchesType && matchesCapacity && matchesEquipment && matchesAvailability;
  }), [availability, capacity, equipment, query, type]);

  const reset = () => {
    setQuery(""); setType("all"); setCapacity("all"); setEquipment("all"); setAvailability("all");
  };

  return (
    <>
      <div className="mt-9 flex flex-col justify-between gap-4 sm:flex-row">
        <label className="relative block w-full max-w-[570px]">
          <Search aria-hidden className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#667085]" />
          <span className="sr-only">Поиск пространств</span>
          <input className="h-[50px] w-full rounded-xl border border-[#E4E7EC] bg-white pl-12 pr-4 text-sm text-ink outline-none placeholder:text-[#98A2B3] focus:border-brand focus:ring-2 focus:ring-brand/10" onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по номеру, корпусу или типу" value={query} />
        </label>
        <Link className="inline-flex h-12 min-w-[178px] items-center justify-center self-start rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover" href="/map">На карте</Link>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[20px] border border-[#E4E7EC] bg-white p-[23px]">
          <h2 className="text-lg font-bold text-ink">Фильтры</h2>
          <div className="mt-8 space-y-7">
            <CatalogFilter label="Тип пространства" onChange={setType} value={type} options={[["all", "Все типы"], ["Аудитория", "Аудитория"], ["Коворкинг", "Коворкинг"], ["Компьютерный класс", "Компьютерный класс"]]} />
            <CatalogFilter label="Вместимость" onChange={setCapacity} value={capacity} options={[["all", "Любая"], ["10", "До 10 мест"], ["more", "Больше 10 мест"]]} />
            <CatalogFilter label="Оснащение" onChange={setEquipment} value={equipment} options={[["all", "Любое"], ["pc", "ПК"], ["projector", "Проектор"]]} />
            <CatalogFilter label="Доступность" onChange={setAvailability} value={availability} options={[["all", "Любая"], ["available", "Свободно сейчас"], ["pending", "По заявке"]]} />
          </div>
          <button className="mt-12 text-[13px] font-semibold text-brand hover:text-brand-hover" onClick={reset} type="button">Сбросить фильтры</button>
        </aside>

        <section aria-live="polite" className="space-y-5">
          {filtered.map((space) => <CatalogCard key={space.id} space={space} />)}
          {filtered.length === 0 && <div className="rounded-[18px] border border-[#E4E7EC] bg-white p-10 text-center text-sm text-[#667085]">По выбранным фильтрам ничего не найдено.</div>}
        </section>
      </div>
    </>
  );
}

function CatalogFilter({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return (
    <label className="block text-xs font-semibold text-ink">
      {label}
      <select className="mt-2 h-11 w-full rounded-[10px] border-0 bg-canvas px-3.5 text-xs font-medium text-[#667085] outline-none focus:ring-2 focus:ring-brand/20" onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

function CatalogCard({ space }: { space: (typeof spaces)[number] }) {
  const pending = space.status === "pending";
  return (
    <article className="flex min-h-40 flex-col gap-5 rounded-[18px] border border-[#E4E7EC] bg-white p-[23px] sm:flex-row sm:items-center">
      <div aria-hidden className={cn("h-28 w-full shrink-0 rounded-[14px] sm:w-40", pending ? "bg-[#EEF0FF]" : "bg-[#E8F8F5]")} />
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-bold text-ink">{space.name}</h2>
        <p className="mt-1 text-sm text-[#667085]">{space.type} · {space.building}</p>
        <p className="mt-4 text-[13px] font-medium text-ink">{space.details}</p>
        <span className={cn("mt-3 inline-flex h-6 min-w-[92px] items-center justify-center rounded-full px-3 text-[10px] font-semibold", pending ? "bg-[#EEF0FF] text-[#6675E0]" : "bg-[#E8F8F5] text-accent")}>{pending ? "По заявке" : "Свободно"}</span>
      </div>
      <Link className="inline-flex h-12 min-w-[140px] items-center justify-center rounded-xl border border-[#E4E7EC] bg-white px-5 text-sm font-semibold text-brand hover:bg-[#F5F6FF]" href={`/spaces/${space.id}`}>Подробнее</Link>
    </article>
  );
}
