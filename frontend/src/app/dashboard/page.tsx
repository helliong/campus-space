"use client";

import { CalendarDays, Clock3, Heart, MapPin, MessageSquareText, Star } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { useApiData } from "@/hooks/use-api-data";
import { formatDate, formatTimeRange, initials, spaceTypeLabel } from "@/lib/format";
import type { Booking, ReviewCollection, Space, User } from "@/lib/types";

export default function DashboardPage() {
  const user = useApiData<User>("/auth/me", true);
  const bookings = useApiData<Booking[]>("/bookings/me", true);
  const favorites = useApiData<Space[]>("/favorites", true);
  const reviews = useApiData<ReviewCollection>("/reviews/me", true);
  const now = Date.now();
  const upcoming = useMemo(() => (bookings.data ?? []).filter((booking) => ["confirmed", "pending"].includes(booking.status) && new Date(booking.ends_at).getTime() >= now).sort((a, b) => a.starts_at.localeCompare(b.starts_at)), [bookings.data, now]);
  const nearest = upcoming[0];
  const loading = user.loading || bookings.loading || favorites.loading || reviews.loading;

  return (
    <main className="mx-auto min-w-0 w-full max-w-[1340px] flex-1 px-5 py-10 sm:px-8 lg:px-11">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><h1 className="text-[30px] font-bold text-ink">{user.data ? `Добрый день, ${user.data.full_name.split(/\s+/)[0]}!` : "Личный кабинет"}</h1><p className="mt-1 text-sm text-[#667085]">Здесь собраны ваши бронирования, избранное и отзывы.</p></div><Link className="inline-flex h-[42px] min-w-[202px] items-center justify-center self-start rounded-[11px] bg-brand px-4 text-xs font-semibold text-white hover:bg-brand-hover" href="/spaces">Найти пространство</Link></div>

      {loading && <div className="mt-7 grid gap-5 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div className="h-24 animate-pulse rounded-2xl bg-[#EDEFF3]" key={index} />)}</div>}
      {!loading && <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"><StatCard color="bg-[#EEF0FF] text-brand" label="Активные брони" note={nearest ? `Ближайшая — ${formatDate(nearest.starts_at)}` : "Нет предстоящих"} value={String(upcoming.length)} /><StatCard color="bg-[#FEF3D8] text-[#A66A00]" label="Ожидают одобрения" note="Текущие заявки" value={String(upcoming.filter((booking) => booking.status === "pending").length)} /><StatCard color="bg-[#E8F8F5] text-accent" label="Избранные места" note={`${(favorites.data ?? []).filter((space) => space.is_available).length} доступно сейчас`} value={String(favorites.data?.length ?? 0)} /></section>}

      <section className="mt-10"><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-bold text-ink">Ближайшая бронь</h2><Link className="text-xs font-semibold text-brand" href="/dashboard/bookings">Все бронирования →</Link></div>{nearest ? <UpcomingBooking booking={nearest} /> : <EmptyBooking />}</section>

      <section className="mt-12 grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
        <div className="rounded-[18px] border border-[#E4E7EC] bg-white p-[23px]"><div className="flex items-center justify-between gap-4"><h2 className="text-[17px] font-bold text-ink">Следующие бронирования</h2><span className="text-xs text-[#98A2B3]">{Math.max(0, upcoming.length - 1)}</span></div>{upcoming.length <= 1 ? <p className="mt-8 text-center text-sm text-[#667085]">Других предстоящих бронирований нет.</p> : <div className="mt-5 divide-y divide-[#E4E7EC]">{upcoming.slice(1, 4).map((booking) => <article className="flex flex-wrap items-center gap-4 py-3 first:pt-0 last:pb-0" key={booking.id}><span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF0FF] text-sm font-bold text-brand">{booking.space_code.charAt(0)}</span><div className="min-w-[180px] flex-1"><h3 className="text-[13px] font-semibold text-ink">{booking.space_name}{booking.workplace_code ? ` · ${booking.workplace_code}` : ""}</h3><p className="mt-1 text-[11px] text-[#667085]">{formatDate(booking.starts_at)} · {formatTimeRange(booking.starts_at, booking.ends_at)}</p></div><span className={booking.status === "confirmed" ? "rounded-full bg-[#E8F8F5] px-3 py-1.5 text-[10px] font-semibold text-accent" : "rounded-full bg-[#FEF3D8] px-3 py-1.5 text-[10px] font-semibold text-[#A66A00]"}>{booking.status === "confirmed" ? "Подтверждено" : "На рассмотрении"}</span></article>)}</div>}</div>
        <aside className="rounded-[18px] border border-[#E4E7EC] bg-white p-[23px]"><span className="flex size-12 items-center justify-center rounded-[14px] bg-[#EEF0FF] text-brand"><MessageSquareText className="size-5" /></span><h2 className="mt-5 text-[17px] font-bold text-ink">Ваши отзывы</h2><p className="mt-3 text-[13px] leading-[1.45] text-[#667085]">Опубликовано: {reviews.data?.metrics.total ?? 0}. Завершённые посещения без оценки появятся в разделе отзывов.</p><Link className="mt-6 inline-flex h-[42px] min-w-[200px] items-center rounded-[11px] border border-[#E4E7EC] bg-white px-4 text-xs font-semibold text-brand hover:bg-[#F5F6FF]" href="/dashboard/reviews">Перейти к отзывам</Link></aside>
      </section>
    </main>
  );
}

function UpcomingBooking({ booking }: { booking: Booking }) {
  return <article className="overflow-hidden rounded-[20px] border border-[#D8DDF8] bg-white"><div className="grid lg:grid-cols-[1fr_1.2fr]"><div className="bg-brand p-7 text-white sm:p-8"><div className="flex items-center justify-between"><span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold">{booking.status === "confirmed" ? "Подтверждено" : "На рассмотрении"}</span><span className="flex size-10 items-center justify-center rounded-full bg-white/10 text-xs font-bold">{initials(booking.space_code)}</span></div><p className="mt-7 text-xs font-medium text-[#C8CFFF]">{spaceTypeLabel(booking.space_type)}</p><h3 className="mt-2 text-2xl font-bold">{booking.space_name}{booking.workplace_code ? ` · ${booking.workplace_code}` : ""}</h3><p className="mt-3 text-sm text-[#E2E6FF]">Корпус {booking.building_code} · {booking.floor_number} этаж</p></div><div className="grid gap-5 p-7 sm:grid-cols-3 sm:p-8"><Fact icon={CalendarDays} label="Дата" value={formatDate(booking.starts_at, true)} /><Fact icon={Clock3} label="Время" value={formatTimeRange(booking.starts_at, booking.ends_at)} /><Fact icon={MapPin} label="Место" value={booking.workplace_code ?? booking.space_code} /></div></div></article>;
}
function Fact({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) { return <div><span className="flex size-9 items-center justify-center rounded-xl bg-[#EEF0FF] text-brand"><Icon className="size-4" /></span><p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#98A2B3]">{label}</p><p className="mt-1 text-xs font-bold text-ink">{value}</p></div>; }
function EmptyBooking() { return <div className="flex min-h-48 flex-col items-center justify-center rounded-[20px] border border-dashed border-[#C9D0F3] bg-white p-8 text-center"><CalendarDays className="size-6 text-brand" /><h3 className="mt-3 text-sm font-bold text-ink">Предстоящих бронирований нет</h3><Link className="mt-4 text-xs font-semibold text-brand" href="/spaces">Найти пространство →</Link></div>; }
function StatCard({ value, label, note, color }: { value: string; label: string; note: string; color: string }) { return <article className="flex min-h-24 items-center rounded-2xl border border-[#E4E7EC] bg-white p-4"><span className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-[17px] font-bold ${color}`}>{value}</span><div className="ml-4"><p className="text-xs font-medium text-[#667085]">{label}</p><p className="mt-1 text-xs font-semibold text-ink">{note}</p></div></article>; }
