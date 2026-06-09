"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Toast from "@/components/Toast";

interface Message {
  _id: string;
  content: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isAccepting, setIsAccepting] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");

  const username = session?.user?.username ?? "";

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchMessages = useCallback(async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (data.success) setMessages(data.messages ?? []);
    } catch {
      showToast("Failed to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const fetchAcceptStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/accept-messages");
      const data = await res.json();
      if (data.success) setIsAccepting(data.isAcceptingMessages);
    } catch {
      // silent — default stays true
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/sign-in");
      return;
    }
    if (status === "authenticated") {
      fetchMessages();
      fetchAcceptStatus();
    }
  }, [status, router, fetchMessages, fetchAcceptStatus]);

  const handleToggle = async () => {
    setToggleLoading(true);
    try {
      const res = await fetch("/api/accept-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptMessages: !isAccepting }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAccepting((prev) => !prev);
        showToast(
          !isAccepting ? "Inbox is now open." : "Inbox is now closed."
        );
      }
    } catch {
      showToast("Failed to update setting.");
    } finally {
      setToggleLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // optimistic delete
    setDeletingId(id);
    const previous = messages;
    setMessages((prev) => prev.filter((m) => m._id !== id));
    try {
      const res = await fetch(`/api/messages?messageId=${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Delete failed");
      }
      showToast("Message deleted");
    } catch {
      setMessages(previous);
      showToast("Failed to delete message.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/u/${username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Could not copy link.");
    }
  };

  const handleSuggest = async () => {
    setSuggestions([]);
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/suggest-messages-openai", { method: "POST" });
      const text = await res.text();
      const match = text.match(/\[[\s\S]*?\]/);
      if (match) {
        const parsed: unknown = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          setSuggestions(parsed.filter((s) => typeof s === "string"));
        }
      } else {
        showToast("Could not parse suggestions. Try again.");
      }
    } catch {
      showToast("Failed to load suggestions.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0f766e] border-t-transparent" />
      </div>
    );
  }

  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/u/${username}`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      <Toast message={toast} open={!!toast} onClose={() => setToast("")} />

      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#0f766e] flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-800">AnonMsg</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:block">
              @{username}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Your Inbox
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage anonymous messages sent to your profile.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Sidebar controls ── */}
          <aside className="space-y-4 lg:col-span-1">
            {/* Profile link card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Your link
              </p>
              <p className="mb-3 break-all text-sm font-medium text-slate-800">
                {profileUrl}
              </p>
              <button
                onClick={handleCopyLink}
                className="w-full rounded-xl border border-slate-300 bg-white py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {copied ? "Copied ✓" : "Copy Link"}
              </button>
            </div>

            {/* Accept toggle card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Accepting messages
              </p>
              <p className="mb-4 text-sm text-slate-500">
                {isAccepting
                  ? "Your inbox is open. Anyone can send you messages."
                  : "Your inbox is closed. No new messages will be received."}
              </p>
              <button
                onClick={handleToggle}
                disabled={toggleLoading}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition focus:outline-none disabled:opacity-60 ${
                  isAccepting ? "bg-[#0f766e]" : "bg-slate-300"
                }`}
                aria-label="Toggle accepting messages"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    isAccepting ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* AI suggestions card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
                AI Prompts
              </p>
              <p className="mb-4 text-sm text-slate-500">
                Generate conversation starters to share with your audience.
              </p>
              <button
                onClick={handleSuggest}
                disabled={loadingSuggestions}
                className="w-full rounded-xl bg-[#0f766e] py-2 text-sm font-semibold text-white transition hover:bg-[#0b5f59] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingSuggestions ? "Generating…" : "Generate Suggestions"}
              </button>
              {suggestions.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          {/* ── Messages list ── */}
          <section className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">
                Messages{" "}
                {!loadingMessages && (
                  <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    {messages.length}
                  </span>
                )}
              </h2>
              <button
                onClick={fetchMessages}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>

            {loadingMessages ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#0f766e] border-t-transparent" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white text-center">
                <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-sm text-slate-400">No messages yet.</p>
                <p className="text-xs text-slate-400">Share your link to get started.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {messages.map((msg) => (
                  <li
                    key={msg._id}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-6 text-slate-800">{msg.content}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(msg._id)}
                      disabled={deletingId === msg._id}
                      className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                      aria-label="Delete message"
                    >
                      {deletingId === msg._id ? (
                        <span className="block h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
