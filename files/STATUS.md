# Raktify — STATUS (read first, update last)

## What exists (before this conversion)
- Vite + React + TS + Tailwind v3 + supabase-js app on Vercel, converted to Raktify blood-donor matching platform.
- Old queue tables/RPCs cleanup in supabase/migrations/000_drop_queue_app.sql.
- Stitch design export found and unzipped. Zip path: `raktify-pack-v2.zip.zip` (mascot imported from `animated_svg_2/code.html`).

## What we are building
- Raktify: blood-donor matching (location + blood group) for verified urgent requests and consenting donors. Not an emergency service. Full spec: docs/SPEC.md (read only named sections).
- Decisions: queue app replaced in place; UI design system kept; Boond (from Stitch zip) replaces the pink circle, Joey the sun stays; single-page app with no redirects; AuthSheet in place; donor + receiver medical forms stored in Supabase private RLS tables; eligibility + compatibility are deterministic SQL; Gemini (Supabase Edge Functions, key only in Supabase secrets) does intake parsing, outreach drafts, verifier flags, donor coach — advisory only.

## Progress  (agent: tick boxes, add 1-line notes)
- [ ] 000 drop-queue migration run (by user)
- [x] A  Shell + auth + Boond mascot import + profiles migration
  - Imported Boond mascot verbatim with calm/hopeful/celebrating stages; built persistent AppShell, disclaimer banner, 5-tab nav, AuthSheet with in-place gating, role-aware Home, removed queue code, wrote 000 & 001 migrations.
- [ ] B  Donor side: wizard, eligibility, directory
- [ ] C  Request wizard, verifier console, matching, tracker, share link
- [ ] D  Gemini Edge Functions + fallback + polish + README/DEMO

## Next
B

## Gotchas / user-side steps pending
- User must run `000_drop_queue_app.sql` then `001_profiles.sql` in Supabase SQL editor.
- Gemini key NOT created yet (needed only for D).
- Supabase: "Confirm email" off; Anonymous sign-ins on; Vercel env only VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.
- Agent must not run supabase/vercel CLI; list commands for the user.
- Boond mascot: VERBATIM import from Stitch zip `raktify-pack-v2.zip.zip` (no stand-in used).
