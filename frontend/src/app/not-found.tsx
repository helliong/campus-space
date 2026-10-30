import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

function CampusMap() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-[1.12/1] w-full max-w-[510px] overflow-hidden rounded-[32px] border border-[#E4E7EC] bg-white shadow-[0_24px_70px_rgba(39,55,168,0.12)]"
    >
      <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(#E9ECF2_1px,transparent_1px),linear-gradient(90deg,#E9ECF2_1px,transparent_1px)] [background-size:32px_32px]" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 510 455">
        <path
          d="M-24 337C52 303 108 323 163 278C215 235 220 174 286 150C355 125 406 169 536 74"
          fill="none"
          stroke="#DDE2EA"
          strokeDasharray="7 9"
          strokeLinecap="round"
          strokeWidth="4"
        />
        <path
          d="M-18 348C58 314 116 334 171 287C224 242 228 184 291 161C356 137 411 178 528 92"
          fill="none"
          stroke="#F7F8FA"
          strokeLinecap="round"
          strokeWidth="22"
        />
      </svg>

      <div className="absolute left-[9%] top-[13%] h-[22%] w-[31%] rotate-[-4deg] rounded-2xl border border-[#D8DEEA] bg-[#EEF1F6] shadow-sm">
        <div className="absolute bottom-3 left-4 h-2 w-14 rounded-full bg-[#D8DEEA]" />
      </div>
      <div className="absolute right-[8%] top-[11%] h-[29%] w-[34%] rotate-[3deg] rounded-2xl border border-[#D9EDE9] bg-[#E8F8F5] shadow-sm">
        <div className="absolute right-4 top-4 size-3 rounded-full bg-accent/25" />
        <div className="absolute bottom-4 left-4 h-2 w-16 rounded-full bg-accent/20" />
      </div>
      <div className="absolute bottom-[11%] left-[10%] h-[27%] w-[37%] rotate-[2deg] rounded-2xl border border-[#E1E4F8] bg-[#EEF0FF] shadow-sm">
        <div className="absolute left-4 top-4 grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <span className="size-3 rounded bg-brand/10" key={index} />
          ))}
        </div>
      </div>
      <div className="absolute bottom-[9%] right-[7%] h-[22%] w-[34%] rotate-[-3deg] rounded-2xl border border-[#E7E0D3] bg-[#FFF7E8] shadow-sm">
        <div className="absolute bottom-4 right-4 flex gap-2">
          <span className="size-3 rounded-full bg-[#F2C66D]/50" />
          <span className="size-3 rounded-full bg-[#F2C66D]/50" />
          <span className="size-3 rounded-full bg-[#F2C66D]/50" />
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_12px_32px_rgba(51,70,200,0.22)]">
        <span className="absolute inset-2 animate-ping rounded-full bg-brand/10 [animation-duration:2.6s] motion-reduce:animate-none" />
        <span className="relative flex size-12 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/25">
          <MapPin className="size-6" strokeWidth={2.25} />
        </span>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#E4E7EC] bg-white/95 px-4 py-2 text-xs font-semibold text-[#667085] shadow-sm backdrop-blur">
        Здесь ничего не найдено
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas text-ink">
      <SiteHeader />

      <main className="relative flex flex-1 items-center overflow-hidden">
        <div className="pointer-events-none absolute -left-16 top-2 select-none text-[260px] font-bold leading-none tracking-[-0.08em] text-brand/[0.035] sm:text-[380px] lg:-top-16 lg:text-[520px]">
          404
        </div>

        <div className="relative mx-auto grid w-full max-w-[1440px] items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(420px,0.74fr)] lg:px-[clamp(64px,4.5vw,88px)] lg:py-20">
          <section className="max-w-[620px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/10 bg-[#EEF0FF] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-brand">
              <span className="size-2 rounded-full bg-brand" />
              Ошибка 404
            </div>

            <h1 className="mt-7 text-[42px] font-bold leading-[1.08] tracking-[-0.045em] text-ink sm:text-[58px]">
              Кажется, вы свернули не в тот корпус
            </h1>
            <p className="mt-6 max-w-[540px] text-base leading-7 text-[#667085] sm:text-lg">
              Такой страницы нет или она переехала. Вернитесь на главную или найдите свободное место на карте кампуса.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(51,70,200,0.2)] transition hover:-translate-y-0.5 hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:ring-offset-2"
                href="/"
              >
                <ArrowLeft className="size-4" />
                На главную
              </Link>
              <Link
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#E4E7EC] bg-white px-6 text-sm font-semibold text-brand transition hover:-translate-y-0.5 hover:border-brand/20 hover:bg-[#F5F6FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 focus-visible:ring-offset-2"
                href="/spaces"
              >
                Найти пространство
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <p className="mt-8 text-sm text-[#98A2B3]">
              Если вы уверены, что адрес верный, сообщите об этом в поддержку.
            </p>
          </section>

          <CampusMap />
        </div>
      </main>

      <SiteFooter bordered />
    </div>
  );
}
