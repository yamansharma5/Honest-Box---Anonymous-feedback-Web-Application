# HonestBox

A simple Next.js college project for receiving anonymous feedback through a public profile link. Users create an account, verify their email, share their link, and read messages from their private dashboard.

## Problem Statement

People often avoid giving honest feedback when their identity is visible. This can make it difficult for students, creators, teams, or individuals to collect genuine opinions and suggestions.

This project solves that problem by providing a simple anonymous feedback platform where users can share one public link and receive private messages without exposing the sender's identity.

## Main Features

- Anonymous public feedback submission
- Secure message storage in MongoDB
- Credentials authentication with NextAuth
- Email verification with Resend
- Private dashboard for reading and deleting messages
- Inbox open/close toggle

## Tech Stack

- Next.js App Router
- React
- TypeScript
- MongoDB with Mongoose
- NextAuth
- Resend
- Tailwind CSS

## Environment Variables

Create a `.env` file locally and add these values:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=HonestBox <verify@your-verified-domain.com>
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: only needed for AI message suggestions
OPENAI_API_KEY=sk-your_openai_api_key
```

For production, set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your deployed app URL.
In Resend, add and verify your own sending domain, then set `RESEND_FROM_EMAIL` to an address on that verified domain, for example `HonestBox <verify@example.com>`. Do not use `onboarding@resend.dev` for real users; Resend only allows that testing domain to send to your own Resend account email.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Check

Run these before deploying:

```bash
npm run lint
npm run build
```

## Recommended Deployment

Use **Vercel** for this project. It is the best fit because the app is built with Next.js, supports API routes easily, and has simple environment variable management.

Suggested services:

- App hosting: Vercel
- Database: MongoDB Atlas
- Email: Resend

After deployment, add the Vercel domain to:

- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Also make sure MongoDB Atlas allows connections from Vercel. For a college project, allowing access from `0.0.0.0/0` is common and simple, but a stricter IP/network setup is better for production.
