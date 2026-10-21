import Image from "next/image";
import Link from "next/link";

import { FloorPlanPreview } from "@/components/landing/floor-plan-preview";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const benefits = [
  {
    number: "01",
    color: "bg-brand",
    title: "Найдите подходящее",
    description: "Фильтруйте аудитории по вместимости, проектору, ПК и условиям доступа.",
  },
  {
    number: "02",
    color: "bg-accent",
    title: "Выберите время",
    description: "Карта покажет, что свободно именно в нужный вам интервал.",
  },
  {
    number: "03",
    color: "bg-[#6675E0]",
    title: "Забронируйте быстро",
    description: "Получайте подтверждение сразу или отправляйте заявку на одобрение.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas text-ink">
      <SiteHeader />

      <main className="flex-1">
        <section className="bg-canvas">
          <div className="mx-auto grid min-h-[580px] w-full max-w-[1600px] items-center gap-12 px-5 py-[52px] sm:px-8 lg:px-[clamp(64px,4.5vw,88px)] xl:grid-cols-[minmax(470px,0.92fr)_minmax(560px,1fr)] xl:justify-between">
            <div>
              <div className="inline-flex h-8 items-center gap-2 rounded-full bg-[#E8F8F5] px-4 text-xs font-semibold text-accent">
                <Image alt="" height={8} src="/icons/status-free.svg" width={8} />
                Свободные места рядом
              </div>
              <h1 className="mt-10 text-[40px] font-bold leading-[1.34] tracking-[-0.035em] text-ink sm:text-5xl">
                <span className="block">Учебное пространство</span>
                <span className="block">находится за пару</span>
                <span className="block">кликов</span>
              </h1>
              <p className="mt-8 max-w-[560px] text-base leading-[1.55] text-[#667085] sm:text-lg">
                Находите свободные аудитории, места в коворкингах и компьютеры — выбирайте удобное время и бронируйте без очередей.
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:mt-3 sm:flex-row">
                <Link className="inline-flex h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover" href="/spaces">
                  Найти пространство
                </Link>
                <Link className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E4E7EC] bg-white px-5 text-sm font-semibold text-brand transition hover:bg-[#F5F6FF]" href="/login">
                  Войти в аккаунт
                </Link>
              </div>
              <p className="mt-8 text-[13px] font-medium text-[#667085]">Без установки приложения · Бронирование от 30 минут</p>
            </div>

            <FloorPlanPreview />
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto w-full max-w-[1600px] px-5 py-[62px] sm:px-8 lg:px-[clamp(64px,4.5vw,88px)]">
            <h2 className="text-[28px] font-bold tracking-[-0.025em] text-ink sm:text-[30px]">Всё нужное для учёбы — в одном месте</h2>
            <p className="mt-1 text-base text-[#667085]">Выберите место по цели, оснащению и доступному времени.</p>
            <div className="mt-9 grid gap-8 md:grid-cols-3">
              {benefits.map((benefit) => (
                <article className="min-h-[162px] rounded-2xl bg-canvas p-6" key={benefit.number}>
                  <span className={`inline-flex size-[42px] items-center justify-center rounded-xl text-xs font-bold text-white ${benefit.color}`}>
                    {benefit.number}
                  </span>
                  <h3 className="mt-4 text-[17px] font-bold text-ink">{benefit.title}</h3>
                  <p className="mt-1 max-w-[326px] text-xs leading-[1.4] text-[#667085]">{benefit.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-canvas px-5 pb-[30px] pt-16 sm:px-8 lg:px-16">
          <div className="mx-auto flex min-h-[218px] w-full max-w-[1424px] flex-col justify-center rounded-3xl bg-brand px-7 py-10 sm:px-12">
            <h2 className="text-[28px] font-bold tracking-[-0.025em] text-white sm:text-[30px]">Готовы найти своё место на кампусе?</h2>
            <p className="mt-1 text-base text-[#E2E6FF]">Создайте аккаунт и бронируйте аудитории, столы и ПК в одном сервисе.</p>
            <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <Link className="inline-flex h-12 min-w-[190px] items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-brand transition hover:bg-[#F5F6FF]" href="/register">
                Создать аккаунт
              </Link>
              <span className="inline-flex h-8 items-center rounded-full bg-[#4555D1] px-4 text-[11px] font-medium text-white">
                Вход для студентов и преподавателей
              </span>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
