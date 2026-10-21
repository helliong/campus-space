import Link from "next/link";

import { cn } from "@/lib/cn";

const footerLinks = [
  { href: "/help", label: "Помощь" },
  { href: "/booking-rules", label: "Правила бронирования" },
  { href: "/privacy", label: "Политика конфиденциальности" },
  { href: "/contacts", label: "Контакты" },
];

export function SiteFooter({ bordered = false }: { bordered?: boolean }) {
  return (
    <footer className={cn("bg-white", bordered && "border-t border-[#E4E7EC]")}>
      <div className="mx-auto flex min-h-16 w-full max-w-[1600px] flex-col justify-center gap-3 px-5 py-5 text-xs font-medium text-[#667085] sm:px-8 md:flex-row md:items-center md:justify-between md:py-0 lg:px-[clamp(64px,4.5vw,88px)]">
        <p>© 2026 CampusSpace</p>
        <nav aria-label="Ссылки в подвале" className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {footerLinks.map((item, index) => (
            <span className="flex items-center gap-2" key={item.href}>
              {index > 0 && <span aria-hidden>·</span>}
              <Link className="hover:text-ink" href={item.href}>{item.label}</Link>
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
