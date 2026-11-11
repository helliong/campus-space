"use client";

import { Bell, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Logo } from "@/components/ui";
import { useApiData } from "@/hooks/use-api-data";
import { apiRequest } from "@/lib/api";
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
  const { data: user, reload: reloadUser } = useApiData<User>("/auth/me", true);
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  function cancelOpenTimer() {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }

  function scheduleProfileMenu() {
    cancelCloseTimer();
    if (isProfileMenuOpen || openTimerRef.current) return;
    openTimerRef.current = setTimeout(() => {
      setIsProfileMenuOpen(true);
      openTimerRef.current = null;
    }, 350);
  }

  function cancelCloseTimer() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function scheduleCloseProfileMenu() {
    cancelOpenTimer();
    if (closeTimerRef.current) return;
    closeTimerRef.current = setTimeout(() => {
      setIsProfileMenuOpen(false);
      closeTimerRef.current = null;
    }, 200);
  }

  function closeProfileMenu() {
    cancelOpenTimer();
    cancelCloseTimer();
    setIsProfileMenuOpen(false);
  }

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
        body: JSON.stringify({}),
      });
    } catch {
      // Clear the local session even if the server is temporarily unavailable.
    } finally {
      window.localStorage.removeItem("access_token");
      router.replace("/login");
      router.refresh();
    }
  }

  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("profile-updated", reloadUser);
    return () => window.removeEventListener("profile-updated", reloadUser);
  }, [reloadUser]);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    function dismissMenu() {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setIsProfileMenuOpen(false);
    }

    function handlePointerDown(event: PointerEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) dismissMenu();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismissMenu();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileMenuOpen]);

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
          <div
            className="relative"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) closeProfileMenu();
            }}
            onFocus={() => {
              cancelOpenTimer();
              cancelCloseTimer();
              setIsProfileMenuOpen(true);
            }}
            onMouseEnter={scheduleProfileMenu}
            onMouseLeave={scheduleCloseProfileMenu}
            ref={profileMenuRef}
          >
            <button
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
              aria-label="Открыть меню профиля"
              className="flex items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35"
              onClick={() => {
                cancelOpenTimer();
                cancelCloseTimer();
                setIsProfileMenuOpen(true);
              }}
              type="button"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#EEF0FF] text-xs font-bold text-brand">{user ? initials(user.full_name) : ""}</span>
              <span className="hidden min-w-[86px] sm:block">
                <span className="block max-w-[150px] truncate text-xs font-semibold text-ink">{user?.full_name ?? "Профиль"}</span>
                <span className="mt-0.5 block text-[10px] text-[#667085]">{user ? formatRole(user.role) : ""}</span>
              </span>
            </button>

            {isProfileMenuOpen ? (
              <div
                aria-label="Меню профиля"
                className="absolute right-0 top-[calc(100%+12px)] z-50 w-[220px] rounded-[14px] border border-[#E4E7EC] bg-white p-2 shadow-[0_14px_36px_rgba(16,24,40,0.14)] before:absolute before:-top-3 before:left-0 before:h-3 before:w-full before:content-['']"
                role="menu"
              >
                <Link
                  className="flex h-11 items-center gap-3 rounded-[10px] px-3 text-[13px] font-medium text-ink transition-colors hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none"
                  href="/dashboard/settings"
                  onClick={closeProfileMenu}
                  role="menuitem"
                >
                  <Settings aria-hidden className="size-4 text-[#667085]" />
                  Настройки
                </Link>
                <div className="my-1 border-t border-[#EAECF0]" role="separator" />
                <button
                  className="flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-left text-[13px] font-medium text-[#D92D20] transition-colors hover:bg-[#FEF3F2] focus-visible:bg-[#FEF3F2] focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  role="menuitem"
                  type="button"
                >
                  <LogOut aria-hidden className="size-4" />
                  {isLoggingOut ? "Выходим…" : "Выйти из аккаунта"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
