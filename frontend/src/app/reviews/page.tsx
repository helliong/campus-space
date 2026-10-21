import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const metrics = [
  { label: "Чистота", score: "4.8" },
  { label: "Оснащение", score: "4.6" },
  { label: "Комфорт", score: "4.7" },
];

const reviews = [
  { place: "Коворкинг К-214", author: "Алина К. · вчера", score: "5.0", text: "Много розеток и тихие зоны. Отлично подошло для подготовки к защите." },
  { place: "Аудитория А-201", author: "Иван П. · 2 дня назад", score: "4.0", text: "Проектор работает, удобно проводить встречу небольшой командой." },
  { place: "ПК-5", author: "Мария С. · 4 дня назад", score: "5.0", text: "Нужное ПО уже установлено, место легко найти на карте." },
];

export default function ReviewsPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <SiteHeader active="reviews" />
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-5 pb-[50px] pt-12 sm:px-8 lg:px-[clamp(64px,4.5vw,88px)]">
        <h1 className="text-[34px] font-bold tracking-[-0.025em] text-ink sm:text-[40px]">Отзывы о пространствах</h1>
        <p className="mt-1 text-base text-[#667085] sm:text-lg">Выбирайте места, которым доверяют студенты и преподаватели.</p>

        <section className="mt-[72px] grid min-h-[196px] items-center gap-8 rounded-3xl bg-brand px-8 py-9 text-white lg:grid-cols-[220px_1fr_auto] lg:px-12">
          <div>
            <strong className="text-[52px] font-bold leading-none">4.7</strong>
            <p className="mt-4 text-[15px] font-medium text-[#E2E6FF]">Средняя оценка CampusSpace</p>
          </div>
          <div>
            <p aria-label="5 звёзд" className="text-[28px] font-bold tracking-[0.08em] text-[#FFD76A]">★★★★★</p>
            <p className="mt-2 text-sm font-medium text-[#E2E6FF]">На основе 1 248 отзывов</p>
          </div>
          <div className="grid gap-[30px] sm:grid-cols-3">
            {metrics.map((metric) => (
              <div className="h-[92px] w-full rounded-2xl bg-[#4555D1] p-4 sm:w-40" key={metric.label}>
                <p className="text-xs font-medium text-[#E2E6FF]">{metric.label}</p>
                <strong className="mt-1 block text-2xl font-bold">{metric.score}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-ink">Последние отзывы</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {reviews.map((review) => (
              <article className="relative min-h-[207px] rounded-[20px] border border-[#E4E7EC] bg-white p-[23px]" key={review.place}>
                <h3 className="pr-14 text-[17px] font-bold text-ink">{review.place}</h3>
                <p className="mt-1 text-xs font-medium text-[#667085]">{review.author}</p>
                <p aria-label="5 звёзд" className="mt-5 text-base font-bold tracking-[0.06em] text-[#E8A317]">★★★★★</p>
                <p className="mt-4 max-w-[360px] text-sm leading-[1.45] text-ink">{review.text}</p>
                <span className="absolute right-6 top-[23px] inline-flex h-8 min-w-[52px] items-center justify-center rounded-full bg-[#E8F8F5] px-3 text-xs font-bold text-accent">{review.score}</span>
              </article>
            ))}
          </div>
          <div className="mt-12 flex justify-end">
            <Link className="inline-flex h-12 min-w-[150px] items-center justify-center rounded-xl border border-[#E4E7EC] bg-white px-5 text-sm font-semibold text-brand hover:bg-[#F5F6FF]" href="/reviews/all">Все отзывы</Link>
          </div>
        </section>
      </main>
      <SiteFooter bordered />
    </div>
  );
}
