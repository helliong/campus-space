"use client";

import { Bell, CalendarDays, Heart, Home, Settings, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const items = [
  { href: "/dashboard", label: "Обзор", icon: Home },
  { href: "/dashboard/bookings", label: "Мои бронирования", icon: CalendarDays },
  { href: "/dashboard/favorites", label: "Избранное", icon: Heart },
  { href: "/dashboard/reviews", label: "Мои отзывы", icon: Star },
  { href: "/dashboard/notifications", label: "Уведомления", icon: Bell },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <nav aria-label="Разделы личного кабинета" className="flex gap-2 overflow-x-auto border-b border-[#E4E7EC] bg-white px-5 py-3 lg:hidden">
        {items.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link className={cn("flex h-10 shrink-0 items-center gap-2 rounded-[10px] px-3 text-xs font-semibold", active ? "bg-[#EEF0FF] text-brand" : "text-[#667085]")} href={item.href} key={item.href}>
              <Icon aria-hidden className="size-3.5" />{item.label}
            </Link>
          );
        })}
      </nav>

      <aside className="hidden min-h-full w-[260px] shrink-0 flex-col border-r border-[#E4E7EC] bg-white px-4 pb-7 pt-8 lg:flex">
        <p className="px-3 text-[11px] font-bold uppercase text-[#667085]">Личный кабинет</p>
        <nav className="mt-4 space-y-2" aria-label="Разделы личного кабинета">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link className={active ? "flex h-11 items-center gap-3 rounded-[10px] bg-[#EEF0FF] px-4 text-[13px] font-semibold text-brand" : "flex h-11 items-center gap-3 rounded-[10px] px-4 text-[13px] font-medium text-ink hover:bg-canvas"} href={item.href} key={item.href}>
              <Icon aria-hidden className={active ? "size-4 text-brand" : "size-4 text-[#667085]"} />{item.label}
            </Link>
          );
        })}
        </nav>
        <div className="mt-auto rounded-[14px] bg-canvas p-[18px]">
          <h2 className="text-sm font-bold text-ink">Нужна помощь?</h2>
          <p className="mt-3 text-xs leading-[1.45] text-[#667085]">Посмотрите правила бронирования или свяжитесь с поддержкой.</p>
          <Link className="mt-5 inline-flex h-[42px] w-full items-center rounded-[11px] border border-[#E4E7EC] bg-white px-4 text-xs font-semibold text-brand hover:bg-[#F5F6FF]" href="/help">Центр помощи</Link>
        </div>
      </aside>
    </>
  );
}
