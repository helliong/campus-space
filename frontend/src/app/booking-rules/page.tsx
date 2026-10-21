import {
  AlertCircle,
  ArrowLeft,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata = {
  title: "Правила бронирования — CampusSpace",
  description: "Регламент бронирования и использования аудиторий, коворкингов и лабораторий университета в CampusSpace.",
};

const quickRules = [
  { label: "Минимальный слот", value: "30 минут", icon: Clock3 },
  { label: "Максимум подряд", value: "4 часа", icon: CalendarCheck2 },
  { label: "Одновременных броней", value: "до 3 на человека", icon: Users },
  { label: "Бесплатная отмена", value: "за 15 мин до начала", icon: CheckCircle2 },
];

const sections = [
  {
    title: "1. Право доступа и авторизация",
    items: [
      "Сервис доступен действующим студентам, аспирантам, преподавателям и сотрудникам университета с верифицированной корпоративной почтой в домене @university.ru.",
      "Передача учетной записи третьим лицам строго запрещена. Пользователь несет персональную ответственность за сохранность помещения во время забронированного слота.",
    ],
  },
  {
    title: "2. Типы пространств и подтверждение",
    items: [
      "Обычные аудитории, переговорные и места в коворкинге бронируются автоматически и подтверждаются моментально.",
      "Специализированные лаборатории и компьютерные классы с ограниченным доступом бронируются «По заявке» и проходят модерацию куратором лаборатории (до 24 часов).",
      "Приоритет отдается плановым учебным занятиям и официальным университетским мероприятиям по расписанию деканата.",
    ],
  },
  {
    title: "3. Лимиты и правила использования",
    items: [
      "Бронирование доступно на глубину до 14 календарных дней вперед.",
      "Один пользователь может иметь не более 3 активных будущих бронирований одновременно.",
      "Продление слота возможно прямо из личного кабинета, если следующий временной интервал не занят другим пользователем.",
    ],
  },
  {
    title: "4. Отмена бронирования и No-Show Policy",
    items: [
      "Если ваши планы изменились, отмените бронь не позднее чем за 15 минут до ее начала, чтобы освободить место для других студентов.",
      "Правило неявки (No-Show): если пользователь не явился в аудиторию в течение первых 15 минут забронированного времени, слот автоматически аннулируется и становится доступным для бронирования.",
      "При накоплении 3 неявок без предварительной отмены в течение календарного месяца доступ к сервису бронирования приостанавливается на 7 дней.",
    ],
  },
  {
    title: "5. Правила нахождения в пространствах",
    items: [
      "Соблюдайте чистоту и порядок. По завершении встречи верните мебель в исходное состояние, сотрите записи с маркерной доски и выключите проектор.",
      "В компьютерных классах и рядом с лабораторными стендами запрещено употребление еды и открытых напитков.",
      "В тихих зонах коворкинга необходимо использовать наушники и переводить мобильные телефоны в бесшумный режим.",
      "При обнаружении неисправности оборудования немедленно сообщите дежурному администратору через личный кабинет.",
    ],
  },
];

export default function BookingRulesPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pb-16 pt-10 sm:px-8 lg:px-12">
        <nav aria-label="Хлебные крошки" className="flex items-center gap-2 text-xs font-medium text-[#667085]">
          <Link className="flex items-center gap-1.5 transition-colors hover:text-brand" href="/">
            <ArrowLeft className="size-3.5" />
            На главную
          </Link>
          <span aria-hidden>/</span>
          <span className="text-ink">Правила бронирования</span>
        </nav>

        <header className="mt-6 border-b border-[#E4E7EC] pb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF0FF] px-3 py-1 text-xs font-semibold text-brand">
            <Sparkles className="size-3.5" />
            Регламент сервиса CampusSpace
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Правила бронирования пространств
          </h1>
          <p className="mt-2 text-sm text-[#667085] sm:text-base">
            Ознакомьтесь с правилами использования аудиторий, коворкингов и лабораторий для комфортной совместной работы.
          </p>
          <p className="mt-2 text-xs font-medium text-[#98A2B3]">
            Редакция действует с октября 2026 года · Версия 1.2
          </p>
        </header>

        {/* Быстрые факты */}
        <section aria-label="Ключевые правила" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickRules.map((rule) => {
            const Icon = rule.icon;
            return (
              <div className="rounded-2xl border border-[#E4E7EC] bg-white p-5 shadow-xs" key={rule.label}>
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#EEF0FF] text-brand">
                  <Icon className="size-5" />
                </div>
                <p className="mt-3 text-xs font-medium text-[#667085]">{rule.label}</p>
                <strong className="mt-0.5 block text-base font-bold text-ink">{rule.value}</strong>
              </div>
            );
          })}
        </section>

        {/* Важная плашка */}
        <section className="mt-8 flex items-start gap-4 rounded-2xl border border-[#E8A317]/25 bg-[#FFF9EB] p-5 text-[#7A4D05]">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-[#E8A317]" />
          <div className="text-xs sm:text-sm">
            <strong className="font-bold">Уважайте время других студентов:</strong> Если мероприятие или занятие отменилось, отмените бронь в приложении заранее — это позволит другим занять освободившуюся аудиторию.
          </div>
        </section>

        {/* Разделы регламента */}
        <section className="mt-10 space-y-8">
          {sections.map((section) => (
            <article className="rounded-2xl border border-[#E4E7EC] bg-white p-6 sm:p-7" key={section.title}>
              <h2 className="text-lg font-bold text-ink sm:text-xl">{section.title}</h2>
              <ul className="mt-4 space-y-3">
                {section.items.map((item, idx) => (
                  <li className="flex items-start gap-3 text-xs leading-relaxed text-[#475467] sm:text-sm" key={idx}>
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        {/* Санкции и нарушения */}
        <section className="mt-8 rounded-2xl border border-[#D94A5C]/20 bg-[#FFF5F6] p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-5 text-[#D94A5C]" />
            <h2 className="text-base font-bold text-[#D94A5C] sm:text-lg">Ответственность за нарушения</h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#7A2731] sm:text-sm">
            В случае порчи оборудования, курения или оставления мусора администрация вправе аннулировать бронирование, заблокировать аккаунт в сервисе CampusSpace и передать информацию в деканат для применения дисциплинарных мер.
          </p>
        </section>

        {/* FAQ и Контакты */}
        <section className="mt-10 rounded-2xl border border-[#E4E7EC] bg-[#F8F9FA] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <HelpCircle className="size-5 text-brand" />
            <h2 className="text-base font-bold text-ink sm:text-lg">Остались вопросы?</h2>
          </div>
          <p className="mt-2 text-xs text-[#667085] sm:text-sm">
            По вопросам доступа к специализированным лабораториям и разрешению конфликтных ситуаций обращайтесь в диспетчерскую службу кампуса:{" "}
            <a className="font-semibold text-brand underline underline-offset-2 hover:text-brand-hover" href="mailto:support@campus-space.university.ru">
              support@campus-space.university.ru
            </a>{" "}
            или по внутреннему телефону <strong>21-40</strong>.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-xs font-semibold text-white transition hover:bg-brand-hover sm:text-sm" href="/spaces">
              Перейти к карте пространств
            </Link>
            <Link className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E4E7EC] bg-white px-5 text-xs font-semibold text-brand transition hover:bg-[#F5F6FF] sm:text-sm" href="/register">
              Создать аккаунт
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter bordered />
    </div>
  );
}
