"use client";

import { ArrowRight, Check, MessageSquareText, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { useApiData } from "@/hooks/use-api-data";
import { formatDate, formatRole, initials } from "@/lib/format";
import type { Review, ReviewCollection } from "@/lib/types";

function Stars({ score, size = "small" }: { score: number; size?: "small" | "large" }) {
  return <span aria-label={`${score} из 5 звёзд`} className="inline-flex gap-1">{[1, 2, 3, 4, 5].map((value) => <Star aria-hidden className={size === "large" ? "size-5" : "size-3.5"} fill={value <= score ? "currentColor" : "none"} key={value} strokeWidth={1.8} />)}</span>;
}

export default function ReviewsPage() {
  const { data, loading, error, reload } = useApiData<ReviewCollection>("/reviews");
  const metrics = data?.metrics;
  const total = metrics?.total ?? 0;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas text-ink">
      <SiteHeader active="reviews" />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-[#E4E7EC] bg-white"><div className="pointer-events-none absolute -right-16 -top-32 size-[440px] rounded-full bg-[#EEF0FF] blur-3xl" /><div className="relative mx-auto grid w-full max-w-[1600px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(470px,0.72fr)] lg:px-[clamp(64px,4.5vw,88px)] lg:py-20">
          <div className="flex flex-col justify-center"><div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#E8F8F5] px-4 py-2 text-xs font-semibold text-[#168C7F]"><ShieldCheck className="size-4" />Отзывы после реальных бронирований</div><h1 className="mt-7 max-w-[700px] text-[42px] font-bold leading-[1.12] tracking-[-0.045em] sm:text-[56px]">Пространства, в которых хочется учиться</h1><p className="mt-6 max-w-[620px] text-base leading-7 text-[#667085] sm:text-lg">Отзывы публикуются только после завершённого посещения — здесь нет демонстрационных оценок.</p><div className="mt-9 flex flex-wrap items-center gap-5"><Link className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand-hover" href="/spaces">Найти пространство<ArrowRight className="size-4" /></Link>{total > 0 && <p className="text-xs leading-5 text-[#667085]"><strong className="block text-ink">{total.toLocaleString("ru-RU")} отзывов</strong>от сообщества кампуса</p>}</div></div>
          <div className="rounded-[28px] border border-[#E4E7EC] bg-white p-6 shadow-[0_24px_70px_rgba(39,55,168,0.10)] sm:p-8"><div className="flex flex-col gap-6 border-b border-[#EAECF0] pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#98A2B3]">Общий рейтинг</p><div className="mt-2 flex items-end gap-3"><strong className="text-[64px] font-bold leading-none tracking-[-0.06em]">{metrics?.average?.toFixed(1) ?? "—"}</strong><span className="pb-1 text-sm font-medium text-[#98A2B3]">из 5</span></div>{metrics?.average && <div className="mt-3 text-[#F2B84B]"><Stars score={Math.round(metrics.average)} size="large" /></div>}</div><p className="max-w-[180px] text-xs leading-5 text-[#667085] sm:text-right">Рейтинг рассчитывается по опубликованным проверенным отзывам</p></div><div className="mt-7 space-y-3">{[5, 4, 3, 2, 1].map((score) => { const count = metrics?.distribution[String(score)] ?? 0; const percent = total ? Math.round(count / total * 100) : 0; return <div className="grid grid-cols-[12px_1fr_34px] items-center gap-3 text-xs" key={score}><span className="font-semibold text-[#667085]">{score}</span><span className="h-2 overflow-hidden rounded-full bg-[#EEF0F3]"><span className="block h-full rounded-full bg-[#F2B84B]" style={{ width: `${percent}%` }} /></span><span className="text-right text-[#98A2B3]">{percent}%</span></div>; })}</div><div className="mt-7 grid grid-cols-3 gap-2 sm:gap-3"><Metric label="Чистота" value={metrics?.cleanliness} color="bg-[#E8F8F5] text-[#168C7F]" /><Metric label="Оснащение" value={metrics?.equipment} color="bg-[#EEF0FF] text-brand" /><Metric label="Комфорт" value={metrics?.comfort} color="bg-[#FFF7E8] text-[#B57700]" /></div></div>
        </div></section>

        <section className="mx-auto w-full max-w-[1600px] px-5 py-16 sm:px-8 lg:px-[clamp(64px,4.5vw,88px)] lg:py-20"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Говорит кампус</p><h2 className="mt-3 text-[30px] font-bold tracking-[-0.03em] sm:text-[36px]">Недавние впечатления</h2></div>{total > 0 && <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E4E7EC] bg-white px-4 py-2 text-xs font-medium text-[#667085]"><Check className="size-3.5 text-accent" />Все отзывы проверены</div>}</div>
          {loading && <div className="mt-9 grid gap-6 md:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <div className="h-60 animate-pulse rounded-[24px] bg-[#EDEFF3]" key={index} />)}</div>}
          {!loading && error && <div className="mt-9 rounded-[24px] border border-[#E4E7EC] bg-white p-10 text-center"><p className="text-sm font-semibold">Не удалось загрузить отзывы</p><p className="mt-2 text-xs text-[#667085]">{error}</p><button className="mt-4 text-xs font-semibold text-brand" onClick={reload} type="button">Повторить</button></div>}
          {!loading && !error && data?.items.length === 0 && <EmptyReviews />}
          {!loading && !error && data && data.items.length > 0 && <div className="mt-9 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{data.items.map((review) => <ReviewCard key={review.id} review={review} />)}</div>}
        </section>

        <section className="px-5 pb-16 sm:px-8 lg:px-16"><div className="mx-auto flex w-full max-w-[1424px] flex-col items-start gap-8 rounded-[28px] bg-[#E8F8F5] px-7 py-9 sm:px-10 md:flex-row md:items-center md:justify-between"><div className="flex items-start gap-4"><span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-accent shadow-sm"><MessageSquareText className="size-5" /></span><div><h2 className="text-xl font-bold sm:text-2xl">Ваше мнение делает кампус удобнее</h2><p className="mt-2 max-w-[650px] text-sm leading-6 text-[#52706C]">После завершённого бронирования отзыв можно оставить в личном кабинете.</p></div></div><Link className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-brand shadow-sm" href="/dashboard/reviews">Мои отзывы<ArrowRight className="size-4" /></Link></div></section>
      </main>
      <SiteFooter bordered />
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: number | null | undefined; color: string }) { return <div className={`rounded-2xl px-3 py-4 sm:px-4 ${color}`}><strong className="block text-xl font-bold sm:text-2xl">{value?.toFixed(1) ?? "—"}</strong><span className="mt-1 block text-[10px] font-semibold sm:text-xs">{label}</span></div>; }
function ReviewCard({ review }: { review: Review }) { return <article className="rounded-[24px] border border-[#E4E7EC] bg-white p-6 transition hover:-translate-y-1 hover:border-brand/20 hover:shadow-[0_16px_40px_rgba(39,55,168,0.08)]"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#EEF0FF] text-xs font-bold text-brand">{initials(review.author_name)}</span><div><strong className="block text-sm">{review.author_name}</strong><span className="mt-1 block text-[11px] text-[#98A2B3]">{formatRole(review.author_role)} · {formatDate(review.created_at)}</span></div></div><span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7E8] px-2.5 py-1 text-xs font-bold text-[#B57700]"><Star className="size-3 fill-current" />{review.score}.0</span></div><p className="mt-5 text-sm leading-6 text-[#475467]">{review.text}</p><div className="mt-5 flex items-center justify-between gap-3 border-t border-[#EAECF0] pt-4"><strong className="text-xs text-ink">{review.space_name}</strong>{review.verified_booking && <span className="text-[10px] font-semibold text-accent">Проверенное посещение</span>}</div></article>; }
function EmptyReviews() { return <div className="mt-9 flex min-h-72 flex-col items-center justify-center rounded-[24px] border border-dashed border-[#C9D0F3] bg-white p-8 text-center"><MessageSquareText className="size-6 text-brand" /><h3 className="mt-4 text-base font-bold">Отзывов пока нет</h3><p className="mt-2 max-w-sm text-xs leading-5 text-[#667085]">После первых завершённых бронирований здесь появятся реальные впечатления пользователей.</p></div>; }
