"use client";

import { ArrowRight, CheckCircle2, MessageSquareText, Star } from "lucide-react";
import { SelectField } from "@/components/ui/select-field";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

import { useApiData } from "@/hooks/use-api-data";
import { apiRequest } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Booking, Review, ReviewCollection } from "@/lib/types";

export default function DashboardReviewsPage() {
  const reviewsState = useApiData<ReviewCollection>("/reviews/me", true);
  const bookingsState = useApiData<Booking[]>("/bookings/me", true);
  const reviewable = useMemo(() => (bookingsState.data ?? []).filter((booking) => booking.can_review), [bookingsState.data]);
  const [bookingId, setBookingId] = useState("");
  const [score, setScore] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const reviews = reviewsState.data?.items ?? [];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingId) { setSubmitError("Выберите завершённую бронь."); return; }
    if (text.trim().length < 10) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await apiRequest<Review>("/reviews", { method: "POST", body: JSON.stringify({ booking_id: bookingId, score, cleanliness: score, equipment: score, comfort: score, text: text.trim() }) });
      setBookingId("");
      setText("");
      reviewsState.reload();
      bookingsState.reload();
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : "Не удалось отправить отзыв");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto min-w-0 w-full max-w-[1340px] flex-1 px-5 py-8 sm:px-8 lg:px-11 lg:py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Личный кабинет</p><h1 className="mt-2 text-[30px] font-bold tracking-[-0.025em] text-ink">Мои отзывы</h1><p className="mt-1 text-sm text-[#667085]">Ваши оценки помогают кампусу становиться удобнее.</p></div>{reviewsState.data && <div className="flex items-center gap-3 rounded-2xl border border-[#E4E7EC] bg-white px-4 py-3"><span className="flex size-10 items-center justify-center rounded-xl bg-[#FFF7E8] text-[#B57700]"><Star className="size-5 fill-current" /></span><div><strong className="block text-lg leading-none text-ink">{reviewsState.data.metrics.average?.toFixed(1) ?? "—"}</strong><span className="mt-1 block text-[10px] text-[#98A2B3]">Средняя оценка</span></div></div>}</div>

      <section className="mt-8 grid gap-5 sm:grid-cols-3"><Metric icon={MessageSquareText} label="Опубликовано отзывов" value={String(reviews.length)} /><Metric icon={CheckCircle2} label="Проверенных отзывов" value={String(reviews.filter((review) => review.verified_booking).length)} /><Metric icon={Star} label="Ожидают оценки" value={String(reviewable.length)} /></section>

      {!bookingsState.loading && reviewable.length > 0 && (
        <section className="mt-8 scroll-mt-6 overflow-hidden rounded-[22px] bg-brand text-white" id="new-review">
          <form className="grid lg:grid-cols-[1fr_340px]" onSubmit={submit}>
            <div className="p-6 sm:p-8"><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-[#E2E6FF]"><span className="size-1.5 rounded-full bg-[#FFD76A]" />Проверенное бронирование</span><h2 className="mt-5 text-2xl font-bold">Поделитесь впечатлением</h2><label className="mt-5 block text-xs font-semibold text-[#E2E6FF]">Посещение<SelectField aria-label="Посещение" className="mt-2 border-white/20 bg-white/10 text-white hover:border-white/40" onChange={setBookingId} required value={bookingId} options={[{ value: "", label: "Выберите завершённую бронь", disabled: true }, ...reviewable.map((booking) => ({ value: booking.id, label: `${booking.space_name} · ${formatDate(booking.ends_at, true)}` }))]} /></label><div className="mt-5"><p className="text-xs font-semibold text-[#E2E6FF]">Оценка</p><div className="mt-2 flex gap-2">{[1, 2, 3, 4, 5].map((value) => <button aria-label={`${value} звёзд`} className="text-[#FFD76A]" key={value} onClick={() => setScore(value)} type="button"><Star className="size-7" fill={value <= score ? "currentColor" : "none"} /></button>)}</div></div><label className="mt-5 block text-xs font-semibold text-[#E2E6FF]">Комментарий<textarea className="mt-2 min-h-24 w-full resize-y rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-sm text-white outline-none placeholder:text-[#AEB7F1]" minLength={10} onChange={(event) => setText(event.target.value)} placeholder="Расскажите о комфорте и оснащении" required value={text} /></label>{submitError && <p className="mt-3 text-xs text-[#FFD0D7]" role="alert">{submitError}</p>}</div>
            <div className="flex flex-col justify-center border-t border-white/10 bg-white/[0.06] p-6 lg:border-l lg:border-t-0"><p className="text-sm font-semibold">Оценка применяется к чистоте, оснащению и комфорту.</p><p className="mt-2 text-xs leading-5 text-[#C8CFFF]">Отзыв будет связан с реальным бронированием и опубликован от вашего имени.</p><button className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-brand disabled:opacity-60" disabled={submitting || !bookingId || text.trim().length < 10} type="submit">{submitting ? "Публикуем…" : "Опубликовать"}<ArrowRight className="size-4" /></button></div>
          </form>
        </section>
      )}

      {(reviewsState.loading || bookingsState.loading) && <div className="mt-8 space-y-4">{Array.from({ length: 2 }).map((_, index) => <div className="h-44 animate-pulse rounded-[20px] bg-[#EDEFF3]" key={index} />)}</div>}
      {!reviewsState.loading && reviewsState.error && <ErrorState message={reviewsState.error} onRetry={reviewsState.reload} />}
      {!reviewsState.loading && !reviewsState.error && reviews.length === 0 && <EmptyReviews hasReviewable={reviewable.length > 0} />}
      {!reviewsState.loading && !reviewsState.error && reviews.length > 0 && <section className="mt-10"><div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-bold text-ink">Опубликованные отзывы</h2><p className="mt-1 text-xs text-[#667085]">Их видят другие пользователи CampusSpace</p></div><span className="text-xs font-semibold text-[#98A2B3]">{reviews.length}</span></div><div className="mt-5 space-y-5">{reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div></section>}

      <section className="mt-8 flex flex-col gap-5 rounded-[20px] border border-[#E4E7EC] bg-white p-6 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-base font-bold text-ink">Отзывы доступны после посещения</h2><p className="mt-1 text-xs leading-5 text-[#667085]">Оценить можно только завершённое подтверждённое бронирование.</p></div><Link className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-xl border border-[#E4E7EC] px-4 text-xs font-semibold text-brand hover:bg-[#F5F6FF]" href="/dashboard/bookings">История бронирований<ArrowRight className="size-3.5" /></Link></section>
    </main>
  );
}

function Stars({ score }: { score: number }) { return <span aria-label={`${score} из 5 звёзд`} className="inline-flex gap-1 text-[#F2B84B]">{[1, 2, 3, 4, 5].map((value) => <Star className="size-4" fill={value <= score ? "currentColor" : "none"} key={value} />)}</span>; }
function ReviewCard({ review }: { review: Review }) { return <article className="rounded-[20px] border border-[#E4E7EC] bg-white p-5 sm:p-6"><div className="flex flex-col gap-5 sm:flex-row"><span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF0FF] text-base font-bold text-brand">{review.space_code.charAt(0)}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-ink">{review.space_name}</h3><p className="mt-1 text-[11px] text-[#98A2B3]">Опубликован {formatDate(review.created_at, true)}{review.verified_booking ? " · Проверенное бронирование" : ""}</p></div><div className="flex items-center gap-3"><Stars score={review.score} /><span className="text-sm font-bold text-ink">{review.score}.0</span></div></div><p className="mt-5 max-w-[850px] text-sm leading-6 text-[#475467]">{review.text}</p></div></div></article>; }
function Metric({ icon: Icon, value, label }: { icon: typeof Star; value: string; label: string }) { return <div className="rounded-2xl border border-[#E4E7EC] bg-white p-5"><Icon className="size-5 text-brand" /><strong className="mt-4 block text-2xl font-bold text-ink">{value}</strong><p className="mt-1 text-xs text-[#667085]">{label}</p></div>; }
function EmptyReviews({ hasReviewable }: { hasReviewable: boolean }) { return <div className="mt-8 flex min-h-64 flex-col items-center justify-center rounded-[20px] border border-dashed border-[#C9D0F3] bg-white p-8 text-center"><span className="flex size-12 items-center justify-center rounded-2xl bg-[#EEF0FF] text-brand"><MessageSquareText className="size-5" /></span><h2 className="mt-4 text-base font-bold text-ink">Отзывов пока нет</h2><p className="mt-2 max-w-sm text-xs leading-5 text-[#667085]">{hasReviewable ? "Выберите завершённое посещение выше и поделитесь впечатлением." : "После завершённого бронирования здесь появится возможность оставить отзыв."}</p></div>; }
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) { return <div className="mt-8 rounded-[20px] border border-[#E4E7EC] bg-white p-8 text-center"><p className="text-sm font-semibold text-ink">Не удалось загрузить отзывы</p><p className="mt-2 text-xs text-[#667085]">{message}</p><button className="mt-4 text-xs font-semibold text-brand" onClick={onRetry} type="button">Повторить</button></div>; }
