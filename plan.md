# Project Completion Plan

## Current Baseline
1. Main app UI is still starter template in `src/app/page.tsx`.
2. Auth APIs exist, but dashboard and public messaging pages are missing from `src/app`.
3. There is a field mismatch bug risk in username check route: `src/app/api/check-username-unique/route.ts` uses `isVerified` while model uses `isverified` in `src/models/user.ts`.
4. Lint is not clean yet in `src/app/api/auth/[...nextauth]/options.ts`, `src/app/api/accept-messages/route.ts`, `src/app/api/suggest-messages-openai/route.ts`, and `src/types/nexr-auth.d.ts`.
5. README is still default boilerplate in `README.md`.

## Phase 1: Stabilize Core (Day 1-2)
1. Fix lint and type issues until `npm run lint` is clean.
2. Standardize user field names across model and API routes.
3. Add environment validation for MongoDB, NextAuth, Resend, and OpenAI keys.
4. Remove debug logs and tighten error handling responses.

Definition of done:
1. Lint passes.
2. No known model/API naming mismatch.
3. App fails fast with clear env errors.

## Phase 2: Complete Auth Flow (Day 2-4)
1. Build Sign Up page UI and connect to `src/app/api/sign-up/route.ts`.
2. Build Verify page UI and connect to `src/app/api/verify-code/route.ts`.
3. Improve Sign In UX in `src/app/(auth)/sign-in/page.tsx` with better error and loading states.
4. Ensure middleware route protection logic is correct in `src/middleware.ts`.

Definition of done:
1. New user can sign up, receive OTP, verify, and sign in end-to-end.

## Phase 3: Dashboard and Messaging Product Flow (Day 4-7)
1. Build protected dashboard route and UI under `src/app/dashboard`.
2. Add message acceptance toggle using `src/app/api/accept-messages/route.ts`.
3. Add public profile route for anonymous submissions, for example `src/app/u/[username]/page.tsx`.
4. Add missing message APIs for create/read messages and connect to `src/models/user.ts`.

Definition of done:
1. Authenticated user can manage inbox settings.
2. Public user can send anonymous messages.
3. Owner can view received messages.

## Phase 4: AI Suggestions and UX Polish (Day 7-8)
1. Integrate suggestions UI with `src/app/api/suggest-messages-openai/route.ts`.
2. Add robust JSON parsing and fallback handling for AI response.
3. Add empty, loading, and error states for key screens.
4. Unify styling using Shadcn components across auth, dashboard, and messaging pages.

Definition of done:
1. AI prompts work reliably and do not break UI on malformed output.

## Phase 5: Security and Quality (Day 8-9)
1. Rate limit sensitive endpoints: sign-up, verify-code, suggest-messages-openai.
2. Harden validation for all request bodies and query params.
3. Add tests:
	- Unit tests for schemas.
	- Integration tests for core APIs.
	- One E2E happy path (sign-up -> verify -> sign-in -> receive message).

Definition of done:
1. Critical endpoints are protected against abuse.
2. Core flows are covered by automated tests.

## Phase 6: Production Readiness (Day 10)
1. Replace boilerplate README with setup, env vars, architecture, API summary, and deploy guide in `README.md`.
2. Add deployment checklist for Vercel envs, database URI, NextAuth URL/secret, and email domain.
3. Final QA pass and release tag.

Definition of done:
1. A new developer can clone, configure, and run the project using README only.

## Execution Priority
1. Lint and type cleanup plus field-name consistency.
2. Sign Up and Verify pages.
3. Dashboard plus public message submission flow.
4. AI suggestions and UX polish.
5. Tests and deployment docs.
