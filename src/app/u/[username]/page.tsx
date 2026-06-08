"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

interface ProfileStatus {
  exists: boolean;
  isAcceptingMessages: boolean;
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const decodedUsername = decodeURIComponent(username);

  const [profile, setProfile] = useState<ProfileStatus | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Check if user exists and is accepting messages
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(
          `/api/user-status?username=${encodeURIComponent(decodedUsername)}`
        );
        const data = await res.json();
        setProfile({
          exists: data.exists ?? false,
          isAcceptingMessages: data.isAcceptingMessages ?? false,
        });
      } catch {
        setProfile({ exists: true, isAcceptingMessages: true }); // optimistic fallback
      } finally {
        setLoadingProfile(false);
      }
    };
    check();
  }, [decodedUsername]);

  const handleSuggest = async () => {
    setLoadingSuggestions(true);
    setSuggestions([]);
    try {
      const res = await fetch("/api/suggest-messages-openai", { method: "POST" });
      const text = await res.text();
      const match = text.match(/\[[\s\S]*?\]/);
      if (match) {
        const parsed: unknown = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          setSuggestions(parsed.filter((s) => typeof s === "string"));
        }
      }
    } catch {
      // silent — suggestions are optional
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/send-message?username=${encodeURIComponent(decodedUsername)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to send message.");
      } else {
        setSubmitted(true);
        setContent("");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0f766e] border-t-transparent" />
      </div>
    );
  }

  if (!profile?.exists) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="text-center">
          <p className="text-6xl font-bold text-slate-200">404</p>
          <h1 className="mt-2 text-xl font-semibold text-slate-800">User not found</h1>
          <p className="mt-1 text-sm text-slate-500">
            <span className="font-mono">@{decodedUsername}</span> doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-10 items-center rounded-xl bg-[#0f766e] px-5 text-sm font-semibold text-white transition hover:bg-[#0b5f59]"
          >
            Go home
          </Link>
        </div>
      </main>
    );
  }

  if (!profile.isAcceptingMessages) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-800">Inbox closed</h1>
          <p className="mt-2 text-sm text-slate-500">
            <span className="font-semibold">@{decodedUsername}</span> is not accepting
            messages right now.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-10 items-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Create your own inbox →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-12 flex items-start justify-center">
      <div className="pointer-events-none fixed -top-24 -left-24 h-72 w-72 rounded-full bg-[#0f766e]/10 blur-3xl" />
      <div className="pointer-events-none fixed -right-20 bottom-10 h-80 w-80 rounded-full bg-[#f97316]/10 blur-3xl" />

      <div className="relative w-full max-w-xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#0f766e]/10">
            <svg className="h-7 w-7 text-[#0f766e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Send a message to{" "}
            <span className="text-[#0f766e]">@{decodedUsername}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Your message is 100% anonymous. They will never know who sent it.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Message sent!</h2>
              <p className="text-sm text-slate-500">
                Your anonymous message was delivered.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 rounded-xl bg-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b5f59]"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Your anonymous message
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={5}
                  maxLength={500}
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/20"
                  placeholder="Write something honest and kind…"
                />
                <p className="text-right text-xs text-slate-400">
                  {content.length}/500
                </p>
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="w-full rounded-xl bg-[#0f766e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0b5f59] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending…" : "Send Anonymously"}
              </button>
            </form>
          )}
        </div>

        {/* AI suggestions */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">
              Need inspiration?
            </p>
            <button
              onClick={handleSuggest}
              disabled={loadingSuggestions}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {loadingSuggestions ? "Generating…" : "✨ Suggest prompts"}
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setContent(s); setSubmitted(false); }}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-left text-xs text-slate-700 transition hover:border-[#0f766e] hover:text-[#0f766e]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          Want your own anonymous inbox?{" "}
          <Link href="/sign-up" className="font-semibold text-[#0f766e] hover:text-[#0b5f59]">
            Create a free account
          </Link>
        </p>
      </div>
    </main>
  );
}
