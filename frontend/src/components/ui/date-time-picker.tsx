"use client";

import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTH_FORMATTER = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" });
const DATE_FORMATTER = new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", year: "numeric" });

function dateFromValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dateToValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function sameDay(first: Date, second: Date) {
  return dateToValue(first) === dateToValue(second);
}

function usePopover(open: boolean, close: () => void) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open]);

  return rootRef;
}

export function DatePicker({ value, min, onChange }: { value: string; min: string; onChange: (value: string) => void }) {
  const selectedDate = useMemo(() => dateFromValue(value), [value]);
  const minimumDate = useMemo(() => dateFromValue(min), [min]);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const rootRef = usePopover(open, () => setOpen(false));

  useEffect(() => {
    if (open) setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [open, selectedDate]);

  const days = useMemo(() => {
    const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const leadingDays = (monthStart.getDay() + 6) % 7;
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - leadingDays);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  const choose = (date: Date) => {
    if (date < minimumDate) return;
    onChange(dateToValue(date));
    setOpen(false);
  };

  return (
    <div className="relative min-w-[170px] flex-1 xl:max-w-[220px]" ref={rootRef}>
      <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.1em] text-[#667085]">Дата</span>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "group flex h-12 w-full items-center gap-3 rounded-xl border bg-white px-3.5 text-left shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition",
          open ? "border-brand ring-4 ring-brand/10" : "border-[#DDE2EA] hover:border-[#B8C0D0] hover:shadow-sm",
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg transition", open ? "bg-brand text-white" : "bg-[#F2F4FF] text-brand group-hover:bg-[#E9ECFF]")}>
          <CalendarDays className="size-4" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-ink">{DATE_FORMATTER.format(selectedDate)}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-[#98A2B3] transition-transform", open && "rotate-180 text-brand")} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+10px)] z-[100] w-[min(320px,calc(100vw-40px))] rounded-2xl border border-[#E1E5EA] bg-white p-4 shadow-[0_20px_50px_-12px_rgba(28,36,52,0.28)]" role="dialog" aria-label="Выбор даты">
          <div className="flex items-center justify-between">
            <button aria-label="Предыдущий месяц" className="flex size-9 items-center justify-center rounded-xl text-[#667085] transition hover:bg-[#F2F4FF] hover:text-brand" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} type="button">
              <ChevronLeft className="size-[18px]" />
            </button>
            <p className="text-sm font-extrabold capitalize text-ink">{MONTH_FORMATTER.format(visibleMonth)}</p>
            <button aria-label="Следующий месяц" className="flex size-9 items-center justify-center rounded-xl text-[#667085] transition hover:bg-[#F2F4FF] hover:text-brand" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} type="button">
              <ChevronRight className="size-[18px]" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1" aria-hidden>
            {WEEKDAYS.map((weekday, index) => <span className={cn("py-1 text-center text-[10px] font-bold uppercase tracking-[0.08em]", index > 4 ? "text-[#F97066]" : "text-[#98A2B3]")} key={weekday}>{weekday}</span>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((date) => {
              const selected = sameDay(date, selectedDate);
              const today = sameDay(date, new Date());
              const outside = date.getMonth() !== visibleMonth.getMonth();
              const disabled = date < minimumDate;
              const weekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <button
                  aria-label={DATE_FORMATTER.format(date)}
                  aria-pressed={selected}
                  className={cn(
                    "relative flex size-9 items-center justify-center rounded-[10px] text-xs font-semibold transition",
                    !disabled && !selected && "hover:bg-[#EEF0FF] hover:text-brand",
                    selected && "bg-brand text-white shadow-[0_5px_12px_rgba(51,70,200,0.3)]",
                    !selected && outside && "text-[#C7CCD4]",
                    !selected && !outside && weekend && "text-[#F04438]",
                    !selected && !outside && !weekend && "text-[#344054]",
                    disabled && "cursor-not-allowed opacity-35",
                  )}
                  disabled={disabled}
                  key={dateToValue(date)}
                  onClick={() => choose(date)}
                  type="button"
                >
                  {date.getDate()}
                  {today && !selected && <span className="absolute bottom-1 size-1 rounded-full bg-brand" />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#EEF0F3] pt-3">
            <p className="text-[10px] font-medium text-[#98A2B3]">Доступно с сегодняшнего дня</p>
            <button className="rounded-lg bg-[#F2F4FF] px-3 py-2 text-[11px] font-bold text-brand transition hover:bg-[#E8EBFF]" onClick={() => choose(new Date())} type="button">Сегодня</button>
          </div>
        </div>
      )}
    </div>
  );
}

const TIME_SLOTS = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2);
  const minutes = index % 2 ? "30" : "00";
  return `${String(hours).padStart(2, "0")}:${minutes}`;
});

export function TimePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = usePopover(open, () => setOpen(false));
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) requestAnimationFrame(() => selectedRef.current?.scrollIntoView({ block: "center" }));
  }, [open]);

  return (
    <div className="relative min-w-[150px] flex-1 xl:max-w-[190px]" ref={rootRef}>
      <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.1em] text-[#667085]">Начало</span>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "group flex h-12 w-full items-center gap-3 rounded-xl border bg-white px-3.5 text-left shadow-[0_1px_2px_rgba(16,24,40,0.03)] transition",
          open ? "border-brand ring-4 ring-brand/10" : "border-[#DDE2EA] hover:border-[#B8C0D0] hover:shadow-sm",
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg transition", open ? "bg-brand text-white" : "bg-[#F2F4FF] text-brand group-hover:bg-[#E9ECFF]")}>
          <Clock3 className="size-4" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1 text-[13px] font-extrabold tabular-nums text-ink">{value}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-[#98A2B3] transition-transform", open && "rotate-180 text-brand")} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[min(300px,calc(100vw-40px))] overflow-hidden rounded-2xl border border-[#E1E5EA] bg-white shadow-[0_20px_50px_-12px_rgba(28,36,52,0.28)]" role="dialog" aria-label="Выбор времени">
          <div className="border-b border-[#EEF0F3] px-4 py-3.5">
            <p className="text-sm font-extrabold text-ink">Выберите время</p>
            <p className="mt-0.5 text-[10px] font-medium text-[#98A2B3]">Интервал бронирования — 30 минут</p>
          </div>
          <div className="max-h-[268px] overflow-y-auto p-3">
            <div className="grid grid-cols-4 gap-1.5">
              {TIME_SLOTS.map((time) => {
                const selected = time === value;
                return (
                  <button
                    aria-pressed={selected}
                    className={cn(
                      "flex h-10 items-center justify-center gap-1 rounded-[10px] text-[12px] font-bold tabular-nums transition",
                      selected ? "bg-brand text-white shadow-[0_5px_12px_rgba(51,70,200,0.28)]" : "bg-[#F7F8FA] text-[#475467] hover:bg-[#EEF0FF] hover:text-brand",
                    )}
                    key={time}
                    onClick={() => { onChange(time); setOpen(false); }}
                    ref={selected ? selectedRef : undefined}
                    type="button"
                  >
                    {time}
                    {selected && <Check className="size-3" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-[#EEF0F3] bg-[#FAFBFC] px-4 py-3">
            <span className="text-[10px] font-semibold text-[#98A2B3]">Выбрано</span>
            <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-extrabold tabular-nums text-brand shadow-sm">{value}</span>
          </div>
        </div>
      )}
    </div>
  );
}
