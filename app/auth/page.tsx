"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  forgotPassword as requestResetOtp,
  getCurrentUser,
  login,
  logout,
  register,
  resendVerificationOtp,
  resetPassword as confirmResetPassword,
  verifyEmailOtp
} from "@/services/authService";
import type { AuthUser } from "@/types";

export default function AuthPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [verificationCooldown, setVerificationCooldown] = useState(0);
  const [resetCooldown, setResetCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVerificationCooldown((current) => (current > 0 ? current - 1 : 0));
      setResetCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const nextUser = await login({ email, password });
      setUser(nextUser);
      router.push("/dashboard");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const result = await register({ name, email, password });
      setNotice(result.message || "Registration successful. Please verify your email before logging in.");
      setPendingVerificationEmail(email.trim());
      setVerificationCooldown(60);
      setName("");
      setPassword("");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const verificationEmail = pendingVerificationEmail || email;
      const result = await verifyEmailOtp({ email: verificationEmail, otp });
      setNotice(result.message || "Email verified successfully.");
      setOtp("");
      setPendingVerificationEmail("");
      const nextUser = result.user || getCurrentUser();
      if (nextUser) {
        setUser(nextUser);
        router.push("/dashboard");
      }
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const verificationEmail = pendingVerificationEmail || email;
      const result = await resendVerificationOtp({ email: verificationEmail });
      setNotice(result.message || "Verification OTP sent.");
      setVerificationCooldown(60);
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : "Unable to resend OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPasswordOtp() {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const result = await requestResetOtp({ email });
      setNotice(result.message || "Reset OTP sent.");
      setResetCooldown(60);
    } catch (forgotError) {
      setError(forgotError instanceof Error ? forgotError.message : "Unable to send reset OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPasswordWithOtp() {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const result = await confirmResetPassword({
        email,
        otp: resetOtp,
        password: resetPasswordValue
      });
      setNotice(result.message || "Password reset successful. Please log in.");
      setResetOtp("");
      setResetPasswordValue("");
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  }

  function handleSignOut() {
    logout();
    setUser(null);
  }

  return (
    <div className="section-shell">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Authentication</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">Sign in to save decisions, goals, roadmaps, and focus sessions.</h1>
          <p className="text-lg text-muted-foreground">
            PathPilot now uses custom JWT authentication backed by Express and MongoDB, while keeping the same product flow.
          </p>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">What gets saved</p>
            <p className="mt-2">Users, goals, roadmaps, decisions, and focus sessions are now stored in MongoDB collections through the Express API.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{user ? "Account" : "Welcome back"}</CardTitle>
            <CardDescription>
              {user ? "Your JWT session is active." : "Log in or create an account to unlock synced history."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {user ? (
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-muted-foreground">Signed in as</p>
                  <p className="mt-2 text-lg font-medium">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href="/dashboard">Open dashboard</Link>
                  </Button>
                  <Button variant="secondary" onClick={handleSignOut}>
                    Sign out
                  </Button>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="space-y-4">
                  <Input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
                  <Input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <Button className="w-full" onClick={() => void handleLogin()} disabled={loading}>
                    Login with email
                  </Button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${showForgotPassword ? "max-h-80 translate-y-0 opacity-100" : "pointer-events-none max-h-0 -translate-y-2 opacity-0"}`}
                  >
                    <div className="space-y-3 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-muted-foreground">Forgot password with OTP</p>
                      <Input type="text" placeholder="Reset OTP" value={resetOtp} onChange={(event) => setResetOtp(event.target.value)} />
                      <Input
                        type="password"
                        placeholder="New password"
                        value={resetPasswordValue}
                        onChange={(event) => setResetPasswordValue(event.target.value)}
                      />
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => void handleForgotPasswordOtp()}
                          disabled={loading || resetCooldown > 0 || !email.trim()}
                        >
                          {resetCooldown > 0 ? `Send reset OTP (${resetCooldown}s)` : "Send reset OTP"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => void handleResetPasswordWithOtp()}
                          disabled={loading || !email.trim() || !resetOtp.trim() || !resetPasswordValue.trim()}
                        >
                          Reset password
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowForgotPassword(false)} disabled={loading}>
                          Back to login
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="signup" className="space-y-4">
                  <Input type="text" placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
                  <Input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
                  <Input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
                  <Button className="w-full" onClick={() => void handleRegister()} disabled={loading}>
                    Create account
                  </Button>
                  <div className="space-y-3 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-muted-foreground">Verify email with OTP</p>
                    <Input
                      type="text"
                      placeholder="6-digit OTP"
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
                    />
                    <div className="flex flex-wrap gap-3">
                      <Button type="button" variant="secondary" onClick={() => void handleVerifyOtp()} disabled={loading || !otp.trim()}>
                        Verify OTP
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => void handleResendOtp()}
                        disabled={loading || verificationCooldown > 0 || !(pendingVerificationEmail || email).trim()}
                      >
                        {verificationCooldown > 0 ? `Resend OTP (${verificationCooldown}s)` : "Resend OTP"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            {notice ? <p className="text-sm text-emerald-300">{notice}</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
