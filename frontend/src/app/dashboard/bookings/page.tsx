"use client";

import { CalendarDays, CheckCircle2, Clock3, MapPin, Plus, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useApiData } from "@/hooks/use-api-data";
import { apiRequest } from "@/lib/api";
import { formatDate, formatTimeRange, formatWeekday, spaceTypeLabel } from "@/lib/format";
import type { Booking } from "@/lib/types";

const statusLabels: Record<Booking["status"], string> = {
  confirmed: "Подтверждено",
  pending: "На рассмотрении",
  rejected: "Отклонено",
  cancelled: "Отменено",
};

export default function BookingsPage() {
  const { data, loading, error, reload } = useApiData<Booking[]>("/bookings/me", true);
  const [cancelling, setCancelling] = useState("");
  const now = Date.now();
  const upcoming = useMemo(() => (data ?? []).filter((booking) => new Date(booking.ends_at).getTime() >= now && ["confirmed", "pending"].includes(booking.status)).sort((a, b) => a.starts_at.localeCompare(b.starts_at)), [data, now]);
  const history = useMemo(() => (data ?? []).filter((booking) => !upcoming.some((item) => item.id === booking.id)), [data, upcoming]);
  const bookedHours = upcoming.reduce((sum, booking) => sum + (new Date(booking.ends_at).getTime() - new Date(booking.starts_at).getTime()) / 3_600_000, 0);
  const completedCount = (data ?? []).filter((booking) => booking.status === "confirmed" && new Date(booking.ends_at).getTime() < now).length;

  const cancel = async (id: string) => {
    setCancelling(id);
    try {
      await apiRequest<Booking>(`/bookings/${id}/cancel`, { method: "PATCH" });
      reload();
    } finally {
      setCancelling("");
    }
  };

  return (
    <main className="mx-auto min-w-0 w-full max-w-[1340px] flex-1 px-5 py-8 sm:px-8 lg:px-11 lg:py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Личный кабинет</p><h1 className="mt-2 text-[30px] font-bold tracking-[-0.025em] text-ink">Мои бронирования</h1><p className="mt-1 text-sm text-[#667085]">Управляйте предстоящими визитами и смотрите историю.</p></div>
        <Link className="inline-flex h-11 items-center gap-2 self-start rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover" href="/spaces"><Plus className="size-4" />Новая бронь</Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={CalendarDays} label="Предстоящих посещения" note={upcoming[0] ? `Ближайшее ${formatDate(upcoming[0].starts_at)}` : "Нет запланированных"} value={String(upcoming.length)} />
        <SummaryCard icon={Clock3} label="Часов забронировано" note="В предстоящих бронях" value={bookedHours.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} />
        <SummaryCard icon={CheckCircle2} label="Посещений" note="За всё время" value={String(completedCount)} />
      </section>

      <div className="mt-8 flex gap-2 overflow-x-auto border-b border-[#E4E7EC]"><span className="shrink-0 border-b-2 border-brand px-4 pb-3 text-sm font-semibold text-brand">Предстоящие посещения <span className="ml-1 rounded-full bg-[#EEF0FF] px-2 py-0.5 text-[10px]">{upcoming.length}</span></span></div>

      {loading && <LoadingRows />}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && upcoming.length === 0 && <EmptyBookings />}
      {!loading && !error && upcoming.length > 0 && (
        <section className="mt-6 space-y-4" aria-label="Предстоящие бронирования">
          {upcoming.map((booking, index) => <BookingCard booking={booking} cancelling={cancelling === booking.id} index={index} key={booking.id} onCancel={() => void cancel(booking.id)} />)}
        </section>
      )}

      {!loading && !error && history.length > 0 && (
        <section className="mt-10 rounded-[20px] border border-[#E4E7EC] bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4"><div><h2 className="text-base font-bold text-ink">Недавняя история</h2><p className="mt-1 text-xs text-[#667085]">Завершённые и отменённые бронирования</p></div><RotateCcw className="size-5 text-[#98A2B3]" /></div>
          <div className="mt-5 divide-y divide-[#EAECF0]">
            {history.map((booking) => <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center" key={booking.id}><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-ink">{booking.space_name}{booking.workplace_code ? ` · ${booking.workplace_code}` : ""}</p><p className="mt-1 text-xs text-[#667085]">{formatDate(booking.starts_at, true)} · {formatTimeRange(booking.starts_at, booking.ends_at)}</p></div><span className="w-fit rounded-full bg-[#F2F4F7] px-3 py-1.5 text-[10px] font-semibold text-[#667085]">{statusLabels[booking.status]}</span>{booking.can_review && <Link className="text-xs font-semibold text-brand" href="/dashboard/reviews#new-review">Оставить отзыв →</Link>}</div>)}
          </div>
        </section>
      )}
    </main>
  );
}

function BookingCard({ booking, index, cancelling, onCancel }: { booking: Booking; index: number; cancelling: boolean; onCancel: () => void }) {
  const confirmed = booking.status === "confirmed";
  return (
    <article className="overflow-hidden rounded-[20px] border border-[#E4E7EC] bg-white transition hover:border-brand/20 hover:shadow-[0_12px_34px_rgba(39,55,168,0.07)]">
      <div className="flex flex-col md:flex-row">
        <div className="flex items-center gap-4 border-b border-[#EAECF0] p-5 md:w-[42%] md:border-b-0 md:border-r md:p-6">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#EEF0FF] text-lg font-bold text-brand">{booking.space_code.charAt(0)}</span>
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-[15px] font-bold text-ink">{booking.space_name}{booking.workplace_code ? ` · ${booking.workplace_code}` : ""}</h2>{index === 0 && <span className="rounded-full bg-[#EEF0FF] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-brand">Ближайшее</span>}</div><p className="mt-1 text-xs text-[#667085]">{spaceTypeLabel(booking.space_type)}</p><p className="mt-3 text-[10px] font-medium text-[#98A2B3]">№ {booking.id.slice(0, 8).toUpperCase()}</p></div>
        </div>
        <div className="grid flex-1 gap-4 p-5 sm:grid-cols-2 md:p-6"><div className="flex gap-3"><CalendarDays className="mt-0.5 size-4 shrink-0 text-brand" /><div><p className="text-xs font-bold text-ink">{formatWeekday(booking.starts_at)}, {formatDate(booking.starts_at)}</p><p className="mt-1 text-[11px] text-[#667085]">{formatTimeRange(booking.starts_at, booking.ends_at)}</p></div></div><div className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-brand" /><div><p className="text-xs font-bold text-ink">Корпус {booking.building_code} · {booking.floor_number} этаж</p><p className="mt-1 text-[11px] text-[#667085]">{booking.space_code}</p></div></div></div>
        <div className="flex items-center justify-between gap-4 border-t border-[#EAECF0] px-5 py-4 md:w-[205px] md:flex-col md:items-end md:justify-center md:border-l md:border-t-0 md:px-6"><span className={confirmed ? "inline-flex items-center gap-1.5 rounded-full bg-[#E8F8F5] px-3 py-1.5 text-[10px] font-semibold text-[#168C7F]" : "inline-flex items-center gap-1.5 rounded-full bg-[#FFF3DC] px-3 py-1.5 text-[10px] font-semibold text-[#A66A00]"}><span className="size-1.5 rounded-full bg-current" />{statusLabels[booking.status]}</span><button aria-label="Отменить бронирование" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E4E7EC] px-3 text-[10px] font-semibold text-[#667085] hover:bg-[#FFF1F3] hover:text-[#C83E52] disabled:opacity-50" disabled={cancelling} onClick={onCancel} type="button"><X className="size-3.5" />{cancelling ? "Отмена…" : "Отменить"}</button></div>
      </div>
    </article>
  );
}

function SummaryCard({ icon: Icon, value, label, note }: { icon: typeof CalendarDays; value: string; label: string; note: string }) { return <article className="flex items-center rounded-2xl border border-[#E4E7EC] bg-white p-4 sm:p-5"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF0FF] text-brand"><Icon className="size-5" /></span><div className="ml-4"><div className="flex items-baseline gap-2"><strong className="text-xl font-bold text-ink">{value}</strong><span className="text-xs font-semibold text-[#475467]">{label}</span></div><p className="mt-1 text-[10px] text-[#98A2B3]">{note}</p></div></article>; }
function LoadingRows() { return <div className="mt-6 space-y-4">{Array.from({ length: 3 }).map((_, index) => <div className="h-32 animate-pulse rounded-[20px] bg-[#EDEFF3]" key={index} />)}</div>; }
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) { return <div className="mt-6 rounded-[20px] border border-[#E4E7EC] bg-white p-8 text-center"><p className="text-sm font-semibold text-ink">Не удалось загрузить бронирования</p><p className="mt-2 text-xs text-[#667085]">{message}</p><button className="mt-4 text-xs font-semibold text-brand" onClick={onRetry} type="button">Повторить</button></div>; }
function EmptyBookings() { return <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-[20px] border border-dashed border-[#C9D0F3] bg-white p-8 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-[#EEF0FF] text-brand"><CalendarDays className="size-5" /></span><h2 className="mt-4 text-base font-bold text-ink">Предстоящих бронирований нет</h2><p className="mt-2 max-w-sm text-xs leading-5 text-[#667085]">Выберите свободное пространство и удобное время.</p><Link className="mt-5 inline-flex h-10 items-center rounded-xl bg-brand px-4 text-xs font-semibold text-white" href="/spaces">Найти пространство</Link></div>; }
