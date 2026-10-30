"use client";

import { ArrowRight, Heart, MapPin, Monitor, Projector, Star, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useApiData } from "@/hooks/use-api-data";
import { apiRequest } from "@/lib/api";
import { spaceTypeLabel } from "@/lib/format";
import type { Space } from "@/lib/types";

export default function FavoritesPage() {
  const { data, loading, error, reload } = useApiData<Space[]>("/favorites", true);
  const [removing, setRemoving] = useState("");
  const availableCount = (data ?? []).filter((space) => space.is_available).length;

  const remove = async (spaceId: string) => {
    setRemoving(spaceId);
    try {
      await apiRequest<void>(`/favorites/${spaceId}`, { method: "DELETE" });
      reload();
    } finally {
      setRemoving("");
    }
  };

  return (
    <main className="mx-auto min-w-0 w-full max-w-[1340px] flex-1 px-5 py-8 sm:px-8 lg:px-11 lg:py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Личный кабинет</p><h1 className="mt-2 text-[30px] font-bold tracking-[-0.025em] text-ink">Избранное</h1><p className="mt-1 text-sm text-[#667085]">Сохранённые вами пространства.</p></div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E4E7EC] bg-white px-4 py-2.5 text-xs font-semibold text-[#667085]"><Heart className="size-4 fill-[#D94A5C] text-[#D94A5C]" />{data?.length ?? 0} сохранено</div>
      </div>

      {!loading && !error && (data?.length ?? 0) > 0 && <section className="mt-8 rounded-[22px] bg-brand px-6 py-7 text-white sm:px-8"><div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#C8CFFF]">Доступно прямо сейчас</p><h2 className="mt-2 text-2xl font-bold">{availableCount} из {data?.length} свободно</h2><p className="mt-2 text-sm text-[#E2E6FF]">Актуальная доступность рассчитана по данным бронирований.</p></div><Link className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-xl bg-white px-5 text-sm font-semibold text-brand" href="/spaces">Посмотреть на карте<ArrowRight className="size-4" /></Link></div></section>}

      {loading && <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div className="h-[420px] animate-pulse rounded-[22px] bg-[#EDEFF3]" key={index} />)}</div>}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && data?.length === 0 && <EmptyFavorites />}
      {!loading && !error && data && data.length > 0 && (
        <section className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Избранные пространства">
          {data.map((space) => <FavoriteCard key={space.id} onRemove={() => void remove(space.id)} removing={removing === space.id} space={space} />)}
        </section>
      )}

      {!loading && !error && (data?.length ?? 0) > 0 && <section className="mt-8 flex flex-col items-start justify-between gap-5 rounded-[20px] border border-dashed border-[#C9D0F3] bg-[#F5F6FF] p-6 sm:flex-row sm:items-center"><div><h2 className="text-base font-bold text-ink">Добавьте ещё одно любимое место</h2><p className="mt-1 text-xs leading-5 text-[#667085]">Нажмите на сердечко в карточке пространства — и оно появится здесь.</p></div><Link className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-brand shadow-sm" href="/spaces">Открыть каталог<ArrowRight className="size-3.5" /></Link></section>}
    </main>
  );
}

function FavoriteCard({ space, removing, onRemove }: { space: Space; removing: boolean; onRemove: () => void }) {
  return (
    <article className="group overflow-hidden rounded-[22px] border border-[#E4E7EC] bg-white transition hover:-translate-y-1 hover:border-brand/20 hover:shadow-[0_18px_45px_rgba(39,55,168,0.09)]">
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-[#E8EBFF] to-[#F7F8FF]"><div className="absolute inset-0 opacity-70 [background-image:linear-gradient(#FFFFFF_1px,transparent_1px),linear-gradient(90deg,#FFFFFF_1px,transparent_1px)] [background-size:28px_28px]" /><span className="relative flex size-16 items-center justify-center rounded-2xl bg-white text-xl font-bold text-brand shadow-sm">{space.code.charAt(0)}</span><span className={space.is_available ? "absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-[#168C7F] shadow-sm" : "absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-[#667085] shadow-sm"}><span className="mr-1.5 inline-block size-1.5 rounded-full bg-current" />{space.is_available ? "Свободно" : "Занято"}</span><button aria-label={`Удалить ${space.name} из избранного`} className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white text-[#D94A5C] shadow-sm disabled:opacity-50" disabled={removing} onClick={onRemove} type="button"><Heart className="size-4 fill-current" /></button></div>
      <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand">{spaceTypeLabel(space.space_type)}</p><h2 className="mt-1 text-lg font-bold text-ink">{space.name}</h2></div>{space.rating_average !== null && <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7E8] px-2.5 py-1 text-xs font-bold text-[#B57700]"><Star className="size-3 fill-current" />{space.rating_average}</span>}</div><p className="mt-2 flex items-center gap-1.5 text-xs text-[#667085]"><MapPin className="size-3.5" />Корпус {space.building_code} · {space.floor_number} этаж</p><div className="mt-5 grid grid-cols-3 gap-2"><Feature icon={Users} label={`${space.capacity} мест`} /><Feature icon={space.amenities.some((item) => item.toLowerCase().includes("проектор")) ? Projector : Monitor} label={space.amenities[0] ?? "Без оснащения"} /><Feature icon={Monitor} label={space.workplaces.length > 0 ? `${space.workplaces.length} мест` : "Помещение"} /></div><Link className={space.is_available ? "mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white hover:bg-brand-hover" : "mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#E4E7EC] text-sm font-semibold text-brand hover:bg-[#F5F6FF]"} href={`/spaces?room=${space.id}`}>{space.is_available ? "Забронировать" : "Посмотреть расписание"}</Link></div>
    </article>
  );
}

function Feature({ icon: Icon, label }: { icon: typeof Users; label: string }) { return <span className="flex min-w-0 flex-col items-center rounded-xl bg-canvas px-2 py-3 text-center"><Icon className="size-4 text-brand" /><span className="mt-2 max-w-full truncate text-[9px] font-semibold text-[#667085]">{label}</span></span>; }
function EmptyFavorites() { return <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-[22px] border border-dashed border-[#C9D0F3] bg-white p-8 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-[#FFF1F3] text-[#D94A5C]"><Heart className="size-5" /></span><h2 className="mt-4 text-base font-bold text-ink">В избранном пока пусто</h2><p className="mt-2 max-w-sm text-xs leading-5 text-[#667085]">Сохраняйте подходящие пространства, чтобы быстро находить их позже.</p><Link className="mt-5 inline-flex h-10 items-center rounded-xl bg-brand px-4 text-xs font-semibold text-white" href="/spaces">Открыть каталог</Link></div>; }
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) { return <div className="mt-8 rounded-[22px] border border-[#E4E7EC] bg-white p-8 text-center"><p className="text-sm font-semibold text-ink">Не удалось загрузить избранное</p><p className="mt-2 text-xs text-[#667085]">{message}</p><button className="mt-4 text-xs font-semibold text-brand" onClick={onRetry} type="button">Повторить</button></div>; }
