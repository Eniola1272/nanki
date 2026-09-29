This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Learning progress

Completed quizzes are recorded in `quiz_attempts` using the existing schema in
`supabase/setup.sql`. Built-in quizzes are materialized as private quiz rows with
stable, account-specific UUIDs before saving attempts. Progress no longer writes
`mastered_percentage`; best scores, accuracy, badges, streaks, and levels are
computed from the user's attempt history.

- Each completion earns 10 XP plus 2 XP per correct answer. Every 500 XP advances
  one level, starting at level 1. Retakes also earn XP; this is personal progress,
  not a competitive leaderboard.
- A streak counts distinct consecutive local study dates. Yesterday's streak stays
  active until today's opportunity is missed. Best streaks remain in history.
- The `answers` JSON column stores selections, the local completion date, and a
  quiz snapshot so past reviews survive edits. Earlier rows without snapshots
  retain their scores, but may lack answer-review detail.
- Completed attempts first enter an account-scoped browser cache. Pending records
  sync on completion, reload, reconnection, or manual retry. Stable attempt IDs
  prevent duplicate records or XP when retrying. Guests keep device-only records.
- Unfinished quizzes retain answers, question position, flags, and remaining timer
  on the same browser/device. Timers pause while away. Changing quiz questions
  invalidates the old draft. Retaking starts fresh.

`npm test` checks progression, streak boundaries, storage isolation, historical
snapshots, and the save/retry contract. `npm run build -- --webpack` is an alternate
build path for environments where Turbopack's worker ports are restricted.

Results that failed to save in earlier versions cannot be reconstructed from
scores that were never persisted. No historical progress is invented.
