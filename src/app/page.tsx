import Link from "next/link";

const highlights = [
  {
    title: "Anonymous by default",
    description:
      "People can send honest thoughts without exposing identity, while you stay in control of what reaches your inbox.",
  },
  {
    title: "Inbox control",
    description:
      "Pause or reopen message intake anytime from your dashboard with one toggle.",
  },
  {
    title: "AI icebreakers",
    description:
      "Generate thoughtful starter questions instantly when you want more meaningful responses.",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#fff8ef_0%,#e9f8f3_45%,#eef4ff_100%)] px-4 py-8 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute -left-16 top-20 h-52 w-52 rounded-full bg-[#f97316]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-56 w-56 rounded-full bg-[#0f766e]/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#2563eb]/15 blur-3xl" />

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 rounded-3xl border border-black/10 bg-white/70 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-10 lg:p-12">
        <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-5">
            <p className="inline-flex w-fit items-center rounded-full border border-black/15 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#0f766e]">
              Anonymous Platform
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-[#102a43] sm:text-5xl lg:text-6xl">
              Collect honest feedback
              <span className="block text-[#0f766e]">without social pressure.</span>
            </h1>
            <p className="max-w-2xl text-base text-slate-700 sm:text-lg">
              Share one personal link, receive anonymous messages, and manage your inbox with strict verification and privacy controls.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#0f766e] px-5 text-sm font-semibold text-white transition hover:bg-[#0b5f59]"
            >
              Create Account
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Sign In
            </Link>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((item, index) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm"
              style={{ animation: `fade-in-up 420ms ease ${index * 120}ms both` }}
            >
              <h2 className="text-lg font-semibold text-[#102a43]">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
