# Munsif AI Site

This is the Munsif AI website: a Next.js 14 (App Router) + TypeScript + Tailwind CSS app
with Convex as the backend, served on **port 3000**.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.4 (custom warm amber + deep teal palette)
- **Backend**: Convex (realtime DB + auth + serverless mutations)
- **Payments**: Cashfree (UPI, cards, netbanking)
- **i18n**: next-intl (English + Hindi)
- **Package Manager**: Bun

## Layout

```
convex/              # Convex backend (schema, auth, mutations)
src/
  app/               # Next.js App Router pages
    (auth)/          # Auth pages (login, signup)
    dashboard/       # Dashboard (overview, document selection, questionnaire)
    api/webhooks/    # Cashfree webhook handler
  components/        # Shared React components
  lib/               # Utilities, Convex client, PDF, Cashfree wrappers
  i18n/              # Translation files (en.json, hi.json)
  styles/            # Global Tailwind CSS
public/              # Static assets (logo, favicon)
```

## Running

```bash
bun run dev       # Start dev server on port 3000
bun run build     # Production build
bun run publish   # Build + start production server on port 3000
```

## Publishing

`bun run publish` builds the Next.js app and starts the production server on port 3000.
It always takes over port 3000 from whatever is running there.

## Color Palette

- **Primary**: Deep teal (#248374 — #1c544d)
- **Accent**: Warm saffron/amber (#ff9c36 — #c74d06)
- **Neutral**: Stone grays (#fafaf9 — #0c0a09)
