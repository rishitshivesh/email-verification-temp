export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";
export const APP_BASENAME = (import.meta.env.VITE_APP_BASENAME ?? "/empver").replace(/\/$/, "") || "/";
export const DEFAULT_LOGIN_REDIRECT = import.meta.env.VITE_DEFAULT_LOGIN_REDIRECT ?? "/dashboard";

export const ACCESS_TOKEN_STORAGE_KEY = "magic-link.accessToken";
export const USER_STORAGE_KEY = "magic-link.user";

export function buildAppUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const basePath = APP_BASENAME === "/" ? "" : APP_BASENAME;
  return new URL(`${basePath}${normalizedPath}`, window.location.origin).toString();
}
