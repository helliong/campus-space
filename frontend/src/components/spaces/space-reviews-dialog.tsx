"use client";

import { CheckCircle2, MessageSquareText, Star, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { useApiData } from "@/hooks/use-api-data";
import { formatDate, formatRole, initials } from "@/lib/format";
import type { Review, ReviewCollection, Space } from "@/lib/types";

function Stars({ score }: { score: number }) {
  return (
    <span aria-label={`${score} из 5 звёзд`} className="inline-flex gap-0.5 text-[#F2B84B]">
      {[1, 2, 3, 4, 5].map((value) => <Star aria-hidden className="size-3.5" fill={value <= score ? "currentColor" : "none"} key={value} strokeWidth={1.8} />)}
    </span>
  );
}

export function SpaceReviewsDialog({ space, onClose }: { space: Space; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const { data, loading, error, reload } = useApiData<ReviewCollection>(`/reviews?space_id=${space.id}&limit=100`);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;
  const metrics = data?.metrics;
  const total = metrics?.total ?? space.review_count;

  return createPortal(
    <div className="review-modal-backdrop fixed inset-0 z-[2100] flex items-end justify-center bg-[#101828]/55 backdrop-blur-[3px] sm:items-center sm:p-6" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section aria-label={`Отзывы о ${space.name}`} aria-modal="true" className="review-modal-panel flex h-[88dvh] w-full flex-col overflow-hidden rounded-t-[26px] bg-white shadow-[0_30px_90px_rgba(16,24,40,0.3)] sm:h-[min(760px,calc(100dvh-48px))] sm:max-w-[620px] sm:rounded-[26px]" role="dialog">
        <header className="flex shrink-0 items-start justify-between gap-5 border-b border-[#EAECF0] px-5 py-5 sm:px-7 sm:py-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand">Отзывы о пространстве</p>
            <h2 className="mt-1 truncate text-xl font-bold tracking-[-0.02em] text-ink sm:text-2xl">{space.name}</h2>
            <p className="mt-1 text-xs text-[#667085]">Корпус {space.building_code} · {space.floor_number} этаж</p>
          </div>
          <button aria-label="Закрыть отзывы" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F2F4F7] text-[#667085] transition hover:bg-[#EAECF0] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30" onClick={onClose} ref={closeRef} type="button"><X className="size-[18px]" /></button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
          {loading && <ReviewsLoading />}
          {!loading && error && <div className="rounded-2xl border border-[#FECACA] bg-[#FFF7F7] p-5 text-center"><p className="text-sm font-bold text-ink">Не удалось загрузить отзывы</p><p className="mt-1 text-xs text-[#667085]">{error}</p><button className="mt-4 rounded-xl bg-white px-4 py-2 text-xs font-bold text-brand shadow-sm" onClick={reload} type="button">Повторить</button></div>}
          {!loading && !error && data && data.items.length === 0 && <EmptyReviews />}
          {!loading && !error && data && data.items.length > 0 && <>
            <div className="rounded-[22px] bg-[#F8F9FC] p-5">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex shrink-0 items-center gap-4 sm:block sm:w-[116px] sm:text-center">
                  <strong className="text-[46px] font-extrabold leading-none tracking-[-0.05em] text-ink">{metrics?.average?.toFixed(1) ?? space.rating_average?.toFixed(1)}</strong>
                  <div className="sm:mt-2"><Stars score={Math.round(metrics?.average ?? space.rating_average ?? 0)} /><p className="mt-1 text-[10px] font-semibold text-[#98A2B3]">{total} {reviewWord(total)}</p></div>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((score) => { const count = metrics?.distribution[String(score)] ?? 0; const percent = total ? Math.round(count / total * 100) : 0; return <div className="grid grid-cols-[10px_1fr_30px] items-center gap-2.5 text-[10px]" key={score}><span className="font-bold text-[#667085]">{score}</span><span className="h-1.5 overflow-hidden rounded-full bg-[#E4E7EC]"><span className="block h-full rounded-full bg-[#F2B84B]" style={{ width: `${percent}%` }} /></span><span className="text-right font-medium text-[#98A2B3]">{percent}%</span></div>; })}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#E4E7EC] pt-4">
                <Metric label="Чистота" value={metrics?.cleanliness} />
                <Metric label="Оснащение" value={metrics?.equipment} />
                <Metric label="Комфорт" value={metrics?.comfort} />
              </div>
            </div>

            <div className="mt-7 flex items-center justify-between gap-3"><div><h3 className="text-base font-bold text-ink">Отзывы посетителей</h3><p className="mt-0.5 text-[11px] text-[#98A2B3]">Сначала новые</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F8F5] px-3 py-1.5 text-[10px] font-bold text-[#168C7F]"><CheckCircle2 className="size-3.5" />Проверенные</span></div>
            <div className="mt-4 divide-y divide-[#EAECF0]">{data.items.map((review) => <ReviewItem key={review.id} review={review} />)}</div>
          </>}
        </div>
      </section>
    </div>,
    document.body,
  );
}

function Metric({ label, value }: { label: string; value: number | null | undefined }) {
  return <div className="rounded-xl bg-white px-2 py-3 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]"><strong className="block text-base font-extrabold text-ink">{value?.toFixed(1) ?? "—"}</strong><span className="mt-0.5 block truncate text-[9px] font-semibold text-[#98A2B3]">{label}</span></div>;
}

function ReviewItem({ review }: { review: Review }) {
  return <article className="py-5 first:pt-0 last:pb-0"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EEF0FF] text-[11px] font-extrabold text-brand">{initials(review.author_name)}</span><div className="min-w-0"><strong className="block truncate text-xs text-ink">{review.author_name}</strong><span className="mt-0.5 block text-[10px] text-[#98A2B3]">{formatRole(review.author_role)} · {formatDate(review.created_at, true)}</span></div></div><div className="shrink-0 text-right"><Stars score={review.score} /><span className="ml-1.5 align-middle text-xs font-extrabold text-ink">{review.score}.0</span></div></div><p className="mt-3 text-[13px] leading-5 text-[#475467]">{review.text}</p>{review.verified_booking && <p className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-[#168C7F]"><CheckCircle2 className="size-3.5" />Подтверждённое бронирование</p>}</article>;
}

function ReviewsLoading() {
  return <div className="space-y-5"><div className="h-48 animate-pulse rounded-[22px] bg-[#F2F4F7]" />{Array.from({ length: 3 }).map((_, index) => <div className="space-y-3 py-2" key={index}><div className="h-10 w-2/3 animate-pulse rounded-xl bg-[#F2F4F7]" /><div className="h-14 animate-pulse rounded-xl bg-[#F7F8FA]" /></div>)}</div>;
}

function EmptyReviews() {
  return <div className="flex min-h-72 flex-col items-center justify-center text-center"><span className="flex size-14 items-center justify-center rounded-2xl bg-[#EEF0FF] text-brand"><MessageSquareText className="size-6" /></span><h3 className="mt-4 text-base font-bold text-ink">Отзывов пока нет</h3><p className="mt-2 max-w-xs text-xs leading-5 text-[#667085]">После первых завершённых бронирований здесь появятся впечатления посетителей.</p></div>;
}

function reviewWord(value: number) {
  const lastTwo = value % 100;
  const last = value % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return "отзывов";
  if (last === 1) return "отзыв";
  if (last >= 2 && last <= 4) return "отзыва";
  return "отзывов";
}
