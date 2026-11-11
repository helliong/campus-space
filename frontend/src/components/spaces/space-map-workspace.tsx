"use client";

import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Heart,
  List,
  Map as MapIcon,
  MapPin,
  Maximize2,
  Monitor,
  Projector,
  RotateCcw,
  Star,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { AccountHeader as AuthenticatedHeader } from "@/components/layout/account-header";
import { SiteHeader } from "@/components/layout/site-header";
import { Button, SelectField } from "@/components/ui";
import { useApiData } from "@/hooks/use-api-data";
import { apiRequest } from "@/lib/api";
import { ensureAuthenticated } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { filterSpaces } from "@/lib/space-filters";
import { spaceTypeLabel } from "@/lib/format";
import type { Booking, Space } from "@/lib/types";

type InitialBooking = {
  room?: string;
  slot?: string;
  date?: string;
  pc?: string;
  resume?: boolean;
};

function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function nextHalfHour() {
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(now.getMinutes() < 30 ? 30 : 60);
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function bookingPath(spaceId: string, date: string, slot: string, workplaceId: string, resume = false) {
  const params = new URLSearchParams({ room: spaceId, date, slot });
  if (workplaceId) params.set("pc", workplaceId);
  if (resume) params.set("book", "1");
  return `/spaces?${params.toString()}`;
}

function initialsFromCode(code: string) {
  return code.trim().charAt(0).toUpperCase() || "•";
}

export function SpaceMapWorkspace({ authenticated, initialBooking }: { authenticated: boolean; initialBooking?: InitialBooking }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("");
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState("");
  const [selectedDate, setSelectedDate] = useState(initialBooking?.date && /^\d{4}-\d{2}-\d{2}$/.test(initialBooking.date) ? initialBooking.date : localDate());
  const [selectedTime, setSelectedTime] = useState(initialBooking?.slot && /^\d{2}:\d{2}$/.test(initialBooking.slot) ? initialBooking.slot : nextHalfHour());
  const availabilityPath = useMemo(() => {
    const startsAt = new Date(`${selectedDate}T${selectedTime}:00`);
    if (Number.isNaN(startsAt.getTime())) return "/spaces";
    const until = new Date(startsAt.getTime() + 30 * 60 * 1000);
    return `/spaces?${new URLSearchParams({ at: startsAt.toISOString(), until: until.toISOString() })}`;
  }, [selectedDate, selectedTime]);
  const { data: spaces, loading, error, reload } = useApiData<Space[]>(availabilityPath);
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState<number | "">("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [minCapacity, setMinCapacity] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [approval, setApproval] = useState("");
  const [view, setView] = useState<"map" | "list">("map");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [bookingPending, setBookingPending] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const resumeAttempted = useRef(false);

  useEffect(() => {
    if (!spaces?.length || selectedId || !initialBooking?.room) return;
    const requested = spaces.find((space) => space.id === initialBooking?.room || space.code === initialBooking?.room);
    if (!requested) return;
    setSelectedId(requested.id);
    if (requested && initialBooking?.pc) {
      const workplace = requested.workplaces.find((item) => item.id === initialBooking.pc || item.code === initialBooking.pc);
      setSelectedWorkplaceId(workplace?.id ?? "");
    }
  }, [initialBooking?.pc, initialBooking?.room, selectedId, spaces]);

  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    const load = async () => {
      try {
        if (!(await ensureAuthenticated())) return;
        const favorites = await apiRequest<Space[]>("/favorites");
        if (active) setFavoriteIds(new Set(favorites.map((space) => space.id)));
      } catch {
        // Favorites are secondary; the catalog remains available if they fail to load.
      }
    };
    void load();
    return () => { active = false; };
  }, [authenticated]);

  const buildings = useMemo(() => Array.from(new Set((spaces ?? []).map((space) => space.building_code))).sort(), [spaces]);
  const floors = useMemo(() => Array.from(new Set((spaces ?? []).filter((space) => !building || space.building_code === building).map((space) => space.floor_number))).sort((a, b) => a - b), [building, spaces]);
  const availableTypes = useMemo(() => [...new Set((spaces ?? []).map((space) => space.space_type))].sort((a, b) => spaceTypeLabel(a).localeCompare(spaceTypeLabel(b), "ru")), [spaces]);
  const availableAmenities = useMemo(() => [...new Set((spaces ?? []).flatMap((space) => space.amenities))].sort((a, b) => a.localeCompare(b, "ru")), [spaces]);
  const invalidCapacity = Boolean(minCapacity && maxCapacity && Number(minCapacity) > Number(maxCapacity));
  const visibleSpaces = useMemo(() => filterSpaces(spaces ?? [], { building, floor, onlyAvailable, query, types, amenities, minCapacity, maxCapacity, approval }), [spaces, building, floor, onlyAvailable, query, types, amenities, minCapacity, maxCapacity, approval]);
  const hasFilters = Boolean(building || floor !== "" || onlyAvailable || query || types.length || amenities.length || minCapacity || maxCapacity || approval);
  const mapFloors = useMemo(() => {
    const groups = new Map<string, Space[]>();
    for (const space of visibleSpaces) {
      const key = `${space.building_code}-${space.floor_number}`;
      groups.set(key, [...(groups.get(key) ?? []), space]);
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], "ru", { numeric: true }));
  }, [visibleSpaces]);
  const selected = visibleSpaces.find((space) => space.id === selectedId) ?? null;

  const chooseSpace = (space: Space) => {
    setSelectedId(space.id);
    setSelectedWorkplaceId("");
    setBookingMessage("");
  };

  const submitBooking = useCallback(async () => {
    if (!selected || bookingPending) return;
    if (selected.workplaces.length > 0 && !selected.workplaces.some((item) => item.id === selectedWorkplaceId && item.is_available)) {
      setBookingMessage("Сначала выберите конкретное рабочее место.");
      return;
    }
    setBookingPending(true);
    setBookingMessage("");

    const returnPath = bookingPath(selected.id, selectedDate, selectedTime, selectedWorkplaceId, true);
    if (!(await ensureAuthenticated())) {
      setBookingPending(false);
      router.push(`/login?next=${encodeURIComponent(returnPath)}`);
      return;
    }

    const startsAt = new Date(`${selectedDate}T${selectedTime}:00`);
    const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);
    try {
      const booking = await apiRequest<Booking>("/bookings", {
        method: "POST",
        body: JSON.stringify({
          space_id: selectedWorkplaceId ? null : selected.id,
          workplace_id: selectedWorkplaceId || null,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
        }),
      });
      setBookingMessage(booking.status === "confirmed" ? "Бронирование подтверждено." : "Заявка отправлена на рассмотрение.");
      router.replace(bookingPath(selected.id, selectedDate, selectedTime, selectedWorkplaceId));
      reload();
    } catch (reason) {
      setBookingMessage(reason instanceof Error ? reason.message : "Не удалось создать бронирование");
    } finally {
      setBookingPending(false);
    }
  }, [bookingPending, reload, router, selected, selectedDate, selectedTime, selectedWorkplaceId]);

  useEffect(() => {
    if (!initialBooking?.resume || !selected || resumeAttempted.current) return;
    resumeAttempted.current = true;
    void submitBooking();
  }, [initialBooking?.resume, selected, submitBooking]);

  const toggleFavorite = async () => {
    if (!selected) return;
    if (!(await ensureAuthenticated())) {
      router.push(`/login?next=${encodeURIComponent(bookingPath(selected.id, selectedDate, selectedTime, selectedWorkplaceId))}`);
      return;
    }
    const isFavorite = favoriteIds.has(selected.id);
    try {
      await apiRequest<void>(`/favorites/${selected.id}`, { method: isFavorite ? "DELETE" : "PUT" });
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (isFavorite) next.delete(selected.id); else next.add(selected.id);
        return next;
      });
    } catch (reason) {
      setBookingMessage(reason instanceof Error ? reason.message : "Не удалось обновить избранное");
    }
  };

  const reset = () => {
    setBuilding("");
    setFloor("");
    setOnlyAvailable(false);
    setQuery("");
    setTypes([]);
    setAmenities([]);
    setMinCapacity("");
    setMaxCapacity("");
    setApproval("");
  };

  return (
    <div className="flex flex-1 flex-col bg-canvas">
      {authenticated ? <AuthenticatedHeader active="spaces" /> : <SiteHeader active="spaces" />}

      <section className="border-b border-[#E4E7EC] bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-end gap-3 px-5 py-3 sm:px-8 lg:px-16">
          <SelectFilter icon={Building2} label="Корпус" onChange={(value) => { setBuilding(value); setFloor(""); }} options={buildings} placeholder="Все корпуса" value={building} />
          <label className="min-w-[150px] flex-1 xl:max-w-[200px]">
            <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#667085]">Дата</span>
            <span className="flex h-11 items-center gap-2 rounded-[10px] border border-[#DFE3E9] bg-white px-3">
              <CalendarDays className="size-4 text-[#667085]" />
              <input className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-ink outline-none" min={localDate()} onChange={(event) => setSelectedDate(event.target.value)} type="date" value={selectedDate} />
            </span>
          </label>
          <label className="min-w-[130px] flex-1 xl:max-w-[170px]">
            <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#667085]">Начало</span>
            <span className="flex h-11 items-center gap-2 rounded-[10px] border border-[#DFE3E9] bg-white px-3">
              <Clock3 className="size-4 text-[#667085]" />
              <input className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-ink outline-none" onChange={(event) => setSelectedTime(event.target.value)} step="1800" type="time" value={selectedTime} />
            </span>
          </label>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex rounded-[10px] bg-[#F0F2F5] p-1">
              <button aria-label="2D-карта" aria-pressed={view === "map"} className={cn("flex size-9 items-center justify-center rounded-lg", view === "map" ? "bg-white text-brand shadow-sm" : "text-[#667085]")} onClick={() => setView("map")} type="button"><MapIcon className="size-4" /></button>
              <button aria-label="Список" aria-pressed={view === "list"} className={cn("flex size-9 items-center justify-center rounded-lg", view === "list" ? "bg-white text-brand shadow-sm" : "text-[#667085]")} onClick={() => setView("list")} type="button"><List className="size-4" /></button>
            </div>
            <button aria-label="Сбросить фильтры" className="flex size-11 items-center justify-center rounded-[10px] border border-[#DFE3E9] text-[#667085] hover:text-brand" onClick={reset} type="button"><RotateCcw className="size-4" /></button>
          </div>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-[1600px] flex-1 items-start gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[180px_minmax(0,1fr)_300px] xl:p-6">
        <aside className="min-w-0 rounded-[18px] border border-[#E1E5EA] bg-white p-4 lg:col-span-2 xl:col-span-1">
          <h2 className="text-sm font-bold text-ink">Этажи</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-1">
            <button className={cn("flex h-10 items-center rounded-[10px] px-3 text-xs font-semibold", floor === "" ? "bg-brand text-white" : "text-[#475467] hover:bg-[#F5F6FF]")} onClick={() => setFloor("")} type="button">Все этажи</button>
            {floors.map((number) => <button className={cn("flex h-10 items-center rounded-[10px] px-3 text-xs font-semibold", floor === number ? "bg-brand text-white" : "text-[#475467] hover:bg-[#F5F6FF]")} key={number} onClick={() => setFloor(number)} type="button">{number} этаж</button>)}
          </div>
          <div className="my-5 h-px bg-[#E7E9EE]" />
          <FilterCheckbox checked={onlyAvailable} onChange={setOnlyAvailable} label="Только свободные" />
          <p className="mt-2 text-[10px] leading-4 text-[#667085]">На выбранные дату и время</p>
          <div className="mt-5 space-y-5">
            <label className="block text-xs font-semibold text-ink">Поиск
              <input className="mt-2 h-10 w-full min-w-0 rounded-lg border border-[#DFE3E9] px-3 text-xs font-normal outline-none focus:border-brand" onChange={(event) => setQuery(event.target.value)} placeholder="Название или номер" type="search" value={query} />
            </label>
            <fieldset><legend className="mb-3 text-xs font-semibold text-ink">Тип помещения</legend><div className="space-y-2.5">{availableTypes.map((type) => <FilterCheckbox key={type} checked={types.includes(type)} label={spaceTypeLabel(type)} onChange={(checked) => setTypes((current) => checked ? [...current, type] : current.filter((item) => item !== type))} />)}</div></fieldset>
            <fieldset><legend className="text-xs font-semibold text-ink">Вместимость помещения</legend>
              <div className="mt-3 grid grid-cols-2 gap-2">{([{ label: "От", value: minCapacity, change: setMinCapacity }, { label: "До", value: maxCapacity, change: setMaxCapacity }]).map(({ label, value, change }) => <label className="text-[10px] text-[#667085]" key={label}>{label}<input aria-invalid={invalidCapacity} aria-describedby={invalidCapacity ? "capacity-error" : undefined} className="mt-1 h-10 w-full min-w-0 rounded-lg border border-[#DFE3E9] px-2 text-xs text-ink outline-none focus:border-brand" min="1" step="1" inputMode="numeric" onChange={(event) => { const next = event.target.value; if (!next || /^\d+$/.test(next) && Number(next) >= 1) change(next); }} placeholder="Мест" type="number" value={value} /></label>)}</div>
              {invalidCapacity && <p className="mt-2 text-[10px] text-red-600" id="capacity-error">Значение «От» не должно превышать «До».</p>}
            </fieldset>
            <fieldset><legend className="mb-2 text-xs font-semibold text-ink">Оснащение</legend><p className="mb-3 text-[10px] leading-4 text-[#667085]">Все выбранные удобства</p><div className="space-y-2.5">{availableAmenities.map((amenity) => <FilterCheckbox key={amenity} checked={amenities.includes(amenity)} label={amenity} onChange={(checked) => setAmenities((current) => checked ? [...current, amenity] : current.filter((item) => item !== amenity))} />)}</div></fieldset>
            <label className="block text-xs font-semibold text-ink">Бронирование<SelectField aria-label="Бронирование" className="mt-2 h-10" value={approval} onChange={setApproval} options={[{ value: "", label: "Любое" }, { value: "instant", label: "Без согласования" }, { value: "request", label: "По заявке" }]} /></label>
            {hasFilters && <button className="text-xs font-semibold text-brand" type="button" onClick={reset}>Сбросить фильтры</button>}
          </div>
        </aside>

        <section className="min-w-0 overflow-hidden rounded-[18px] border border-[#E1E5EA] bg-white">
          {view === "list" && <div className="border-b border-[#E7E9EE] px-5 py-4"><h1 className="text-xl font-bold text-ink">Пространства кампуса</h1><p className="mt-1 text-[11px] text-[#667085]">Данные о помещениях и доступности загружаются из системы.</p></div>}
          {!loading && !error && <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E7E9EE] px-5 py-3 text-xs text-[#667085]"><span role="status">Найдено помещений: {visibleSpaces.length} из {spaces?.length ?? 0}</span>{hasFilters && <button className="font-semibold text-brand" type="button" onClick={reset}>Сбросить фильтры</button>}</div>}
          {loading && <LoadingState />}
          {!loading && error && <ErrorState message={error} onRetry={reload} />}
          {!loading && !error && visibleSpaces.length === 0 && (hasFilters ? <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><h2 className="text-base font-bold text-ink">Ничего не найдено</h2><p className="mt-2 text-xs leading-5 text-[#667085]">Измените вместимость или снимите часть фильтров.</p><button className="mt-4 text-sm font-semibold text-brand" onClick={reset} type="button">Сбросить фильтры</button></div> : <EmptyState />)}
          {!loading && !error && visibleSpaces.length > 0 && view === "map" && (
            <div className="divide-y divide-[#E7E9EE]">{mapFloors.map(([key, floorSpaces]) => <FigmaFloorMap key={key} onSelect={chooseSpace} onWorkplace={(space, id) => { chooseSpace(space); setSelectedWorkplaceId(id); }} selectedWorkplaceId={selectedWorkplaceId} selectedId={selectedId} spaces={floorSpaces} />)}</div>
          )}
          {!loading && !error && visibleSpaces.length > 0 && view === "list" && (
            <div className="space-y-3 p-5">
              {visibleSpaces.map((space) => <SpaceItem key={space.id} onSelect={() => chooseSpace(space)} selected={space.id === selectedId} space={space} />)}
            </div>
          )}
        </section>

        <SpaceDetails
          bookingMessage={bookingMessage}
          bookingPending={bookingPending}
          favorite={selected ? favoriteIds.has(selected.id) : false}
          onBook={() => void submitBooking()}
          onFavorite={() => void toggleFavorite()}
          onWorkplace={(id) => { setSelectedWorkplaceId(id); setBookingMessage(""); }}
          selected={selected}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedWorkplaceId={selectedWorkplaceId}
        />
      </main>
    </div>
  );
}

function FilterCheckbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-[#475467]"><input checked={checked} className="mt-0.5 size-4 shrink-0 accent-[#3346C8]" onChange={(event) => onChange(event.target.checked)} type="checkbox" /><span>{label}</span></label>;
}

function SelectFilter({ icon: Icon, label, value, options, placeholder, onChange }: { icon: typeof Building2; label: string; value: string; options: string[]; placeholder: string; onChange: (value: string) => void }) {
  return (
    <label className="min-w-[150px] flex-1 xl:max-w-[200px]">
      <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#667085]">{label}</span>
      <SelectField aria-label={label} icon={<Icon className="size-4 shrink-0 text-[#667085]" />} onChange={onChange} value={value} options={[{ value: "", label: placeholder }, ...options.map((option) => ({ value: option, label: option }))]} />
    </label>
  );
}

type FloorMapStatus = "free" | "partial" | "busy" | "request";

const floorMapStatusAsset: Record<FloorMapStatus, string> = {
  free: "/figma/floor-map/status-free.svg",
  partial: "/figma/floor-map/status-busy.svg",
  busy: "/figma/floor-map/status-partial.svg",
  request: "/figma/floor-map/seat-busy-a.svg",
};

function getFloorMapStatus(space: Space): FloorMapStatus {
  if (space.requires_approval) return "request";
  if (space.workplaces.some((item) => item.is_available) && space.workplaces.some((item) => !item.is_available)) return "partial";
  return space.is_available ? "free" : "busy";
}

function FigmaFloorMap({ spaces, selectedId, selectedWorkplaceId, onSelect, onWorkplace }: { spaces: Space[]; selectedId: string; selectedWorkplaceId: string; onSelect: (space: Space) => void; onWorkplace: (space: Space, id: string) => void }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; panX: number; panY: number; moved: boolean } | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(766);
  useEffect(() => {
    if (!viewport.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, []);
  const scale = width / 766;
  const panX = Math.max(-width * Math.max(0, zoom - 1), Math.min(0, pan.x));
  const panY = Math.max(-650 * scale * Math.max(0, zoom - 1), Math.min(0, pan.y));
  const first = spaces[0];
  const floorSpaces = spaces.filter(
    (space) => space.building_code === first.building_code && space.floor_number === first.floor_number,
  );
  const byCode = (code: string) => floorSpaces.find((space) => space.code === code);
  const a201 = byCode("А-201");
  const a202 = byCode("А-202");
  const lab = byCode("Л-203");
  const coworking = byCode("К-214");
  const a208 = byCode("А-208");
  const meeting = byCode("П-2");
  const availableSeats = floorSpaces.reduce((total, space) => {
    if (space.workplaces.length > 0) return total + space.workplaces.filter((workplace) => workplace.is_available).length;
    return total + (space.is_available ? space.capacity : 0);
  }, 0);

  return (
    <div className="min-w-0 px-3 pb-[18px] pt-[21px] sm:px-[19px]">
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 px-1">
          <div>
            <h2 className="text-[18px] font-bold leading-normal text-[#1C2434]">План {first.floor_number} этажа</h2>
            <p className="mt-1 text-[11px] font-medium text-[#22B8A7]">Корпус {first.building_code} · {availableSeats} свободных мест</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-[6px]">
            <FigmaMapLegend asset={floorMapStatusAsset.free} label="Свободно" />
            <FigmaMapLegend asset={floorMapStatusAsset.partial} label="Частично" />
            <FigmaMapLegend asset={floorMapStatusAsset.busy} label="Занято" />
            <FigmaMapLegend asset={floorMapStatusAsset.request} label="По заявке" />
          </div>
        </div>

        <div
          ref={viewport}
          className="w-full overflow-hidden rounded-[16px] bg-[#F7F8FA]"
          style={{ height: 650 * scale, touchAction: zoom > 1 ? "none" : "pan-y" }}
          onPointerDown={(event) => {
            if (zoom <= 1 || event.button !== 0) return;
            drag.current = { x: event.clientX, y: event.clientY, panX, panY, moved: false };
          }}
          onPointerMove={(event) => {
            const start = drag.current;
            if (!start || event.buttons === 0) return;
            const dx = event.clientX - start.x;
            const dy = event.clientY - start.y;
            if (Math.abs(dx) + Math.abs(dy) > 5) {
              start.moved = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              setPan({ x: start.panX + dx, y: start.panY + dy });
            }
          }}
          onPointerCancel={() => { drag.current = null; }}
          onClickCapture={(event) => {
            if (drag.current?.moved) { event.preventDefault(); event.stopPropagation(); }
            drag.current = null;
          }}
        >
          <div
            className="relative h-[650px] w-[766px]"
            onWheel={(event) => {
              if (!event.ctrlKey) return;
              event.preventDefault();
              setZoom((current) => Math.min(1.25, Math.max(0.85, current + (event.deltaY < 0 ? 0.05 : -0.05))));
            }}
            style={{ transform: `translate(${panX}px, ${panY}px) scale(${scale * zoom})`, transformOrigin: "top left" }}
          >
            {first.floor_number === 1 || first.floor_number === 3 ? (
              <AdditionalFloorLayout floor={first.floor_number} spaces={floorSpaces} selectedId={selectedId} selectedWorkplaceId={selectedWorkplaceId} onSelect={onSelect} onWorkplace={onWorkplace} />
            ) : <>
            <div className="absolute left-[42px] top-[270px] flex h-[84px] w-[682px] items-center justify-center rounded-[12px] border border-[#E4E7EC] bg-white text-[10px] font-bold text-[#667085]">КОРИДОР</div>

            {a201 && (
              <FigmaRoom className="left-[42px] top-[40px] h-[213px] w-[172px]" onSelect={onSelect} selected={selectedId === a201.id} space={a201}>
                <p className="absolute left-[13px] top-[37px] text-[10px] font-medium text-[#667085]">{a201.capacity} мест · проектор</p>
                <ClassroomFurniture available={a201.is_available} teacherDesk />
              </FigmaRoom>
            )}
            {a202 && (
              <FigmaRoom className="left-[228px] top-[40px] h-[213px] w-[156px]" onSelect={onSelect} selected={selectedId === a202.id} space={a202}>
                <p className="absolute left-[13px] top-[37px] text-[10px] font-medium text-[#667085]">{a202.is_available ? "Свободно сейчас" : "Занято"}</p>
                <ClassroomFurniture available={a202.is_available} />
              </FigmaRoom>
            )}
            {lab && (
              <FigmaRoom className="left-[398px] top-[40px] h-[213px] w-[190px]" onSelect={onSelect} selected={selectedId === lab.id} space={lab}>
                <p className="absolute left-[13px] top-[37px] text-[10px] font-medium text-[#667085]">Лаборатория · заявка</p>
                <LabFurniture available={lab.is_available} />
              </FigmaRoom>
            )}

            <div className="absolute left-[602px] top-[40px] flex h-[213px] w-[122px] flex-col items-center rounded-[10px] border border-[#E4E7EC] bg-white text-[#667085]">
              <span className="mt-[18px] text-[22px] font-bold">≋</span>
              <span className="mt-2 text-[11px] font-medium">Лестница</span>
            </div>

            {coworking && (
              <FigmaRoom className="left-[42px] top-[386px] h-[206px] w-[330px]" onSelect={onSelect} selected={selectedId === coworking.id} space={coworking} title={`${coworking.code} · Коворкинг`}>
                <p className="absolute left-[11px] top-[35px] text-[10px] font-medium text-[#667085]">{coworking.workplaces.length} столов · {coworking.workplaces.filter((item) => item.has_computer).length} ПК</p>
                <div className="absolute inset-x-[11px] top-[63px]">
                  <WorkplacePlan space={coworking} selectedId={selectedWorkplaceId} onSelect={(id) => onWorkplace(coworking, id)} />
                </div>
              </FigmaRoom>
            )}

            {a208 && (
              <FigmaRoom className="left-[388px] top-[386px] h-[96px] w-[200px]" onSelect={onSelect} selected={selectedId === a208.id} space={a208}>
                <p className="absolute left-[13px] top-[37px] text-[10px] font-medium text-[#667085]">{a208.is_available ? "Свободно сейчас" : "Занято"}</p>
                <RoundTableFurniture available={a208.is_available} />
              </FigmaRoom>
            )}

            <div className="absolute left-[602px] top-[386px] flex h-[96px] w-[122px] flex-col items-center rounded-[10px] border border-[#E4E7EC] bg-white text-[#667085]">
              <span className="mt-[23px] text-[14px] font-bold">WC</span>
              <span className="mt-[12px] text-[10px] font-medium">Санузел</span>
            </div>

            {meeting && (
              <FigmaRoom className="left-[388px] top-[496px] h-[96px] w-[336px]" onSelect={onSelect} selected={selectedId === meeting.id} space={meeting} title="Переговорная П-2">
                <p className="absolute left-[13px] top-[37px] text-[10px] font-medium text-[#667085]">{meeting.capacity} мест · доска</p>
                <MeetingFurniture available={meeting.is_available} />
              </FigmaRoom>
            )}
            </>}
          </div>
        </div>

        <div className="flex h-[61px] items-end justify-between px-1">
          <p className="pb-[2px] text-[10px] font-medium text-[#667085]">Ctrl + колёсико — масштаб · Перетаскивание — перемещение</p>
          <div className="flex h-[44px] w-[94px] shrink-0 overflow-hidden rounded-[12px] border border-[#E4E7EC] bg-white">
            <button aria-label="Уменьшить масштаб" className="flex flex-1 items-center justify-center text-[18px] font-bold text-[#667085]" onClick={() => setZoom((current) => Math.max(0.85, current - 0.1))} type="button">−</button>
            <span className="my-[7px] w-px bg-[#E4E7EC]" />
            <button aria-label="Увеличить масштаб" className="flex flex-1 items-center justify-center text-[18px] font-bold text-[#3346C8]" onClick={() => setZoom((current) => Math.min(1.25, current + 0.1))} type="button">+</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdditionalFloorLayout({ floor, spaces, selectedId, selectedWorkplaceId, onSelect, onWorkplace }: { floor: number; spaces: Space[]; selectedId: string; selectedWorkplaceId: string; onSelect: (space: Space) => void; onWorkplace: (space: Space, id: string) => void }) {
  const rooms = floor === 1 ? [
    { code: "К-104", position: "left-[38px] top-[38px] h-[212px] w-[330px]" },
    { code: "А-101", position: "left-[428px] top-[38px] h-[212px] w-[300px]" },
    { code: "П-1", position: "left-[38px] top-[390px] h-[212px] w-[330px]" },
    { code: "А-108", position: "left-[428px] top-[390px] h-[212px] w-[300px]" },
  ] : [
    { code: "К-304", position: "left-[24px] top-[38px] h-[212px] w-[330px]" },
    { code: "Л-305", position: "left-[24px] top-[370px] h-[240px] w-[330px]" },
    { code: "А-301", position: "left-[454px] top-[38px] h-[240px] w-[288px]" },
    { code: "А-308", position: "left-[454px] top-[370px] h-[240px] w-[288px]" },
  ];
  return <>
    {floor === 1 ? <>
      <div className="absolute left-[38px] top-[270px] flex h-[100px] w-[690px] items-center justify-center rounded-xl border border-[#E4E7EC] bg-white text-xs font-semibold text-[#667085]">ГЛАВНЫЙ ХОЛЛ · ВХОД</div>
      <div className="absolute left-[376px] top-[38px] flex h-[212px] w-[44px] items-center justify-center rounded-lg bg-[#EEF0FF] text-xs text-[#667085] [writing-mode:vertical-rl]">Лестница ↑</div>
      <div className="absolute left-[376px] top-[390px] flex h-[212px] w-[44px] items-center justify-center rounded-lg bg-white text-xs text-[#667085]">WC</div>
    </> : <>
      <div className="absolute left-[370px] top-[38px] flex h-[572px] w-[68px] items-center justify-center rounded-xl border border-[#E4E7EC] bg-white text-xs font-semibold text-[#667085] [writing-mode:vertical-rl]">КОРИДОР · 3 ЭТАЖ</div>
      <div className="absolute left-[24px] top-[270px] flex h-[80px] w-[330px] items-center justify-center rounded-xl border border-[#E4E7EC] bg-white text-xs text-[#667085]">Лестница · Зона отдыха</div>
      <div className="absolute left-[454px] top-[298px] flex h-[52px] w-[288px] items-center justify-center rounded-xl bg-white text-xs text-[#667085]">WC · Лифт</div>
    </>}
    {rooms.map(({ code, position }) => {
      const space = spaces.find((item) => item.code === code);
      if (!space) return null;
      return <FigmaRoom key={space.id} className={position} space={space} selected={selectedId === space.id} onSelect={onSelect} title={`${space.code} · ${spaceTypeLabel(space.space_type)}`}>
        <p className="absolute left-[13px] top-[37px] text-[10px] text-[#667085]">{space.workplaces.length ? `${space.workplaces.length} компьютерных мест` : `${space.capacity} мест`}{space.requires_approval ? " · По заявке" : ""}</p>
        {space.workplaces.length > 0 ? <div className="absolute inset-x-[11px] top-[63px]"><WorkplacePlan space={space} selectedId={selectedWorkplaceId} onSelect={(id) => onWorkplace(space, id)} /></div> : space.space_type === "laboratory" ? <div className="absolute left-[65px] top-0"><LabFurniture available={space.is_available} /></div> : space.space_type === "meeting_room" ? <div className="absolute -left-[65px] top-[80px]"><MeetingFurniture available={space.is_available} /></div> : <ClassroomFurniture available={space.is_available} teacherDesk />}
      </FigmaRoom>;
    })}
  </>;
}

function FigmaMapLegend({ asset, label }: { asset: string; label: string }) {
  return <span className="inline-flex items-center gap-[6px] whitespace-nowrap text-[9px] font-medium text-[#667085]"><img alt="" height="8" src={asset} width="8" />{label}</span>;
}

function FigmaRoom({ space, selected, onSelect, className, title, children }: { space: Space; selected: boolean; onSelect: (space: Space) => void; className: string; title?: string; children: React.ReactNode }) {
  const status = getFloorMapStatus(space);
  return (
    <div
      className={cn(
        "absolute overflow-hidden rounded-[10px] border text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        status === "free" && "border-[#E4E7EC] bg-[#E8F8F5]",
        status === "busy" && "border-[#E4E7EC] bg-[#E9EDF2]",
        status === "partial" && "border-[#E4E7EC] bg-[#FEF3D8]",
        status === "request" && "border-[#E4E7EC] bg-[#EEF0FF]",
        selected && "border-[3px] border-[#3346C8]",
        className,
      )}

    >
      <button aria-label={space.name} aria-pressed={selected} className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand" onClick={() => onSelect(space)} type="button" />
      <strong className={cn("pointer-events-none absolute top-[13px] text-[13px] font-bold leading-normal text-[#1C2434]", selected ? "left-[11px]" : "left-[13px]")}>{title ?? space.code}</strong>
      <img alt="" className="pointer-events-none absolute right-[13px] top-[13px]" height="8" src={floorMapStatusAsset[status]} width="8" />
      <div className="pointer-events-none">{children}</div>
    </div>
  );
}

function WorkplacePlan({ space, selectedId, onSelect }: { space: Space; selectedId: string; onSelect: (id: string) => void }) {
  const workplaces = [...space.workplaces].sort((a, b) => a.code.localeCompare(b.code, "ru", { numeric: true }));
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: Math.ceil(workplaces.length / 6) }, (_, group) => (
        <div className="relative grid grid-cols-2 gap-x-14 gap-y-2 rounded-xl border border-dashed border-[#D8DEE8] bg-white/60 p-2.5" key={group}>
          <div className="absolute inset-y-2.5 left-1/2 w-7 -translate-x-1/2 rounded-xl border border-[#D8DEE8] bg-white" />
          {workplaces.slice(group * 6, group * 6 + 6).map((workplace) => (
            <button
              aria-label={`${workplace.code}: ${workplace.is_available ? "свободно" : "занято"}`}
              aria-pressed={selectedId === workplace.id && workplace.is_available}
              className={cn("pointer-events-auto relative flex h-7 min-w-0 items-center justify-center rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2", selectedId === workplace.id && workplace.is_available ? "border-brand bg-brand text-white" : workplace.is_available ? "border-[#D8DEE8] bg-white text-[#22B8A7] hover:border-brand" : "cursor-not-allowed border-[#D8DEE8] bg-[#F2F4F7] text-[#98A2B3]")}
              disabled={!workplace.is_available}
              key={workplace.id}
              onClick={() => onSelect(workplace.id)}
              title={workplace.code}
              type="button"
            ><Monitor className="size-4 shrink-0" /></button>
          ))}
        </div>
      ))}
    </div>
  );
}

function getSpaceImages(space: Space): string[] {
  if (space.images.length > 0) return space.images;
  return [space.image_url ?? "/images/spaces/a-101.jpg"];
}

function getSpaceImageUrl(space: Space): string {
  const images = getSpaceImages(space);
  return images[0] || (space.image_url ?? "/images/spaces/a-101.jpg");
}

function SpacePreview({ space, selectedId, onSelect }: { space: Space; selectedId: string; onSelect: (id: string) => void }) {
  const [mode, setMode] = useState<"photo" | "scheme">("photo");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const images = getSpaceImages(space);
  const selectedWorkplace = space.workplaces.find((item) => item.id === selectedId);

  // Сброс индекса фотографии при смене помещения
  useEffect(() => {
    setPhotoIndex(0);
  }, [space.id]);

  // Управление с клавиатуры в полноэкранном режиме
  useEffect(() => {
    if (!fullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowLeft") setPhotoIndex((prev) => (prev - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setPhotoIndex((prev) => (prev + 1) % images.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreen, images.length]);

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % images.length);
  };

  const currentImage = images[photoIndex] || images[0];

  return (
    <div className="relative overflow-hidden bg-[#F5F6FF]">
      {mode === "photo" ? (
        <div
          className="group relative h-48 w-full cursor-zoom-in select-none overflow-hidden bg-[#EEF0FF]"
          onClick={() => setFullscreen(true)}
          title="Нажмите, чтобы открыть фото на весь экран"
        >
          <img
            alt={`Фотография ${photoIndex + 1} из ${images.length}: ${space.name}`}
            className="size-full object-cover"
            src={currentImage}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35" />

          {/* Код помещения и счётчик слайдов */}
          <div className="absolute left-3 top-2.5 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              {space.code}
            </span>
            {images.length > 1 && (
              <span className="rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                {photoIndex + 1} / {images.length}
              </span>
            )}
          </div>

          {/* Переключатель Фото / Схема */}
          <div className="absolute right-2.5 top-2.5 flex rounded-lg bg-black/60 p-0.5 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
            <button
              className={cn("rounded-md px-2.5 py-1 text-[10px] font-semibold transition", "bg-white text-ink shadow-sm")}
              onClick={() => setMode("photo")}
              type="button"
            >
              Фото
            </button>
            <button
              className={cn("rounded-md px-2.5 py-1 text-[10px] font-semibold transition", "text-white/80 hover:text-white")}
              onClick={() => setMode("scheme")}
              type="button"
            >
              Схема
            </button>
          </div>

          {/* Кнопка открытия на весь экран в правом нижнем углу */}
          <button
            aria-label="Открыть фото на весь экран"
            className="absolute bottom-2.5 right-3 flex size-7 items-center justify-center rounded-md bg-black/60 text-white/90 shadow-sm backdrop-blur-sm transition hover:bg-black/80 hover:text-white focus-visible:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreen(true);
            }}
            title="Открыть на весь экран"
            type="button"
          >
            <Maximize2 className="size-3.5" />
          </button>

          {/* Стрелки перелистывания карусели */}
          {images.length > 1 && (
            <>
              <button
                aria-label="Предыдущее фото"
                className="absolute left-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-sm backdrop-blur-sm transition hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={prevPhoto}
                type="button"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                aria-label="Следующее фото"
                className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-sm backdrop-blur-sm transition hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={nextPhoto}
                type="button"
              >
                <ChevronRight className="size-4" />
              </button>
            </>
          )}

          {/* Точечные индикаторы (буллеты) */}
          {images.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {images.map((_, idx) => (
                <button
                  aria-label={`Перейти к фото ${idx + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all focus-visible:outline-none",
                    idx === photoIndex ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                  )}
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoIndex(idx);
                  }}
                  type="button"
                />
              ))}
            </div>
          )}

          {/* Индикатор выбранного ПК */}
          {selectedWorkplace && (
            <div className="absolute bottom-2.5 left-3" onClick={(e) => e.stopPropagation()}>
              <span className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                Выбрано: {selectedWorkplace.code}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold text-[#667085]">Схема помещения · {space.code}</p>
            <div className="flex rounded-lg border border-[#E4E7EC] bg-white p-0.5 shadow-sm">
              <button
                className={cn("rounded-md px-2.5 py-1 text-[10px] font-semibold transition", "text-[#667085] hover:text-ink")}
                onClick={() => setMode("photo")}
                type="button"
              >
                Фото
              </button>
              <button
                className={cn("rounded-md px-2.5 py-1 text-[10px] font-semibold transition", "bg-brand text-white")}
                onClick={() => setMode("scheme")}
                type="button"
              >
                Схема
              </button>
            </div>
          </div>
          {space.workplaces.length > 0 ? (
            <WorkplacePlan space={space} selectedId={selectedId} onSelect={onSelect} />
          ) : (
            <div aria-label={`Схема: ${space.name}`} className="relative mx-auto h-[213px] w-[190px] rounded-xl border border-[#D8DEE8] bg-[#E8F8F5]">
              {space.space_type === "laboratory" ? <LabFurniture available={space.is_available} /> : space.space_type === "meeting_room" || space.capacity <= 6 ? <div className="absolute -left-12 top-12"><RoundTableFurniture available={space.is_available} /></div> : <ClassroomFurniture available={space.is_available} teacherDesk />}
            </div>
          )}
        </div>
      )}

      {/* Полноэкранный модальный просмотр фото (Lightbox) */}
      {fullscreen && typeof document !== "undefined" && createPortal(
        <div
          aria-label="Просмотр фотографии на весь экран"
          aria-modal="true"
          className="fixed inset-0 z-[2000] flex select-none flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setFullscreen(false)}
          role="dialog"
        >
          {/* Верхняя панель: название, код, счётчик и крестик закрытия */}
          <div
            className="absolute inset-x-6 top-4 z-20 flex items-center justify-between text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-sm font-bold sm:text-base">{space.name}</span>
              <span className="rounded-md bg-white/20 px-2.5 py-0.5 text-xs font-semibold">{space.code}</span>
              {images.length > 1 && (
                <span className="text-xs text-white/70">
                  Фото {photoIndex + 1} из {images.length}
                </span>
              )}
            </div>
            <button
              aria-label="Закрыть полноэкранный просмотр"
              className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={() => setFullscreen(false)}
              title="Закрыть (Esc)"
              type="button"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Изображение в центре */}
          <div
            className="relative flex max-h-[82vh] max-w-[92vw] items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              alt={`Фотография ${photoIndex + 1} из ${images.length}: ${space.name}`}
              className="max-h-[80vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
              src={currentImage}
            />
          </div>

          {/* Кнопки перелистывания в полноэкранном режиме */}
          {images.length > 1 && (
            <>
              <button
                aria-label="Предыдущее фото"
                className="absolute left-4 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-8"
                onClick={prevPhoto}
                type="button"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                aria-label="Следующее фото"
                className="absolute right-4 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-8"
                onClick={nextPhoto}
                type="button"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}

          {/* Точки-индикаторы внизу полноэкранного режима */}
          {images.length > 1 && (
            <div
              className="absolute bottom-6 z-20 flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((_, idx) => (
                <button
                  aria-label={`Перейти к фото ${idx + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all focus-visible:outline-none",
                    idx === photoIndex ? "w-7 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                  )}
                  key={idx}
                  onClick={() => setPhotoIndex(idx)}
                  type="button"
                />
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

function ClassroomFurniture({ available, teacherDesk = false }: { available: boolean; teacherDesk?: boolean }) {
  return (
    <span className="absolute inset-x-0 top-[67px] block h-[136px]">
      {teacherDesk ? <span className="absolute left-[17px] top-0 h-[22px] w-[calc(100%-34px)] rounded-[5px] border border-[#D8DEE8] bg-[#EEF0FF]" /> : <span className="absolute left-[23px] top-[2px] h-[10px] w-[calc(100%-46px)] rounded-[3px] border border-[#D8DEE8] bg-white" />}
      {[0, 1, 2].map((row) => [0, 1].map((column) => (
        <span className="absolute h-[20px] w-[44px] rounded-[5px] border border-[#D8DEE8] bg-white" key={`${row}-${column}`} style={{ left: column === 0 ? 19 : "calc(100% - 63px)", top: (teacherDesk ? 36 : 34) + row * 34 }}>
          <img alt="" className="absolute left-[7px] top-[22px]" height="10" src={available ? "/figma/floor-map/seat-busy-b.svg" : "/figma/floor-map/seat-free-b.svg"} width="10" />
          <img alt="" className="absolute left-[25px] top-[22px]" height="10" src={available ? "/figma/floor-map/seat-busy-b.svg" : "/figma/floor-map/seat-free-b.svg"} width="10" />
        </span>
      )))}
    </span>
  );
}

function LabFurniture({ available }: { available: boolean }) {
  return (
    <span className="absolute left-[13px] top-[67px] block h-[126px] w-[162px] rounded-[10px] bg-white/55">
      <span className="absolute left-[18px] top-[14px] h-[96px] w-[45px] rounded-[8px] border border-[#D8DEE8] bg-[#DDE2FF]" />
      <span className="absolute right-[16px] top-[14px] h-[96px] w-[45px] rounded-[8px] border border-[#D8DEE8] bg-[#DDE2FF]" />
      {[10, 44, 78].map((top) => [6, 65, 89, 148].map((left) => <img alt="" className="absolute" height="10" key={`${top}-${left}`} src={available ? "/figma/floor-map/seat-busy-b.svg" : "/figma/floor-map/seat-free-b.svg"} style={{ left, top }} width="10" />))}
      <span className="absolute bottom-[-2px] left-[46px] h-[12px] w-[72px] rounded-[3px] border border-[#D8DEE8] bg-white" />
    </span>
  );
}

function RoundTableFurniture({ available }: { available: boolean }) {
  const seat = available ? "/figma/floor-map/seat-busy-c.svg" : "/figma/floor-map/seat-busy-d.svg";
  return (
    <span className="absolute left-[105px] top-[17px] block h-[72px] w-[72px]">
      <img alt="Круглый стол" className="absolute left-[15px] top-[15px]" height="42" src="/figma/floor-map/seat-free-a.svg" width="42" />
      <img alt="" className="absolute left-0 top-[31px]" height="12" src={seat} width="12" />
      <img alt="" className="absolute right-0 top-[31px]" height="12" src={seat} width="12" />
      <img alt="" className="absolute left-[30px] top-0" height="12" src={seat} width="12" />
      <img alt="" className="absolute bottom-0 left-[30px]" height="12" src={seat} width="12" />
    </span>
  );
}

function MeetingFurniture({ available }: { available: boolean }) {
  const seat = available ? "/figma/floor-map/seat-busy-c.svg" : "/figma/floor-map/seat-busy-d.svg";
  return (
    <span className="absolute left-[145px] top-[9px] block h-[72px] w-[174px] rounded-[10px] border border-dashed border-[#D8DEE8] bg-white/55">
      <span className="absolute left-[52px] top-[16px] h-[36px] w-[66px] rounded-[12px] border border-[#D8DEE8] bg-white" />
      {[[38, 21], [38, 35], [120, 21], [120, 35], [71, 2], [89, 2], [71, 54], [89, 54]].map(([left, top]) => <img alt="" className="absolute" height="12" key={`${left}-${top}`} src={seat} style={{ left, top }} width="12" />)}
    </span>
  );
}

function FloorMap({ spaces, selectedId, onSelect }: { spaces: Space[]; selectedId: string; onSelect: (space: Space) => void }) {
  const first = spaces[0];
  const floorSpaces = spaces.filter(
    (space) => space.building_code === first.building_code && space.floor_number === first.floor_number,
  );
  const fallbackPositions = [
    { x: 12, y: 18 },
    { x: 36, y: 18 },
    { x: 62, y: 18 },
    { x: 12, y: 55 },
    { x: 38, y: 55 },
    { x: 64, y: 55 },
  ];

  return (
    <div className="p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-ink">Корпус {first.building_code} · {first.floor_number} этаж</p>
          <p className="mt-1 text-[10px] text-[#667085]">Нажмите на помещение, чтобы посмотреть детали</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[9px] font-medium text-[#667085]">
          <MapLegend color="bg-[#20B8A6]" label="Свободно" />
          <MapLegend color="bg-[#98A2B3]" label="Занято" />
          <MapLegend color="bg-[#F0A13A]" label="По заявке" />
        </div>
      </div>

      <div className="relative min-h-[520px] overflow-hidden rounded-2xl border border-[#DDE2E8] bg-[#F4F6F8] shadow-inner">
        <div className="absolute inset-4 rounded-xl border-2 border-[#CAD1DA] bg-[#E9EDF1]" />
        <div className="absolute left-[7%] top-[44%] h-[11%] w-[86%] border-y border-[#D5DAE1] bg-white">
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#B0B7C2]">Коридор</span>
        </div>
        <div className="absolute bottom-[45%] left-[4%] h-[11%] w-[3%] border-y border-[#D5DAE1] bg-white" />
        <div className="absolute bottom-[45%] right-[4%] h-[11%] w-[3%] border-y border-[#D5DAE1] bg-white" />

        {floorSpaces.map((space, index) => {
          const fallback = fallbackPositions[index % fallbackPositions.length];
          const x = space.map_x ?? fallback.x;
          const y = space.map_y ?? fallback.y;
          const approval = space.requires_approval;
          const selected = selectedId === space.id;
          return (
            <button
              aria-pressed={selected}
              className={cn(
                "group absolute flex h-[25%] w-[22%] min-w-[112px] flex-col overflow-hidden rounded-xl border-2 p-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:p-3",
                approval
                  ? "border-[#F2C47E] bg-[#FFF8E9]"
                  : space.is_available
                    ? "border-[#67D0C4] bg-[#ECFAF7]"
                    : "border-[#CDD3DB] bg-[#EEF1F4]",
                selected && "border-brand bg-[#EEF0FF] ring-2 ring-brand ring-offset-2",
              )}
              key={space.id}
              onClick={() => onSelect(space)}
              style={{ left: `${x}%`, top: `${y}%` }}
              type="button"
            >
              <span className="flex w-full items-start justify-between gap-1">
                <strong className="truncate text-xs font-bold text-ink sm:text-sm">{space.code}</strong>
                <span className={cn("mt-0.5 size-2 shrink-0 rounded-full", approval ? "bg-[#F0A13A]" : space.is_available ? "bg-[#20B8A6]" : "bg-[#98A2B3]")} />
              </span>
              <span className="mt-0.5 truncate text-[8px] font-medium text-[#667085] sm:text-[9px]">{spaceTypeLabel(space.space_type)}</span>
              {space.workplaces.length > 0 ? (
                <span className="mt-auto grid grid-cols-4 gap-1" aria-label={`${space.workplaces.length} компьютерных мест`}>
                  {space.workplaces.slice(0, 12).map((workplace) => (
                    <span
                      className={cn(
                        "flex h-4 items-center justify-center rounded border bg-white sm:h-5",
                        workplace.is_available ? "border-[#9EDFD7]" : "border-[#CDD3DB] bg-[#E2E6EB]",
                      )}
                      key={workplace.id}
                      title={workplace.code}
                    >
                      <Monitor className={cn("size-2.5", workplace.is_available ? "text-[#169C8D]" : "text-[#98A2B3]")} />
                    </span>
                  ))}
                </span>
              ) : (
                <span className="mt-auto text-[8px] font-medium text-[#667085] sm:text-[9px]">{space.capacity} мест</span>
              )}
              <span className="absolute -bottom-1 left-1/2 h-2 w-7 -translate-x-1/2 rounded-t border-x border-t border-[#C8CED7] bg-white" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MapLegend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><span className={cn("size-2 rounded-full", color)} />{label}</span>;
}

function SpaceItem({ space, selected, onSelect }: { space: Space; selected: boolean; onSelect: () => void }) {
  const [thumbFailed, setThumbFailed] = useState(false);
  const imageUrl = getSpaceImageUrl(space);
  return (
    <button className={cn("flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left transition hover:border-brand/40", selected ? "border-brand ring-1 ring-brand/20" : "border-[#E1E5EA]")} onClick={onSelect} type="button">
      {!thumbFailed && imageUrl ? (
        <img alt="" className="size-11 shrink-0 rounded-xl object-cover" onError={() => setThumbFailed(true)} src={imageUrl} />
      ) : (
        <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold", space.is_available ? "bg-[#E8F8F5] text-[#168C7F]" : "bg-[#F2F4F7] text-[#667085]")}>{initialsFromCode(space.code)}</span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3"><strong className="text-sm text-ink">{space.name}</strong><span className={cn("flex items-center gap-1 text-[9px] font-semibold", space.is_available ? "text-accent" : "text-[#98A2B3]")}><span className="size-1.5 rounded-full bg-current" />{space.is_available ? "Свободно" : "Занято"}</span></span>
        <span className="mt-1 block text-[11px] text-[#667085]">{spaceTypeLabel(space.space_type)} · {space.capacity} мест</span>
        <span className="mt-3 flex items-center gap-1 text-[10px] text-[#98A2B3]"><MapPin className="size-3" />Корпус {space.building_code} · {space.floor_number} этаж</span>
      </span>
    </button>
  );
}

function SpaceDetails({ selected, selectedWorkplaceId, onWorkplace, selectedDate, selectedTime, favorite, onFavorite, onBook, bookingPending, bookingMessage }: { selected: Space | null; selectedWorkplaceId: string; onWorkplace: (id: string) => void; selectedDate: string; selectedTime: string; favorite: boolean; onFavorite: () => void; onBook: () => void; bookingPending: boolean; bookingMessage: string }) {
  if (!selected) return <aside className="rounded-[18px] border border-[#E1E5EA] bg-white p-6 text-center text-sm text-[#667085]">Выберите пространство, чтобы посмотреть детали.</aside>;
  const selectedWorkplace = selected.workplaces.find((item) => item.id === selectedWorkplaceId);
  return (
    <aside className="min-w-0 self-start overflow-hidden rounded-[18px] border border-[#E1E5EA] bg-white xl:sticky xl:top-4">
      <SpacePreview key={selected.id} space={selected} selectedId={selectedWorkplaceId} onSelect={onWorkplace} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-brand">{spaceTypeLabel(selected.space_type)}</p><h2 className="mt-1 text-xl font-bold text-ink">{selected.name}</h2></div>{selected.rating_average !== null && <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7E8] px-2.5 py-1 text-xs font-bold text-[#B57700]"><Star className="size-3 fill-current" />{selected.rating_average}</span>}</div>
        <p className="mt-1 text-[11px] text-[#667085]">Корпус {selected.building_code} · {selected.floor_number} этаж</p>
        {selected.description && <p className="mt-3 text-xs leading-5 text-[#667085]">{selected.description}</p>}
        <div className="mt-4 flex flex-wrap gap-2"><Feature icon={Users} label={`${selected.capacity} мест`} />{selected.amenities.slice(0, 3).map((amenity) => <Feature icon={amenity.toLowerCase().includes("проектор") ? Projector : Monitor} key={amenity} label={amenity} />)}</div>

        {selected.workplaces.length > 0 && <><div className="my-5 h-px bg-[#E7E9EE]" /><h3 className="text-xs font-bold text-ink">Выберите рабочее место</h3><div className="mt-3 grid grid-cols-3 gap-2">{selected.workplaces.map((workplace) => <button aria-pressed={selectedWorkplaceId === workplace.id && workplace.is_available} className={cn("h-9 rounded-lg border text-[10px] font-semibold", !workplace.is_available && "cursor-not-allowed bg-[#F2F4F7] text-[#98A2B3]", workplace.is_available && selectedWorkplaceId !== workplace.id && "border-[#DFE3E9] text-[#475467] hover:border-brand", selectedWorkplaceId === workplace.id && workplace.is_available && "border-brand bg-brand text-white")} disabled={!workplace.is_available} key={workplace.id} onClick={() => onWorkplace(workplace.id)} type="button">{workplace.code}</button>)}</div></>}

        <div className="mt-5 rounded-xl bg-[#F5F6FF] p-3"><p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#667085]">Ваша бронь</p><p className="mt-1.5 text-xs font-bold text-ink">{selectedDate} · {selectedTime}</p><p className="mt-1 text-[10px] text-[#667085]">{selectedWorkplace ? `${selectedWorkplace.code} · ` : ""}{selected.name} · 30 минут</p></div>
        {bookingMessage && <p className={cn("mt-3 rounded-xl px-3 py-2.5 text-xs font-medium", bookingMessage.includes("подтверждено") || bookingMessage.includes("отправлена") ? "bg-[#E8F8F5] text-[#168C7F]" : "bg-[#FFF1F3] text-[#C83E52]")} role="status">{bookingMessage}</p>}
        <Button className="mt-4 h-[42px] min-w-0" disabled={!selected.is_available || bookingPending || (selected.workplaces.length > 0 && !selectedWorkplace?.is_available)} fullWidth onClick={onBook}>{bookingPending ? "Проверяем доступ…" : selected.requires_approval ? "Отправить заявку" : "Забронировать"}</Button>
        <Button aria-pressed={favorite} className="mt-2 h-[42px] min-w-0 gap-2" fullWidth onClick={onFavorite} variant="secondary"><Heart className={cn("size-4", favorite && "fill-brand")} />{favorite ? "В избранном" : "Добавить в избранное"}</Button>
      </div>
    </aside>
  );
}

function Feature({ icon: Icon, label }: { icon: typeof Users; label: string }) {
  return <span className="flex items-center gap-1.5 rounded-lg bg-[#F2F4F7] px-2.5 py-1.5 text-[9px] font-semibold text-[#475467]"><Icon className="size-3.5" />{label}</span>;
}

function LoadingState() {
  return <div className="grid gap-3 p-5 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <div className="h-36 animate-pulse rounded-2xl bg-[#F2F4F7]" key={index} />)}</div>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><p className="text-sm font-semibold text-ink">Не удалось загрузить пространства</p><p className="mt-2 max-w-sm text-xs text-[#667085]">{message}</p><button className="mt-5 rounded-xl border border-[#E4E7EC] px-4 py-2 text-xs font-semibold text-brand" onClick={onRetry} type="button">Повторить</button></div>;
}

function EmptyState() {
  return <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-[#EEF0FF] text-brand"><Building2 className="size-5" /></span><h2 className="mt-4 text-base font-bold text-ink">Пространств пока нет</h2><p className="mt-2 max-w-sm text-xs leading-5 text-[#667085]">Администратор ещё не добавил помещения или ни одно из них не соответствует выбранным фильтрам.</p></div>;
}
