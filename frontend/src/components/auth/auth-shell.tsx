import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  mode: "register" | "login";
  children: ReactNode;
};

const content = {
  register: {
    title: "Бронируйте место для учёбы — без лишних шагов",
    description: "Создайте аккаунт, чтобы находить свободные аудитории, столы в коворкингах и места с ПК.",
    benefits: ["Свободные места на интерактивной карте", "Бронирование от 30 минут", "Уведомления и управление бронями"],
  },
  login: {
    title: "С возвращением в CampusSpace",
    description: "Продолжайте планировать учёбу, встречи и совместные проекты в удобных пространствах кампуса.",
    benefits: ["Ваши бронирования всегда под рукой", "Напоминания о начале слота", "Доступ к любимым пространствам"],
  },
};

export function AuthShell({ mode, children }: AuthShellProps) {
  const page = content[mode];

  return (
    <main className="grid min-h-[100dvh] bg-canvas lg:grid-cols-[38.9%_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-brand px-14 py-12 text-white lg:flex lg:flex-col">
        <AuthLogo />
        <div className={mode === "register" ? "mt-[116px]" : "mt-[116px]"}>
          <h1 className="max-w-[410px] text-[38px] font-bold leading-[1.28] tracking-[-0.025em]">{page.title}</h1>
          <p className={mode === "register" ? "mt-14 max-w-[408px] text-[17px] leading-[1.45] text-[#E2E6FF]" : "mt-3 max-w-[408px] text-[17px] leading-[1.45] text-[#E2E6FF]"}>{page.description}</p>
          <div className={mode === "register" ? "mt-[76px] space-y-6" : "mt-[52px] space-y-6"}>
            {page.benefits.map((benefit, index) => (
              <div className="flex h-16 max-w-[424px] items-center rounded-[14px] bg-[#4555D1] px-5" key={benefit}>
                <Image alt="" height={16} src={index === 0 ? "/icons/auth-benefit-active.svg" : "/icons/auth-benefit.svg"} width={16} />
                <span className="ml-4 text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-auto text-xs font-medium text-[#C8D0FF]">CampusSpace · Университетская среда</p>
      </aside>

      <section className="flex min-h-[100dvh] items-center justify-center px-5 py-12 sm:px-8 lg:min-h-0">
        <div className="w-full max-w-[520px]">
          <div className="mb-8 flex justify-center lg:hidden"><AuthLogo dark /></div>
          {children}
        </div>
      </section>
    </main>
  );
}

function AuthLogo({ dark = false }: { dark?: boolean }) {
  return (
    <Link aria-label="CampusSpace — на главную" className="inline-flex items-center gap-3" href="/">
      <Image alt="" height={44} priority src={dark ? "/brand/campus-mark.png" : "/icons/auth-logo.svg"} width={44} />
      <span className={dark ? "text-[23px] text-ink" : "text-[23px] text-white"}>
        <strong className="font-bold">Campus</strong><span>Space</span>
      </span>
    </Link>
  );
}
