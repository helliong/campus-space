"use client";

import {
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Heart,
  List,
  Map as MapIcon,
  Minus,
  Monitor,
  Plus,
  Projector,
  RotateCcw,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button, Logo, TimeSlot } from "@/components/ui";
import { cn } from "@/lib/cn";

type RoomStatus = "free" | "partial" | "busy" | "pending";
type FeatureType = "users" | "monitor" | "projector";

type Room = {
  id: string;
  title: string;
  kind: string;
  meta: string;
  seats: number;
  features: { label: string; type: FeatureType }[];
  status: RoomStatus;
  statusLabel: string;
};

const rooms: Room[] = [
  {
    id: "A-201",
    title: "А-201",
    kind: "Аудитория",
    meta: "12 мест · Проектор",
    seats: 12,
    features: [
      { label: "12 мест", type: "users" },
      { label: "Проектор", type: "projector" },
      { label: "Маркерная доска", type: "monitor" },
    ],
    status: "free",
    statusLabel: "Свободно",
  },
  {
    id: "A-202",
    title: "А-202",
    kind: "Аудитория",
    meta: "12 мест · Доска",
    seats: 12,
    features: [
      { label: "12 мест", type: "users" },
      { label: "Маркерная доска", type: "projector" },
    ],
    status: "busy",
    statusLabel: "Занято до 15:30",
  },
  {
    id: "Л-203",
    title: "Л-203",
    kind: "Лаборатория",
    meta: "20 мест · ПК",
    seats: 20,
    features: [
      { label: "20 мест", type: "users" },
      { label: "ПК места", type: "monitor" },
      { label: "Маркерная доска", type: "projector" },
    ],
    status: "pending",
    statusLabel: "По заявке",
  },
  {
    id: "К-214",
    title: "К-214",
    kind: "Коворкинг",
    meta: "12 мест · 12 ПК",
    seats: 12,
    features: [
      { label: "12 мест", type: "users" },
      { label: "12 ПК", type: "monitor" },
      { label: "Wi-Fi 6", type: "projector" },
    ],
    status: "free",
    statusLabel: "Свободно",
  },
  {
    id: "А-208",
    title: "А-208",
    kind: "Аудитория",
    meta: "4 места · Круглый стол",
    seats: 4,
    features: [
      { label: "4 места", type: "users" },
      { label: "Круглый стол", type: "projector" },
    ],
    status: "partial",
    statusLabel: "Свободно с 16:00",
  },
  {
    id: "П-2",
    title: "Переговорная П-2",
    kind: "Переговорная",
    meta: "6 мест · Экран",
    seats: 6,
    features: [
      { label: "6 мест", type: "users" },
      { label: "ТВ-экран", type: "monitor" },
      { label: "Конференц-связь", type: "projector" },
    ],
    status: "free",
    statusLabel: "Свободно",
  },
];

const floors = [
  { floor: 4, free: 7 },
  { floor: 3, free: 5 },
  { floor: 2, free: 8 },
  { floor: 1, free: 3 },
];

const statusStyles: Record<RoomStatus, string> = {
  free: "border-[#22B8A7] bg-[#F2FCFA]",
  partial: "border-[#E8A317] bg-[#FFF9EB]",
  busy: "border-[#CBD2DC] bg-[#F1F3F5]",
  pending: "border-[#8792EC] bg-[#F2F3FF]",
};

const statusDots: Record<RoomStatus, string> = {
  free: "/icons/status-free.svg",
  partial: "/icons/map/status-partial.svg",
  busy: "/icons/status-busy.svg",
  pending: "/icons/status-pending.svg",
};

export function SpaceMapWorkspace() {
  const [floor, setFloor] = useState(2);
  const [view, setView] = useState<"map" | "list">("map");
  const [selectedRoom, setSelectedRoom] = useState("К-214");
  const [selectedSlot, setSelectedSlot] = useState("14:30");
  const [onlyFree, setOnlyFree] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [booked, setBooked] = useState(false);
  const [selectedPc, setSelectedPc] = useState("ПК-12");

  const selected = rooms.find((room) => room.id === selectedRoom) ?? rooms[3];
  const visibleRooms = onlyFree ? rooms.filter((room) => room.status === "free") : rooms;

  const reset = () => {
    setFloor(2);
    setView("map");
    setSelectedRoom("К-214");
    setSelectedSlot("14:30");
    setOnlyFree(false);
    setZoom(100);
    setBooked(false);
    setSelectedPc("ПК-12");
  };

  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <AccountHeader />
      <SearchBar onReset={reset} setView={setView} view={view} />

      <main className="mx-auto grid w-full max-w-[1600px] flex-1 items-start gap-5 p-4 xl:grid-cols-[232px_minmax(620px,1fr)_314px] xl:p-6">
        <FiltersPanel floor={floor} onlyFree={onlyFree} setFloor={setFloor} setOnlyFree={setOnlyFree} />

        <section className="min-w-0 self-start overflow-hidden rounded-[18px] border border-[#E1E5EA] bg-white">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E7E9EE] px-5 py-4">
            <div>
              <h1 className="text-xl font-bold text-ink">План {floor} этажа</h1>
              <p className="mt-1 text-[11px] text-[#667085]">Нажмите на помещение или рабочее место, чтобы посмотреть детали</p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
              {(["free", "partial", "busy", "pending"] as RoomStatus[]).map((status) => (
                <span className="flex items-center gap-1.5 text-[10px] text-[#667085]" key={status}>
                  <Image alt="" height={9} src={statusDots[status]} width={9} />
                  {{ free: "Свободно", partial: "Частично", busy: "Занято", pending: "По заявке" }[status]}
                </span>
              ))}
            </div>
          </div>

          {view === "map" ? (
            <FloorPlan
              floor={floor}
              onSelect={setSelectedRoom}
              selectedRoom={selectedRoom}
              selectedPc={selectedPc}
              setSelectedPc={(pc) => { setSelectedPc(pc); setBooked(false); }}
              setZoom={setZoom}
              zoom={zoom}
            />
          ) : (
            <RoomList onSelect={(id) => { setSelectedRoom(id); setView("map"); }} rooms={visibleRooms} selectedRoom={selectedRoom} />
          )}
        </section>

        <RoomDetails
          booked={booked}
          favorite={favorite}
          onBook={() => setBooked(true)}
          onPcSelect={(pc) => { setSelectedPc(pc); setBooked(false); }}
          room={selected}
          selectedPc={selectedPc}
          selectedSlot={selectedSlot}
          setFavorite={setFavorite}
          setSelectedSlot={(slot) => { setSelectedSlot(slot); setBooked(false); }}
        />
      </main>
    </div>
  );
}

function AccountHeader() {
  return (
    <header className="border-b border-[#E4E7EC] bg-white">
      <div className="mx-auto flex min-h-20 w-full max-w-[1600px] items-center gap-8 px-5 sm:px-8 lg:px-16">
        <Logo className="shrink-0" />
        <nav aria-label="Основная навигация" className="hidden items-center gap-10 md:flex">
          <Link className="text-sm font-medium text-[#667085] hover:text-ink" href="/">Главная</Link>
          <Link className="text-sm font-semibold text-brand" href="/spaces">Пространства</Link>
          <Link className="text-sm font-medium text-[#667085] hover:text-ink" href="/dashboard">Мои бронирования</Link>
        </nav>
        <Link className="ml-auto flex items-center gap-3" href="/dashboard">
          <span className="relative size-10 shrink-0">
            <Image alt="" height={40} src="/icons/dashboard-avatar.svg" width={40} />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-brand">АИ</span>
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-semibold text-ink">Анна Иванова</span>
            <span className="mt-0.5 block text-[10px] text-[#667085]">Студент</span>
          </span>
        </Link>
      </div>
    </header>
  );
}

function SearchBar({ view, setView, onReset }: { view: "map" | "list"; setView: (view: "map" | "list") => void; onReset: () => void }) {
  const fields = [
    { label: "Корпус", value: "Корпус А", icon: Building2 },
    { label: "Дата", value: "24 октября", icon: CalendarDays },
    { label: "Начало", value: "14:00", icon: Clock3 },
    { label: "Длительность", value: "2 часа", icon: Clock3 },
  ];

  return (
    <section className="border-b border-[#E4E7EC] bg-white">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-end gap-3 px-5 py-3 sm:px-8 lg:px-16">
        {fields.map(({ label, value, icon: Icon }) => (
          <label className="min-w-[140px] flex-1 xl:max-w-[190px]" key={label}>
            <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#667085]">{label}</span>
            <span className="flex h-11 items-center gap-2 rounded-[10px] border border-[#DFE3E9] bg-white px-3 text-xs font-semibold text-ink">
              <Icon aria-hidden className="size-4 text-[#667085]" />
              {value}
              <ChevronDown aria-hidden className="ml-auto size-3.5 text-[#98A2B3]" />
            </span>
          </label>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-[10px] bg-[#F0F2F5] p-1">
            <button aria-pressed={view === "map"} className={cn("flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold", view === "map" ? "bg-white text-brand shadow-sm" : "text-[#667085]")} onClick={() => setView("map")} type="button"><MapIcon className="size-4" />Карта</button>
            <button aria-pressed={view === "list"} className={cn("flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold", view === "list" ? "bg-white text-brand shadow-sm" : "text-[#667085]")} onClick={() => setView("list")} type="button"><List className="size-4" />Список</button>
          </div>
          <button aria-label="Сбросить фильтры" className="flex size-11 items-center justify-center rounded-[10px] border border-[#DFE3E9] text-[#667085] hover:text-brand" onClick={onReset} type="button"><RotateCcw className="size-4" /></button>
        </div>
      </div>
    </section>
  );
}

function FiltersPanel({ floor, setFloor, onlyFree, setOnlyFree }: { floor: number; setFloor: (floor: number) => void; onlyFree: boolean; setOnlyFree: (value: boolean) => void }) {
  return (
    <aside className="rounded-[18px] border border-[#E1E5EA] bg-white p-4 xl:rounded-none xl:border-y-0 xl:border-l-0 xl:border-r">
      <h2 className="text-sm font-bold text-ink">Этажи</h2>
      <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-1">
        {floors.map((item) => (
          <button className={cn("flex h-11 items-center rounded-[10px] px-3 text-left text-xs font-semibold", floor === item.floor ? "bg-brand text-white" : "text-[#475467] hover:bg-[#F5F6FF]")} key={item.floor} onClick={() => setFloor(item.floor)} type="button">
            <span className="flex size-6 items-center justify-center rounded-md bg-white/15">{item.floor}</span>
            <span className="ml-3">{item.floor} этаж</span>
            <span className={cn("ml-auto text-[9px]", floor === item.floor ? "text-white/75" : "text-[#98A2B3]")}>{item.free} свободно</span>
          </button>
        ))}
      </div>

      <div className="my-5 h-px bg-[#E7E9EE]" />
      <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-ink">Фильтры</h2><button className="text-[10px] font-semibold text-brand" onClick={() => setOnlyFree(false)} type="button">Сбросить</button></div>
      <FilterSelect label="Тип пространства" value="Все типы" />
      <FilterSelect label="Вместимость" value="Любая" />
      <FilterSelect label="Оснащение" value="Любое" />
      <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#475467]">
        <input checked={onlyFree} className="peer sr-only" onChange={(event) => setOnlyFree(event.target.checked)} type="checkbox" />
        <span className="flex size-[18px] items-center justify-center rounded border border-[#C9CFD8] bg-white peer-checked:border-brand peer-checked:bg-brand"><Check className="size-3 text-white" /></span>
        Только свободные
      </label>
    </aside>
  );
}

function FilterSelect({ label, value }: { label: string; value: string }) {
  return (
    <label className="mt-4 block">
      <span className="mb-1.5 block text-[10px] font-semibold text-[#667085]">{label}</span>
      <span className="flex h-10 items-center rounded-[9px] border border-[#DFE3E9] px-3 text-[11px] font-medium text-[#475467]">{value}<ChevronDown className="ml-auto size-3.5 text-[#98A2B3]" /></span>
    </label>
  );
}

function FloorPlan({ floor, selectedRoom, selectedPc, onSelect, setSelectedPc, zoom, setZoom }: { floor: number; selectedRoom: string; selectedPc: string; onSelect: (id: string) => void; setSelectedPc: (pc: string) => void; zoom: number; setZoom: (zoom: number) => void }) {
  return (
    <div className="relative overflow-auto bg-[#F3F5F7] p-5">
      <div className="mx-auto min-w-[700px] origin-top transition-transform" style={{ transform: `scale(${zoom / 100})`, width: `${10000 / zoom}%` }}>
        <div className="grid grid-cols-[1.2fr_1fr_1.25fr_.7fr] gap-2">
          <RoomBlock room={rooms[0]} selected={selectedRoom === "A-201"} onSelect={onSelect}><ClassroomLayout mode="free" /></RoomBlock>
          <RoomBlock room={rooms[1]} selected={selectedRoom === "A-202"} onSelect={onSelect}><ClassroomLayout mode="busy" /></RoomBlock>
          <RoomBlock room={rooms[2]} selected={selectedRoom === "Л-203"} onSelect={onSelect}><LaboratoryLayout /></RoomBlock>
          <div className="flex min-h-[232px] flex-col items-center justify-center rounded-lg border-2 border-[#CCD2DA] bg-white text-center text-[#667085]"><span className="text-xl">↕</span><span className="mt-2 text-[11px] font-semibold">Лестница</span></div>
        </div>

        <div className="my-3 flex h-[66px] items-center justify-center rounded-lg border-2 border-dashed border-[#D7DCE3] bg-[#E9EDF1] text-[10px] font-semibold uppercase tracking-[0.18em] text-[#98A2B3]">Коридор · {floor} этаж</div>

        <div className="grid grid-cols-[1.5fr_1fr_.82fr] gap-2">
          <RoomBlock room={rooms[3]} selected={selectedRoom === "К-214"} onSelect={onSelect}>
            <WorkstationMap onRoomSelect={() => onSelect("К-214")} onSelect={setSelectedPc} selectedPc={selectedPc} />
          </RoomBlock>
          <RoomBlock room={rooms[4]} selected={selectedRoom === "А-208"} onSelect={onSelect}>
            <RoundTableLayout />
          </RoomBlock>
          <div className="grid gap-2">
            <div className="flex min-h-[72px] items-center justify-center rounded-lg border-2 border-[#CCD2DA] bg-white text-xs font-bold text-[#667085]">WC</div>
            <RoomBlock compact room={rooms[5]} selected={selectedRoom === "П-2"} onSelect={onSelect}>
              <MeetingRoomLayout />
            </RoomBlock>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 ml-auto mt-3 flex w-fit overflow-hidden rounded-[10px] border border-[#DDE1E7] bg-white shadow-sm">
        <button aria-label="Уменьшить масштаб" className="flex size-10 items-center justify-center text-[#667085] hover:text-brand" onClick={() => setZoom(Math.max(80, zoom - 10))} type="button"><Minus className="size-4" /></button>
        <span className="flex w-12 items-center justify-center border-x border-[#E7E9EE] text-[10px] font-semibold text-[#667085]">{zoom}%</span>
        <button aria-label="Увеличить масштаб" className="flex size-10 items-center justify-center text-[#667085] hover:text-brand" onClick={() => setZoom(Math.min(120, zoom + 10))} type="button"><Plus className="size-4" /></button>
      </div>
    </div>
  );
}

function RoomBlock({ room, selected, onSelect, children, compact = false }: { room: Room; selected: boolean; onSelect: (id: string) => void; children: React.ReactNode; compact?: boolean }) {
  return (
    <div className={cn("relative min-h-[232px] overflow-hidden rounded-lg border-2 p-3 text-left transition-shadow hover:shadow-md", compact && "min-h-[150px]", statusStyles[room.status], selected && "ring-2 ring-brand ring-offset-2")} onClick={() => room.status !== "busy" && onSelect(room.id)}>
      <div className="flex items-start justify-between gap-2">
        <div><p className="text-xs font-bold text-ink">{room.title}</p><p className="mt-0.5 text-[9px] text-[#667085]">{room.kind}</p></div>
        <span className="flex shrink-0 items-center gap-1 text-[9px] font-semibold text-[#667085]"><Image alt="" height={8} src={statusDots[room.status]} width={8} />{room.statusLabel}</span>
      </div>
      {children}
      <p className="absolute bottom-2.5 left-3 text-[9px] font-medium text-[#667085]">{room.meta}</p>
    </div>
  );
}

function ClassroomLayout({ mode }: { mode: "free" | "busy" }) {
  return (
    <div className="mx-auto mt-2 w-full max-w-[196px]">
      <div className="mx-auto h-2 w-[80%] rounded-md border border-[#D5DBE3] bg-white" />
      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 px-1">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index}>
            <div className="h-[22px] rounded-md border border-[#D5DBE3] bg-white" />
            <div className="mt-0.5 flex justify-center gap-2.5">
              <span
                className={cn(
                  "size-3 rounded-full",
                  mode === "busy" && index !== 1 ? "bg-[#D5DAE1]" : "bg-[#22B8A7]",
                )}
              />
              <span
                className={cn(
                  "size-3 rounded-full",
                  mode === "busy" && index !== 0 ? "bg-[#D5DAE1]" : "bg-[#22B8A7]",
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LaboratoryLayout() {
  const table1Left = [true, false, false, true, true];
  const table1Right = [true, false, true, false, true];
  const table2Left = [true, false, true, false, true];
  const table2Right = [true, false, true, false, true];

  return (
    <div className="mx-auto mt-3 w-full max-w-[210px]">
      <div className="mx-auto h-2 w-[80%] rounded-md border border-[#D5DBE3] bg-white" />
      <div className="mt-2.5 flex items-center justify-center gap-3.5">
        <TableGroup leftSeats={table1Left} rightSeats={table1Right} />
        <TableGroup leftSeats={table2Left} rightSeats={table2Right} />
      </div>
    </div>
  );
}

function TableGroup({
  leftSeats,
  rightSeats,
}: {
  leftSeats: boolean[];
  rightSeats: boolean[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex h-[108px] flex-col justify-between">
        {leftSeats.map((isFree, idx) => (
          <span
            className={cn(
              "size-3 shrink-0 rounded-full",
              isFree ? "bg-[#22B8A7]" : "bg-[#D5DAE1]",
            )}
            key={`l-${idx}`}
          />
        ))}
      </div>

      <div className="h-[118px] w-[52px] rounded-2xl border border-[#C9D0F3] bg-[#DDE2FF]" />

      <div className="flex h-[108px] flex-col justify-between">
        {rightSeats.map((isFree, idx) => (
          <span
            className={cn(
              "size-3 shrink-0 rounded-full",
              isFree ? "bg-[#22B8A7]" : "bg-[#D5DAE1]",
            )}
            key={`r-${idx}`}
          />
        ))}
      </div>
    </div>
  );
}

function RoundTableLayout() {
  return (
    <div className="relative mx-auto mt-4 h-[120px] w-[130px]">
      <Image alt="Круглый стол" className="absolute left-[35px] top-[25px]" height={70} src="/icons/map/round-table.svg" width={60} />
      <MapSeat className="left-0 top-[49px]" src="/icons/map/seat-free.svg" />
      <MapSeat className="right-0 top-[49px]" src="/icons/map/seat-busy-round.svg" />
      <MapSeat className="left-[54px] top-0" src="/icons/map/seat-free-alt.svg" />
      <MapSeat className="bottom-0 left-[54px]" src="/icons/map/seat-busy-alt.svg" />
    </div>
  );
}

function MeetingRoomLayout() {
  return (
    <div className="mx-auto mt-3 flex h-16 w-28 items-center justify-center rounded-[14px] border-2 border-[#CCD2DA] bg-white">
      <div className="h-11 w-16 rounded-lg bg-[#E4E8ED]" />
    </div>
  );
}

const workstationSeats = [
  { id: "ПК-1", group: 0, x: 12, y: 16, busy: true }, { id: "ПК-2", group: 0, x: 104, y: 16, busy: false },
  { id: "ПК-3", group: 0, x: 12, y: 48, busy: false }, { id: "ПК-4", group: 0, x: 104, y: 48, busy: false },
  { id: "ПК-5", group: 0, x: 12, y: 80, busy: false }, { id: "ПК-6", group: 0, x: 104, y: 80, busy: false },
  { id: "ПК-7", group: 1, x: 12, y: 16, busy: true }, { id: "ПК-8", group: 1, x: 104, y: 16, busy: false },
  { id: "ПК-9", group: 1, x: 12, y: 48, busy: false }, { id: "ПК-10", group: 1, x: 104, y: 48, busy: false },
  { id: "ПК-11", group: 1, x: 12, y: 80, busy: false }, { id: "ПК-12", group: 1, x: 104, y: 80, busy: false },
];

function WorkstationMap({ selectedPc, onSelect, onRoomSelect }: { selectedPc: string; onSelect: (pc: string) => void; onRoomSelect: () => void }) {
  return (
    <div className="mt-3 flex items-center justify-center gap-2 overflow-hidden" onClick={(event) => event.stopPropagation()}>
      {[0, 1].map((group) => (
        <div className="relative h-[124px] w-[140px] shrink-0" key={group}>
          <Image alt={`Группа рабочих мест ${group + 1}`} className="absolute inset-0" height={124} src={group === 0 ? "/icons/map/desk-group-left.svg" : "/icons/map/desk-group-right.svg"} width={140} />
          {workstationSeats.filter((seat) => seat.group === group).map((seat) => (
            <button
              aria-label={`${seat.id}${seat.busy ? ", занято" : selectedPc === seat.id ? ", выбрано" : ", свободно"}`}
              aria-pressed={selectedPc === seat.id}
              className={cn(
                "absolute flex h-6 w-7 items-center justify-center rounded-md border transition",
                seat.busy && "cursor-not-allowed border-[#D8DEE8] bg-white",
                !seat.busy && selectedPc !== seat.id && "border-[#D8DEE8] bg-white hover:border-brand hover:ring-2 hover:ring-brand/20",
                selectedPc === seat.id && "border-brand bg-brand",
              )}
              disabled={seat.busy}
              key={seat.id}
              onClick={() => { onSelect(seat.id); onRoomSelect(); }}
              style={{ left: seat.x, top: seat.y }}
              title={seat.busy ? `${seat.id} занято` : `Выбрать ${seat.id}`}
              type="button"
            >
              <span className={cn("size-2.5 rounded-full", seat.busy ? "bg-[#D5DAE1]" : selectedPc === seat.id ? "bg-white" : "bg-[#22B8A7]")} />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function MapSeat({ className, src }: { className: string; src: string }) {
  return <Image alt="" className={cn("absolute", className)} height={22} src={src} width={22} />;
}

function RoomList({ rooms: list, selectedRoom, onSelect }: { rooms: Room[]; selectedRoom: string; onSelect: (id: string) => void }) {
  return (
    <div className="grid gap-3 p-5 sm:grid-cols-2">
      {list.map((room) => (
        <button className={cn("rounded-xl border bg-white p-4 text-left hover:border-brand", selectedRoom === room.id ? "border-brand ring-1 ring-brand" : "border-[#E1E5EA]")} key={room.id} onClick={() => onSelect(room.id)} type="button">
          <div className="flex justify-between gap-3"><h3 className="text-sm font-bold text-ink">{room.title}</h3><span className="flex items-center gap-1 text-[10px] text-[#667085]"><Image alt="" height={8} src={statusDots[room.status]} width={8} />{room.statusLabel}</span></div>
          <p className="mt-2 text-xs text-[#667085]">{room.kind} · {room.meta}</p>
        </button>
      ))}
    </div>
  );
}

function RoomPreview({
  room,
  selectedPc,
  onPcSelect,
}: {
  room: Room;
  selectedPc: string;
  onPcSelect: (pc: string) => void;
}) {
  switch (room.id) {
    case "К-214":
      return (
        <div className="origin-center scale-[0.80]">
          <WorkstationMap onRoomSelect={() => undefined} onSelect={onPcSelect} selectedPc={selectedPc} />
        </div>
      );
    case "Л-203":
      return (
        <div className="-mt-1 origin-center scale-[0.76]">
          <LaboratoryLayout />
        </div>
      );
    case "A-201":
      return (
        <div className="origin-center scale-[0.82]">
          <ClassroomLayout mode="free" />
        </div>
      );
    case "A-202":
      return (
        <div className="origin-center scale-[0.82]">
          <ClassroomLayout mode="busy" />
        </div>
      );
    case "А-208":
      return (
        <div className="origin-center scale-[0.88]">
          <RoundTableLayout />
        </div>
      );
    case "П-2":
      return (
        <div className="origin-center scale-95">
          <MeetingRoomLayout />
        </div>
      );
    default:
      return null;
  }
}

function RoomDetails({ room, selectedPc, onPcSelect, selectedSlot, setSelectedSlot, favorite, setFavorite, booked, onBook }: { room: Room; selectedPc: string; onPcSelect: (pc: string) => void; selectedSlot: string; setSelectedSlot: (slot: string) => void; favorite: boolean; setFavorite: (value: boolean) => void; booked: boolean; onBook: () => void }) {
  const slots = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
  return (
    <aside className="self-start overflow-hidden rounded-[18px] border border-[#E1E5EA] bg-white xl:sticky xl:top-4">
      <div className="relative flex h-[168px] flex-col overflow-hidden bg-[linear-gradient(135deg,#E9ECF1,#F8F9FA)] p-3.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold text-accent shadow-sm">
            <Image alt="" height={8} src={statusDots[room.status]} width={8} />
            {room.statusLabel}
          </span>
          <span className="text-[10px] font-medium text-[#667085]">План помещения</span>
        </div>
        <div className="flex flex-1 items-center justify-center overflow-hidden">
          <RoomPreview onPcSelect={onPcSelect} room={room} selectedPc={selectedPc} />
        </div>
      </div>
      <div className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-brand">{room.kind}</p>
        <h2 className="mt-1 text-xl font-bold text-ink">{room.title}</h2>
        <p className="mt-1 text-[11px] text-[#667085]">Корпус А · 2 этаж</p>
        <div className="mt-3 flex items-center gap-1.5 text-[11px]"><Star className="size-3.5 fill-[#F4B740] text-[#F4B740]" /><strong>4.8</strong><button className="text-brand" type="button">24 отзыва</button></div>

        <div className="mt-4 flex flex-wrap gap-2">
          {room.features.map((feat) => {
            const Icon = feat.type === "users" ? Users : feat.type === "monitor" ? Monitor : Projector;
            return <Feature icon={Icon} key={feat.label} label={feat.label} />;
          })}
        </div>

        <div className="my-5 h-px bg-[#E7E9EE]" />
        <h3 className="text-xs font-bold text-ink">Доступное время</h3>
        <p className="mt-1 text-[10px] text-[#667085]">Сегодня, 24 октября</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {slots.map((slot) => <TimeSlot className="h-9 min-w-0 px-1 text-[10px]" key={slot} onClick={() => setSelectedSlot(slot)} state={selectedSlot === slot ? "selected" : "available"}>{slot}</TimeSlot>)}
        </div>

        <div className="mt-5 rounded-xl bg-[#F5F6FF] p-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#667085]">Ваша бронь</p>
          <p className="mt-1.5 text-xs font-bold text-ink">24 октября · {selectedSlot}–{endTime(selectedSlot)}</p>
          <p className="mt-1 text-[10px] text-[#667085]">{room.id === "К-214" ? `${selectedPc} · Коворкинг ${room.title}` : `${room.kind} ${room.title}`} · 30 минут</p>
        </div>

        <Button className="mt-4 h-[42px] min-w-0" disabled={room.status === "busy"} fullWidth onClick={onBook}>{booked ? "Бронь подтверждена" : "Забронировать"}</Button>
        <Button aria-pressed={favorite} className="mt-2 h-[42px] min-w-0 gap-2" fullWidth onClick={() => setFavorite(!favorite)} variant="secondary"><Heart className={cn("size-4", favorite && "fill-brand")} />{favorite ? "В избранном" : "Добавить в избранное"}</Button>
      </div>
    </aside>
  );
}

function Feature({ icon: Icon, label }: { icon: typeof Users; label: string }) {
  return <span className="flex items-center gap-1.5 rounded-lg bg-[#F2F4F7] px-2.5 py-1.5 text-[9px] font-semibold text-[#475467]"><Icon className="size-3.5" />{label}</span>;
}

function endTime(slot: string) {
  const [hours, minutes] = slot.split(":").map(Number);
  const total = hours * 60 + minutes + 30;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
