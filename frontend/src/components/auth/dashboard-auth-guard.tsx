"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { ensureAuthenticated } from "@/lib/auth";

export function DashboardAuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const checkStartedRef = useRef(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (checkStartedRef.current) return;
    checkStartedRef.current = true;

    void ensureAuthenticated().then((isAuthenticated) => {
      if (isAuthenticated) {
        setAuthenticated(true);
        return;
      }

      const nextPath = pathname.startsWith("/dashboard") ? pathname : "/dashboard";
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
    });
  }, [pathname, router]);

  if (!authenticated) {
    return (
      <div
        aria-label="Проверка авторизации"
        aria-live="polite"
        className="flex min-h-[100dvh] items-center justify-center bg-canvas"
        role="status"
      >
        <span className="size-8 animate-spin rounded-full border-[3px] border-[#D8DDF8] border-t-brand" />
        <span className="sr-only">Проверяем авторизацию…</span>
      </div>
    );
  }

  return children;
}
