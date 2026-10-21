import {
  ArrowLeft,
  Cookie,
  Database,
  FileCheck2,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata = {
  title: "Политика конфиденциальности — CampusSpace",
  description: "Порядок обработки и защиты персональных данных пользователей сервиса CampusSpace в соответствии с 152-ФЗ.",
};

const dataCategories = [
  {
    title: "Учетные данные",
    description: "Фамилия, имя, академическая роль (студент/преподаватель) и корпоративный адрес почты @university.ru.",
    icon: UserCheck,
  },
  {
    title: "Данные о бронированиях",
    description: "История заявок, выбранные помещения, временные интервалы, факт явки, отзывы и рейтинги пространств.",
    icon: FileCheck2,
  },
  {
    title: "Технические данные и Cookie",
    description: "IP-адрес, тип браузера, сессионные cookie для авторизации, выбранные фильтры и масштаб карты.",
    icon: Cookie,
  },
  {
    title: "Безопасность и шифрование",
    description: "Хранение на серверах дата-центра университета в РФ с защитой каналов передачи данных по протоколу TLS.",
    icon: Lock,
  },
];

const articles = [
  {
    title: "1. Общие положения",
    text: "Настоящая Политика конфиденциальности определяет порядок обработки и защиты информации о физических лицах, пользующихся университетской платформой бронирования учебных пространств CampusSpace. Оператором персональных данных является Университет. Использование сервиса означает полное согласие пользователя с настоящей Политикой.",
  },
  {
    title: "2. Правовые основания и цели обработки",
    text: "Обработка персональных данных осуществляется в соответствии с Федеральным законом РФ № 152-ФЗ «О персональных данных» и локальными нормативными актами университета. Персональные данные обрабатываются исключительно в целях: предоставления доступа к бронированию аудиторий, коворкингов и лабораторий; идентификации пользователя; координации расписания и направления уведомлений о статусе броней.",
  },
  {
    title: "3. Неразглашение и передача третьим лицам",
    text: "Университет не продает, не передает и не предоставляет персональные данные пользователей третьим лицам в коммерческих или рекламных целях. Доступ к данным имеют исключительно уполномоченные сотрудники университета (администраторы сервиса, коменданты корпусов и сотрудники деканата) в рамках выполнения своих служебных обязанностей.",
  },
  {
    title: "4. Сроки хранения и безопасность",
    text: "Персональные данные хранятся в течение всего периода обучения или трудовых отношений пользователя с университетом, а также в течение сроков, установленных архивным законодательством РФ. Для защиты данных применяются современные средства сетевой защиты, шифрование трафика (HTTPS/TLS) и разграничение прав доступа на уровне баз данных.",
  },
  {
    title: "5. Использование файлов cookie",
    text: "Сервис CampusSpace использует файлы cookie для поддержания активной пользовательской сессии, сохранения выбранного корпуса и этажа на карте, а также для сбора обезличенной аналитики посещаемости. Пользователь может в любой момент отключить или очистить cookie в настройках своего браузера, однако это может повлиять на удобство использования личного кабинета.",
  },
  {
    title: "6. Права пользователя",
    text: "Пользователь имеет право на получение сведений о своих обрабатываемых персональных данных, требование их уточнения, блокирования или уничтожения в случае, если данные являются неполными или устаревшими. Отзыв согласия на обработку данных осуществляется по письменному заявлению либо путем обращения в службу поддержки.",
  },
];

export default function PrivacyPage() {
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
          <span className="text-ink">Политика конфиденциальности</span>
        </nav>

        <header className="mt-6 border-b border-[#E4E7EC] pb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F8F5] px-3 py-1 text-xs font-semibold text-accent">
            <ShieldCheck className="size-3.5" />
            Безопасность и защита данных
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Политика конфиденциальности
          </h1>
          <p className="mt-2 text-sm text-[#667085] sm:text-base">
            Как CampusSpace собирает, использует и бережно хранит ваши персональные данные в строгом соответствии с 152-ФЗ.
          </p>
          <p className="mt-2 text-xs font-medium text-[#98A2B3]">
            Действует с октября 2026 года · Редакция 1.1
          </p>
        </header>

        {/* Информационные карточки */}
        <section aria-label="Категории обрабатываемых данных" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dataCategories.map((item) => {
            const Icon = item.icon;
            return (
              <div className="rounded-2xl border border-[#E4E7EC] bg-white p-5 shadow-xs" key={item.title}>
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#F5F6FF] text-brand">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-ink">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#667085]">{item.description}</p>
              </div>
            );
          })}
        </section>

        {/* Разделы политики */}
        <section className="mt-10 space-y-6">
          {articles.map((art) => (
            <article className="rounded-2xl border border-[#E4E7EC] bg-white p-6 sm:p-7" key={art.title}>
              <h2 className="text-lg font-bold text-ink sm:text-xl">{art.title}</h2>
              <p className="mt-3 text-xs leading-relaxed text-[#475467] sm:text-sm">{art.text}</p>
            </article>
          ))}
        </section>

        {/* Контакты уполномоченного лица */}
        <section className="mt-10 rounded-2xl border border-[#E4E7EC] bg-[#F8F9FA] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Database className="size-5 text-brand" />
            <h2 className="text-base font-bold text-ink sm:text-lg">Вопросы по обработке персональных данных</h2>
          </div>
          <p className="mt-2 text-xs text-[#667085] sm:text-sm">
            Если у вас возникли вопросы относительно хранения или удаления ваших данных, направьте запрос уполномоченному лицу по защите информации:
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold sm:text-sm">
            <a className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 border border-[#E4E7EC] text-brand hover:border-brand" href="mailto:privacy@campus-space.university.ru">
              <Mail className="size-4" />
              privacy@campus-space.university.ru
            </a>
            <span className="text-[#667085]">Отдел защиты информации университета</span>
          </div>
        </section>
      </main>

      <SiteFooter bordered />
    </div>
  );
}
