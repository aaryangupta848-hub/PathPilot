import type { AuthUser } from "@/types";

const TOKEN_KEY = "pathpilot_token";
const USER_KEY = "pathpilot_user";
const AUTH_EVENT = "pathpilot-auth-change";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function storeAuthSession(token: string, user: AuthUser) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAuthSession() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function getAuthToken() {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  if (!canUseStorage()) {
    return null;
  }

  const rawUser = window.localStorage.getItem(USER_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch (error) {
    clearAuthSession();
    return null;
  }
}

export function subscribeToAuthChanges(callback: () => void) {
  if (!canUseStorage()) {
    return () => undefined;
  }

  window.addEventListener(AUTH_EVENT, callback);
  return () => window.removeEventListener(AUTH_EVENT, callback);
}
