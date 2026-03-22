import { clearAuthSession, getAuthToken } from "@/lib/auth-client";

export async function apiFetch<T>(path: string, init: RequestInit = {}, authenticated = false): Promise<T> {
  const headers = new Headers(init.headers || {});

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Please sign in to continue.");
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...init,
    headers
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }

    throw new Error(payload.error || "Something went wrong.");
  }

  return payload as T;
}
