import { clearAuthSession, getStoredUser, storeAuthSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api-client";
import type { AuthUser } from "@/types";

type AuthResponse = {
  token: string;
  user: AuthUser;
};

type RegisterResponse = {
  user: AuthUser;
  message?: string;
};

type VerifyOtpResponse = {
  message?: string;
  token?: string;
  user?: AuthUser;
};

export async function register(payload: { name: string; email: string; password: string }) {
  const data = await apiFetch<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  return data;
}

export async function login(payload: { email: string; password: string }) {
  const data = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  storeAuthSession(data.token, data.user);
  return data.user;
}

export async function verifyEmailOtp(payload: { email: string; otp: string }) {
  const data = await apiFetch<VerifyOtpResponse>("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  if (data.token && data.user) {
    storeAuthSession(data.token, data.user);
  }

  return data;
}

export async function resendVerificationOtp(payload: { email: string }) {
  const data = await apiFetch<VerifyOtpResponse>("/api/auth/resend-verification-otp", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  return data;
}

export async function forgotPassword(payload: { email: string }) {
  return apiFetch<VerifyOtpResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function resetPassword(payload: { email: string; otp: string; password: string }) {
  return apiFetch<VerifyOtpResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function logout() {
  clearAuthSession();
}

export function getCurrentUser() {
  return getStoredUser();
}
