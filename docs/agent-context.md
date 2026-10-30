# Agent context

## Project

AFRICA is a Portuguese-language marketing agency site and interactive briefing app. The home route `/` contains the audio-led briefing, the `/painel` route administers integration keys, and the landing page is rendered by `CinematicScrol`.

## Runtime boundaries

- The project uses React 19, TanStack Start, Vite, and Nitro. Production in Coolify runs on Node/Railpack; Cloudflare bindings are a separate supported runtime.
- API handlers in `src/server.ts` must read Cloudflare's `env` bindings and Node's `process.env` so admin authentication works in both runtimes.
- Admin integration keys are encrypted with `ADMIN_SESSION_SECRET`. Node storage defaults to `/data/africa-briefing-keys.json`; keep `/data` mounted persistently in Coolify. Cloudflare may provide the `AFRICA_SETTINGS` KV binding.
- Never commit, print, or write credentials into source, docs, generated graph files, or logs.

## Experience constraints

- Keep the intro and landing video layers isolated from briefing content and form interaction.
- The landing is a scroll-driven story. Keep ordinary scrolling continuous; avoid full-page snap behavior. Preload upcoming video scenes and preserve a visible scene until its successor can crossfade.
- Narration is the timing source for spoken text. Use each word's deadline from `src/lib/narration.ts`; never add a minimum duration that delays a word past its slot.

## Delivery

The repository is connected to Lovable and Coolify. The user asked for a commit/push and automatic deployment after each completed change. Keep the configured main branch deployable, verify the Coolify deployment when credentials are available, and do not rewrite published history.

This file is a navigation aid. Verify live behavior and configuration in source and the relevant service before relying on it.
