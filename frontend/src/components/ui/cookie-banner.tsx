"use client";

import { Cookie, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "campus_space_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        const timer = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable or restricted
    }
  }, []);

  const saveConsent = (choice: "all" | "necessary" | "dismissed") => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, choice);
    } catch {
      // ignore
    }
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 250);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Уведомление об использовании файлов cookie"
      aria-live="polite"
      className={`fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-[500px] overflow-hidden rounded-[20px] border border-[#E1E5EA] bg-white/95 p-5 shadow-[0_18px_40px_rgba(28,36,52,0.16)] backdrop-blur-md transition-all duration-300 sm:bottom-6 sm:right-6 sm:left-auto sm:p-6 ${
        closing ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
      }`}
      role="dialog"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF0FF] text-brand">
            <Cookie aria-hidden className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-ink sm:text-base">Мы используем файлы cookie</h2>
            <p className="text-[11px] font-medium text-[#667085]">Для стабильной и быстрой работы сервиса</p>
          </div>
        </div>
        <button
          aria-label="Закрыть уведомление"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#98A2B3] transition-colors hover:bg-[#F2F4F7] hover:text-ink"
          onClick={() => saveConsent("dismissed")}
          type="button"
        >
          <X className="size-4" />
        </button>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[#475467]">
        CampusSpace использует файлы cookie для сохранения авторизации, выбранных фильтров на карте этажей и анализа работы платформы. Подробнее в нашей{" "}
        <Link
          className="font-semibold text-brand underline decoration-brand/35 underline-offset-2 transition-colors hover:text-brand-hover hover:decoration-brand"
          href="/privacy"
        >
          Политике конфиденциальности
        </Link>
        .
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          className="h-10 rounded-xl border border-[#D5DBE3] bg-white px-4 text-xs font-semibold text-[#475467] transition hover:bg-[#F5F6FF] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
          onClick={() => saveConsent("necessary")}
          type="button"
        >
          Только необходимые
        </button>
        <button
          className="h-10 rounded-xl bg-brand px-5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          onClick={() => saveConsent("all")}
          type="button"
        >
          Принять все
        </button>
      </div>
    </aside>
  );
}
