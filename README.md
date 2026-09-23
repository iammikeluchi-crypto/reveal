# reveal. — Phase 1

"Don't just send an invitation. Send an experience."

This is the Phase 1 slice of the **reveal.** invitation SaaS, wired to your
existing Supabase project (`yjrzsodhefwulxueumwh`):

Auth (magic link) → Create invitation → Save draft → Publish → `/i/[slug]`
guest page → RSVP → Dashboard with stats.

## What's real, not a mockup

- **Auth**: Supabase email magic-link sign-in (`/login`), session refreshed
  in `middleware.ts`, `/create` and `/dashboard` are gated server-side.
- **Create**: `/create` writes a real row into `invitations` (status
  `draft`), generates a unique `slug`, then a separate action flips
  `status` to `published`.
- **Guest page**: `/i/[slug]` reads the invitation *only if published*
  (relies on your existing RLS policy `public read published invitations`).
  Fires a view event + increments `views` via your existing
  `increment_invitation_metric` RPC.
- **RSVP**: guest form inserts into `rsvps` and logs an `rsvp` event —
  both already allowed for anonymous users by your RLS policies, scoped to
  published invitations only.
- **WhatsApp share**: opens `wa.me` with a prefilled message containing the
  invitation link, and logs a `share` event.
- **Dashboard**: `/dashboard` lists the signed-in owner's invitations with
  views/shares/RSVP counts, pulled live from Supabase (owner-only via RLS).

I checked your live project directly and confirmed: RLS is enabled on all
five tables, the owner/guest policies already match what this app needs,
`handle_new_user` already populates `profiles` on signup, and
`increment_invitation_metric(p_invitation_id, p_metric)` already exists as
a `SECURITY DEFINER` RPC for view/share counts. Nothing needed to change on
the database side for Phase 1. (Minor note: a few tables have duplicate,
near-identically-named policies — harmless, but worth cleaning up later so
`pg_policies` isn't cluttered.)

## What's intentionally NOT in this slice

Per the brief's phasing, these are Phase 2+ and not built yet:
- Media upload (cover/gallery/video/music/logo) to Supabase Storage
- Cinematic opening / envelope-seal / scratch-to-reveal / countdown
- Calendar (.ics) / directions-map integration
- QR code generation
- Payments, admin dashboard, custom domains
- Google login (magic link only for now)

## Running it yourself

This container has no network access, so the app hasn't been installed,
built, or deployed from here — you'll need to do that locally or in your
own CI:

```bash
npm install
cp .env.local.example .env.local   # already filled with your publishable key
npm run dev
```

Then visit `http://localhost:3000`.

## Deploying

Push to a repo and deploy on Vercel (or similar). Set the three env vars
from `.env.local.example` in your hosting provider — most importantly
`NEXT_PUBLIC_SITE_URL` should be your real domain, since it's used to build
the invitation link that gets shared on WhatsApp.

## Security notes

- Only the Supabase **publishable** key is used anywhere in this code —
  never the `service_role` key.
- All data access is enforced by your existing Postgres RLS policies, not
  by app-layer checks — so even if a route were misconfigured, an
  anonymous guest still can't read another customer's drafts or RSVPs.
- If you ever need privileged operations (e.g. an admin panel), that
  belongs in a server-only route using the `service_role` key from an
  environment variable that is never exposed to the client — do not add it
  to `NEXT_PUBLIC_*`.

## Password authentication setup

Phase 1 now supports password sign-in, magic-link sign-in, and password reset.

In Supabase Dashboard:
1. Authentication → Providers → Email: keep Email provider enabled.
2. Authentication → URL Configuration → set the Site URL to your production app URL.
3. Add the production app URL and the password-reset callback URL to Additional Redirect URLs. For this deployment use:
   - `https://reveal-flame.vercel.app`
   - `https://reveal-flame.vercel.app/auth/callback`
4. If you use a custom domain later, add its equivalent URLs as well.

In Vercel, ensure these public environment variables are configured:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

`NEXT_PUBLIC_SITE_URL` should equal the deployed reveal. origin, without a trailing slash.

No Supabase service-role key is required by the browser application.
