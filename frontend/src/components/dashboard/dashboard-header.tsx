import { Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/ui";

export function DashboardHeader() {
  return (
    <header className="border-b border-[#E4E7EC] bg-white">
      <div className="mx-auto flex min-h-20 w-full max-w-[1600px] items-center gap-8 px-5 sm:px-8 lg:px-[clamp(48px,4vw,72px)]">
        <Logo className="shrink-0" />
        <nav className="hidden items-center gap-10 md:flex" aria-label="Навигация личного кабинета">
          <Link className="text-sm font-medium text-[#667085] hover:text-ink" href="/spaces">Найти пространство</Link>
          <Link className="text-sm font-medium text-brand" href="/dashboard/bookings">Мои бронирования</Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <button aria-label="Уведомления" className="relative flex size-10 items-center justify-center rounded-xl bg-canvas text-[#667085] hover:text-ink" type="button">
            <Bell aria-hidden className="size-4" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-[#E8A317]" />
          </button>
          <div className="relative size-10 shrink-0">
            <Image alt="" height={40} src="/icons/dashboard-avatar.svg" width={40} />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-brand">АИ</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-ink">Анна Иванова</p>
            <p className="mt-0.5 text-[10px] text-[#667085]">Студент</p>
          </div>
        </div>
      </div>
    </header>
  );
}
