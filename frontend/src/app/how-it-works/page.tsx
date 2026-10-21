import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const steps = [
  { number: "01", color: "bg-brand", title: "Выберите время", text: "Укажите корпус, этаж, дату и желаемую длительность. Карта покажет актуальную доступность." },
  { number: "02", color: "bg-accent", title: "Найдите место", text: "Сравните аудитории, коворкинги и ПК по вместимости, оснащению и расположению." },
  { number: "03", color: "bg-[#6675E0]", title: "Подтвердите бронь", text: "Обычные пространства бронируются сразу, а для лабораторий можно отправить заявку." },
];

const timeline = [
  { time: "10:00", label: "Выбор места" },
  { time: "10:02", label: "Подтверждение" },
  { time: "10:05", label: "Напоминание добавлено" },
];

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <SiteHeader active="how-it-works" />
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-5 pb-10 pt-14 sm:px-8 lg:px-[clamp(64px,4.5vw,88px)]">
        <h1 className="text-[34px] font-bold tracking-[-0.025em] text-ink sm:text-[40px]">Как работает CampusSpace</h1>
        <p className="mt-1 text-base text-[#667085] sm:text-lg">От поиска свободной аудитории до подтверждённой брони — в три простых шага.</p>

        <section className="mt-[72px] grid gap-7 md:grid-cols-3">
          {steps.map((step) => (
            <article className="min-h-[260px] rounded-[20px] border border-[#E4E7EC] bg-white p-[27px]" key={step.number}>
              <span className={`inline-flex size-12 items-center justify-center rounded-[14px] text-[13px] font-bold text-white ${step.color}`}>{step.number}</span>
              <h2 className="mt-[30px] text-xl font-bold text-ink">{step.title}</h2>
              <p className="mt-3 max-w-[346px] text-sm leading-[1.45] text-[#667085]">{step.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-[76px] grid min-h-[220px] items-center gap-8 rounded-3xl bg-[#EEF0FF] px-8 py-9 md:grid-cols-[1fr_auto] lg:px-12">
          <div>
            <h2 className="text-[26px] font-bold text-ink">Бронируйте так, как удобно вам</h2>
            <p className="mt-2 max-w-[640px] text-base leading-[1.45] text-[#667085]">Бронь от 30 минут до полного дня. История и напоминания всегда доступны в личном кабинете.</p>
          </div>
          <div className="grid gap-[30px] sm:grid-cols-3">
            {timeline.map((item) => (
              <div className="h-[100px] w-full rounded-2xl bg-white p-4 sm:w-[148px]" key={item.time}>
                <strong className="text-sm font-bold text-brand">{item.time}</strong>
                <p className="mt-4 text-xs font-medium text-[#667085]">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <Link className="mt-10 inline-flex h-12 min-w-[210px] items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover" href="/spaces">Найти пространство</Link>
      </main>
      <SiteFooter bordered />
    </div>
  );
}
