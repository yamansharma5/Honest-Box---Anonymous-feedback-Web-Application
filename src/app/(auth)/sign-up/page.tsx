"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "error";

export default function SignUpPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [usernameMsg, setUsernameMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const checkUsername = useCallback(async (value: string) => {
    const valid = /^[a-zA-Z0-9_]{2,20}$/.test(value);
    if (!valid) {
      setUsernameStatus("invalid");
      setUsernameMsg("2–20 characters, letters, numbers, and underscores only");
      return;
    }
    setUsernameStatus("checking");
    setUsernameMsg("");
    try {
      const res = await fetch(
        `/api/check-username-unique?username=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      setUsernameStatus(data.success ? "available" : res.status >= 500 ? "error" : "taken");
      setUsernameMsg(data.message);
    } catch {
      setUsernameStatus("error");
      setUsernameMsg("Could not check username right now.");
    }
  }, []);

  useEffect(() => {
    if (!username) {
      setUsernameStatus("idle");
      setUsernameMsg("");
      return;
    }
    const timer = setTimeout(() => checkUsername(username), 500);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus === "taken" || usernameStatus === "invalid") return;
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Sign-up failed. Please try again.");
      } else {
        router.push(`/verify/${encodeURIComponent(username)}`);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const usernameHintColor =
    usernameStatus === "available"
      ? "text-emerald-600"
      : usernameStatus === "taken" || usernameStatus === "invalid" || usernameStatus === "error"
      ? "text-red-600"
      : "text-slate-500";

  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-10 flex items-center justify-center">
      {/* Soft background blobs */}
      <div className="pointer-events-none fixed -top-24 -left-24 h-72 w-72 rounded-full bg-[#0f766e]/10 blur-3xl" />
      <div className="pointer-events-none fixed -right-20 bottom-10 h-80 w-80 rounded-full bg-[#f97316]/10 blur-3xl" />

      <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid lg:grid-cols-2">
        {/* Left panel */}
        <div className="flex flex-col justify-between bg-[#0f766e] p-8 text-white sm:p-10 lg:p-12">
          <div className="space-y-5">
            <p className="inline-flex w-fit items-center rounded-full border border-white/25 px-3 py-1 text-xs uppercase tracking-widest text-white/80">
              HonestBox
            </p>
            <h1 className="max-w-xs text-4xl font-semibold leading-tight sm:text-5xl">
              Your private inbox starts here.
            </h1>
            <p className="max-w-sm text-sm leading-7 text-white/75">
              Create your account, share one link, and start receiving honest
              anonymous feedback — entirely on your terms.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 text-sm text-white/80">
            <div className="rounded-xl border border-white/20 bg-white/10 p-3">
              <p className="text-2xl font-semibold text-white">Free</p>
              <p>No credit card needed</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3">
              <p className="text-2xl font-semibold text-white">100%</p>
              <p>Private by default</p>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex items-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 space-y-1">
              <h2 className="text-3xl font-semibold text-slate-900">Create account</h2>
              <p className="text-sm text-slate-500">
                Already have one?{" "}
                <Link
                  href="/sign-in"
                  className="font-semibold text-[#0f766e] hover:text-[#0b5f59]"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="off"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20 pr-10"
                    placeholder="your_handle"
                  />
                  {usernameStatus === "checking" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="block h-4 w-4 animate-spin rounded-full border-2 border-[#0f766e] border-t-transparent" />
                    </span>
                  )}
                  {usernameStatus === "available" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-lg">✓</span>
                  )}
                </div>
                {usernameMsg && (
                  <p className={`text-xs ${usernameHintColor}`}>{usernameMsg}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
                  placeholder="At least 6 characters"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || usernameStatus === "taken" || usernameStatus === "invalid"}
                className="w-full rounded-xl bg-[#0f766e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0b5f59] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Creating account…" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
