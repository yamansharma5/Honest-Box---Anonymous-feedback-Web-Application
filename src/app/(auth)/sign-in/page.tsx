"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useMemo, useState } from "react";

export default function SignInPage() {
	const router = useRouter();
	const searchParams = useSearchParams();// The useSearchParams hook allows us to access query parameters from the URL. In this case, we are looking for a callbackUrl parameter that indicates where the user should be redirected after a successful sign-in. If the callbackUrl is not provided, we default to "/dashboard". By using useMemo, we ensure that the callbackUrl is only recalculated when the searchParams change, optimizing performance and preventing unnecessary re-renders.

	const callbackUrl = useMemo(
		() => searchParams.get("callbackUrl") || "/dashboard",
		[searchParams]
	);

	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setIsSubmitting(true);

		const result = await signIn("Credentials", {
			redirect: false,
			email: identifier,
			password,
			callbackUrl,
		});

		setIsSubmitting(false);

		if (result?.error) {
			setError(result.error);
			return;
		}

		router.push(result?.url || callbackUrl);
	};

	return (
		<main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_10%,#f6f3ea_0%,#efe6d6_30%,#d9ebe5_100%)] px-4 py-8 sm:px-6 lg:px-10">
			<div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#f97316]/20 blur-3xl" />
			<div className="pointer-events-none absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-[#0f766e]/20 blur-3xl" />

			<section className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-[0_24px_80px_rgba(16,24,40,0.18)] backdrop-blur-xl lg:grid-cols-2">
				<div className="relative flex flex-col justify-between bg-[#132a24] p-8 text-[#f4efe6] sm:p-10 lg:p-12">
					<div className="space-y-6">
						<p className="inline-flex w-fit items-center rounded-full border border-white/25 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#ffedd5]">
							Anonymous Platform
						</p>
						<h1 className="max-w-md text-4xl font-semibold leading-tight sm:text-5xl">
							Honest messages, zero pressure.
						</h1>
						<p className="max-w-md text-sm text-[#d6ddd8] sm:text-base">
							Sign in to open your private inbox, manage visibility, and keep
							conversations safe.
						</p>
					</div>

					<div className="mt-10 grid grid-cols-2 gap-3 text-sm text-[#dce4de]">
						<div className="rounded-xl border border-white/15 bg-white/5 p-3">
							<p className="text-2xl font-semibold text-[#ffe7cc]">24/7</p>
							<p>Protected access</p>
						</div>
						<div className="rounded-xl border border-white/15 bg-white/5 p-3">
							<p className="text-2xl font-semibold text-[#ffe7cc]">100%</p>
							<p>Private by default</p>
						</div>
					</div>
				</div>

				<div className="flex items-center p-6 sm:p-10 lg:p-12">
					<div className="w-full max-w-md">
						<div className="mb-8 space-y-2">
							<h2 className="text-3xl font-semibold text-[#1f2937]">Welcome back</h2>
							<p className="text-sm text-slate-600">
								Use your email or username and password to continue.
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-5">
							<label className="block space-y-2">
								<span className="text-sm font-medium text-slate-700">
									Email or Username
								</span>
								<input
									type="text"
									value={identifier}
									onChange={(event) => setIdentifier(event.target.value)}
									required
									className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/30"
									placeholder="you@example.com"
								/>
							</label>

							<label className="block space-y-2">
								<span className="text-sm font-medium text-slate-700">Password</span>
								<input
									type="password"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									required
									className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/30"
									placeholder="Enter your password"
								/>
							</label>

							{error && (
								<p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
									{error}
								</p>
							)}

							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full rounded-xl bg-[#0f766e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0b5f59] disabled:cursor-not-allowed disabled:opacity-70"
							>
								{isSubmitting ? "Signing in..." : "Sign In"}
							</button>
						</form>

						<p className="mt-6 text-sm text-slate-600">
							New here?{" "}
							<Link
								href="/sign-up"
								className="font-semibold text-[#0f766e] hover:text-[#0b5f59]"
							>
								Create an account
							</Link>
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}
