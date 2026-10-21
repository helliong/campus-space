import Link from "next/link";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { UpcomingBooking } from "@/components/dashboard/upcoming-booking";
import { SiteFooter } from "@/components/layout/site-footer";

const stats = [
  { value: "2", label: "Активные брони", note: "Ближайшая — сегодня", color: "bg-[#EEF0FF] text-brand" },
  { value: "1", label: "Ожидают одобрения", note: "Лаборатория Л-302", color: "bg-[#FEF3D8] text-[#E8A317]" },
  { value: "6", label: "Избранные места", note: "2 доступны сейчас", color: "bg-[#E8F8F5] text-accent" },
];

const bookings = [
  { letter: "А", title: "А-201 · Аудитория", date: "Завтра · 10:00–11:30", status: "Подтверждено", color: "bg-[#EEF0FF] text-brand", badge: "bg-[#E8F8F5] text-accent" },
  { letter: "Л", title: "Л-302 · Лаборатория", date: "28 октября · 16:00–18:00", status: "На рассмотрении", color: "bg-[#FEF3D8] text-[#E8A317]", badge: "bg-[#FEF3D8] text-[#E8A317]" },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <DashboardHeader />
      <div className="flex w-full flex-1">
        <DashboardSidebar />
        <main className="mx-auto min-w-0 max-w-[1340px] flex-1 px-5 py-10 sm:px-8 lg:px-11">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div><h1 className="text-[30px] font-bold text-ink">Добрый день, Анна!</h1><p className="mt-1 text-sm text-[#667085]">Здесь собраны ваши ближайшие бронирования и заявки.</p></div>
            <Link className="inline-flex h-[42px] min-w-[202px] items-center justify-center self-start rounded-[11px] bg-brand px-4 text-xs font-semibold text-white hover:bg-brand-hover" href="/spaces">Найти пространство</Link>
          </div>

          <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
          </section>

          <section className="mt-10">
            <h2 className="mb-6 text-xl font-bold text-ink">Ближайшая бронь</h2>
            <UpcomingBooking />
          </section>

          <section className="mt-14 grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.9fr)_minmax(300px,1fr)]">
            <div className="rounded-[18px] border border-[#E4E7EC] bg-white p-[23px]">
              <div className="flex items-center justify-between gap-4"><h2 className="text-[17px] font-bold text-ink">Следующие бронирования</h2><Link className="text-xs font-semibold text-brand" href="/dashboard/bookings">Все бронирования →</Link></div>
              <div className="mt-5 divide-y divide-[#E4E7EC]">
                {bookings.map((booking) => (
                  <article className="flex flex-wrap items-center gap-4 py-3 first:pt-0 last:pb-0" key={booking.title}>
                    <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${booking.color}`}>{booking.letter}</span>
                    <div className="min-w-[180px] flex-1"><h3 className="text-[13px] font-semibold text-ink">{booking.title}</h3><p className="mt-1 text-[11px] text-[#667085]">{booking.date}</p></div>
                    <span className={`inline-flex h-[26px] items-center rounded-full px-3 text-[10px] font-semibold ${booking.badge}`}>{booking.status}</span>
                  </article>
                ))}
              </div>
            </div>

            <aside className="rounded-[18px] border border-[#E4E7EC] bg-white p-[23px]">
              <span className="flex size-12 items-center justify-center rounded-[14px] bg-[#EEF0FF] text-lg font-bold text-brand">★</span>
              <h2 className="mt-5 text-[17px] font-bold text-ink">Оставьте отзыв</h2>
              <p className="mt-3 text-[13px] leading-[1.45] text-[#667085]">Расскажите о коворкинге К-108, который вы посетили вчера.</p>
              <Link className="mt-6 inline-flex h-[42px] min-w-[220px] items-center rounded-[11px] border border-[#E4E7EC] bg-white px-4 text-xs font-semibold text-brand hover:bg-[#F5F6FF]" href="/dashboard/reviews/new">Оценить пространство</Link>
            </aside>
          </section>
        </main>
      </div>
      <SiteFooter bordered />
    </div>
  );
}

function StatCard({ value, label, note, color }: { value: string; label: string; note: string; color: string }) {
  return (
    <article className="flex min-h-24 items-center rounded-2xl border border-[#E4E7EC] bg-white p-4">
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-[17px] font-bold ${color}`}>{value}</span>
      <div className="ml-4"><p className="text-xs font-medium text-[#667085]">{label}</p><p className="mt-1 text-xs font-semibold text-ink">{note}</p></div>
    </article>
  );
}
