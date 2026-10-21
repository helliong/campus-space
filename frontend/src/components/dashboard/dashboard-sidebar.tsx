import { Bell, CalendarDays, Heart, Home, Settings, Star } from "lucide-react";
import Link from "next/link";

const items = [
  { href: "/dashboard", label: "Обзор", icon: Home, active: true },
  { href: "/dashboard/bookings", label: "Мои бронирования", icon: CalendarDays },
  { href: "/dashboard/favorites", label: "Избранное", icon: Heart },
  { href: "/dashboard/reviews", label: "Мои отзывы", icon: Star },
  { href: "/dashboard/notifications", label: "Уведомления", icon: Bell },
  { href: "/dashboard/settings", label: "Настройки", icon: Settings },
];

export function DashboardSidebar() {
  return (
    <aside className="hidden min-h-full w-[260px] shrink-0 flex-col border-r border-[#E4E7EC] bg-white px-4 pb-7 pt-8 lg:flex">
      <p className="px-3 text-[11px] font-bold uppercase text-[#667085]">Личный кабинет</p>
      <nav className="mt-4 space-y-2" aria-label="Разделы личного кабинета">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link className={item.active ? "flex h-11 items-center gap-3 rounded-[10px] bg-[#EEF0FF] px-4 text-[13px] font-semibold text-brand" : "flex h-11 items-center gap-3 rounded-[10px] px-4 text-[13px] font-medium text-ink hover:bg-canvas"} href={item.href} key={item.href}>
              <Icon aria-hidden className={item.active ? "size-4 text-brand" : "size-4 text-[#667085]"} />{item.label}
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
  );
}
