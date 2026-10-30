import { apiRequest } from "@/lib/api";

type RefreshResponse = { access_token: string };

export function getSafeRedirectPath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;

  try {
    const url = new URL(value, "http://campus-space.local");
    if (url.origin !== "http://campus-space.local") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export async function ensureAuthenticated() {
  const accessToken = window.localStorage.getItem("access_token");

  if (accessToken) {
    try {
      await apiRequest("/auth/me");
      return true;
    } catch {
      // The access token may have expired. Try the HttpOnly refresh cookie below.
    }
  }

  try {
    const result = await apiRequest<RefreshResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({}),
    });
    window.localStorage.setItem("access_token", result.access_token);
    return true;
  } catch {
    window.localStorage.removeItem("access_token");
    return false;
  }
}
