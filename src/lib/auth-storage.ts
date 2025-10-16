import { ACCESS_TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "./config";

export interface StoredUser {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  createdAt?: string;
  lastLogin?: string;
}

function safeParseUser(value: string | null): StoredUser | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as StoredUser;
  } catch (error) {
    console.warn("Failed to parse stored user", error);
    return null;
  }
}

function storeValue(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  if (!value) {
    window.localStorage.removeItem(key);
    return;
  }
  window.localStorage.setItem(key, value);
}

export const authStorage = {
  getAccessToken() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  },
  setAccessToken(token: string | null) {
    storeValue(ACCESS_TOKEN_STORAGE_KEY, token);
  },
  getUser() {
    return safeParseUser(typeof window === "undefined" ? null : window.localStorage.getItem(USER_STORAGE_KEY));
  },
  setUser(user: StoredUser | null) {
    storeValue(USER_STORAGE_KEY, user ? JSON.stringify(user) : null);
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
  },
};
