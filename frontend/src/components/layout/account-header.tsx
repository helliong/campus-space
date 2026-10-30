"use client";

import { Bell } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/ui";
import { useApiData } from "@/hooks/use-api-data";
import { cn } from "@/lib/cn";
import { formatRole, initials } from "@/lib/format";
import type { User } from "@/lib/types";

type AccountHeaderProps = {
  active: "spaces" | "bookings";
};

const navigation = [
  { href: "/spaces", label: "Пространства", id: "spaces" },
  { href: "/dashboard/bookings", label: "Мои бронирования", id: "bookings" },
] as const;

export function AccountHeader({ active }: AccountHeaderProps) {
  const { data: user } = useApiData<User>("/auth/me", true);

  return (
    <header className="border-b border-[#E4E7EC] bg-white">
      <div className="mx-auto flex min-h-20 w-full max-w-[1600px] items-center gap-8 px-5 sm:px-8 lg:px-[clamp(48px,4vw,72px)]">
        <Logo className="shrink-0" href="/dashboard" />
        <nav aria-label="Навигация личного кабинета" className="hidden items-center gap-10 md:flex">
          {navigation.map((item) => (
            <Link
              aria-current={active === item.id ? "page" : undefined}
              className={cn(
                "text-sm font-semibold transition-colors hover:text-ink",
                active === item.id ? "text-brand" : "text-[#667085]",
              )}
              href={item.href}
              key={item.id}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <button aria-label="Уведомления" className="relative flex size-10 items-center justify-center rounded-xl bg-canvas text-[#667085] transition-colors hover:text-ink" type="button">
            <Bell aria-hidden className="size-4" />
          </button>
          <Link aria-label="Открыть личный кабинет" className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35" href="/dashboard">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EEF0FF] text-xs font-bold text-brand">{user ? initials(user.full_name) : ""}</span>
            <span className="hidden min-w-[86px] sm:block">
              <span className="block max-w-[150px] truncate text-xs font-semibold text-ink">{user?.full_name ?? "Профиль"}</span>
              <span className="mt-0.5 block text-[10px] text-[#667085]">{user ? formatRole(user.role) : ""}</span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
