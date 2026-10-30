"use client";

import { useCallback, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api";
import { ensureAuthenticated } from "@/lib/auth";

type ApiData<T> = {
  data: T | null;
  loading: boolean;
  error: string;
  reload: () => void;
};

export function useApiData<T>(path: string, authenticated = false): ApiData<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    const load = async () => {
      try {
        if (authenticated && !(await ensureAuthenticated())) throw new Error("Требуется авторизация");
        const result = await apiRequest<T>(path);
        if (active) setData(result);
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Не удалось загрузить данные");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, [authenticated, path, version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);
  return { data, loading, error, reload };
}
