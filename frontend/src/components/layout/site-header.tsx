import Link from "next/link";

import { Logo } from "@/components/ui";

const navigation = [
  { href: "/how-it-works", label: "Как это работает", id: "how-it-works" },
  { href: "/spaces", label: "Пространства", id: "spaces" },
  { href: "/reviews", label: "Отзывы", id: "reviews" },
];

type SiteHeaderProps = { active?: "how-it-works" | "spaces" | "reviews" };

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className="border-b border-[#E4E7EC] bg-white">
      <div className="mx-auto flex min-h-20 w-full max-w-[1600px] items-center gap-6 px-5 sm:px-8 lg:px-[clamp(64px,4.5vw,88px)]">
        <Logo className="shrink-0" />
        <nav aria-label="Основная навигация" className="ml-0 hidden items-center gap-[52px] lg:flex">
          {navigation.map((item) => (
            <Link className={active === item.id ? "text-sm font-semibold text-brand" : "text-sm font-medium text-[#667085] transition-colors hover:text-ink"} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link className="inline-flex h-12 min-w-[104px] items-center justify-center rounded-xl border border-[#E4E7EC] bg-white px-5 text-sm font-semibold text-brand transition hover:bg-[#F5F6FF]" href="/login">
            Войти
          </Link>
          <Link className="hidden h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover sm:inline-flex" href="/register">
            Зарегистрироваться
          </Link>
        </div>
      </div>
      <nav aria-label="Навигация на мобильных устройствах" className="flex gap-6 overflow-x-auto border-t border-[#F0F2F5] px-5 py-3 lg:hidden">
        {navigation.map((item) => (
          <Link className={active === item.id ? "shrink-0 text-xs font-semibold text-brand" : "shrink-0 text-xs font-medium text-[#667085]"} href={item.href} key={item.href}>{item.label}</Link>
        ))}
      </nav>
    </header>
  );
}
