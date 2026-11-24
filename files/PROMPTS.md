# Raktify — prompts for the coding agent (free-quota edition)

## Where the files go (unzip into the repo ROOT, keep folder names)
    .agents/rules/raktify.md
    docs/SPEC.md   docs/STATUS.md   docs/PROMPTS.md
    supabase/migrations/000_drop_queue_app.sql
ALSO: put your Stitch zip inside the repo (e.g. design/stitch/raktify_stitch.zip) BEFORE running item A.
Run 000_drop_queue_app.sql in the Supabase SQL Editor first (destructive: old queue site stops working).

## How to use
New chat per item. Paste BOOT first, then ONE item prompt (A, B, C, D) in order. Items B-D start only after the previous item is ticked in docs/STATUS.md.

---------------------------------------------------------------------
## BOOT (paste at the start of every new chat)
Read .agents/rules and docs/STATUS.md first. Do ONLY the item under "Next", using the prompt I paste after this. Read only the SPEC.md sections it names. When done: tick the box in STATUS.md, set "Next" to the following item, add one-line notes for anything unfinished, then reply in max 8 lines (files changed, commands I must run, gaps). If you are running low on context or quota, stop at a clean point and write exactly what remains into STATUS.md instead of leaving half-finished files.

---------------------------------------------------------------------
## ITEM A — shell, auth, Boond mascot from the Stitch zip
Item A. Read docs/SPEC.md §1-§5 (mascot procedure is in §3: follow it exactly). Convert this repo in place:
1) Rename to Raktify (title/meta/manifest/copy).
2) MASCOT: find the Stitch zip in this repo, unzip to design/stitch/, locate the finished animated blood-drop mascot with grep (do not read whole files), and port it VERBATIM as src/components/mascots/BoondMascot.tsx + src/styles/mascots.css with identical animations (props: size, stage calm|hopeful|celebrating). Replace every pink-circle mascot usage with it; add it to the onboarding intro next to Joey, the Home hero, and empty states. Record the zip path in STATUS.md. Do NOT redraw or simplify it. If no zip/mascot is found after one search, use a stand-in and note TODO-replace-with-stitch-mascot in STATUS.md.
3) Persistent AppShell + disclaimer banner + existing bottom nav (Home, Donors, Request, Tracker, Me).
4) AuthSheet: sign up (email, password, name, phone, role pick), sign in, magic link, forgot password, in-place gating that resumes the interrupted action; role-aware Home placeholder.
5) Delete queue screens/hooks/api once unused (keep useNow, notification helpers, animations); vercel.json SPA rewrite.
6) Migration 001_profiles.sql: profiles(roles text[]), private_contacts, signup trigger, RLS, RPC set_my_roles that rejects 'verifier'.

## ITEM B — donor side
Item B. Read docs/SPEC.md §6, §7, §9 and the donor parts of §12. Migration 002_donor.sql (postgis, donor_profiles, donor_health, eligibility_rules with TODO-VERIFY defaults, abo_compat, evaluate_donor, save_donor_profile, search_donors, set_availability, withdraw_consent, delete_my_data, export_my_data, RLS) plus supabase/seed_raktify.sql (30 fake donors) and a short supabase/tests/donor_rls.sql. Frontend: donor wizard with autosave + consent, result screen (empty slot for the Gemini coach; Boond/Joey reactions), Donors directory with filters, privacy actions in Me.

## ITEM C — requests, verification, tracker
Item C. Read docs/SPEC.md §8, §10, §13 and the request parts of §12. Migration 003_requests.sql (blood_requests, request_patient_medical, request_matches, audit_log, requisitions bucket, RLS, RPCs submit_request, verify_request, match_donors, respond_to_match, reveal_contact, mark_fulfilled, cancel_request, request_status). Every state change is ONE UPDATE on the request row. Frontend: request wizard with autosave, verifier console, donor inbox, tracker (stage stepper, progress bar, the imported BoondMascot reacting via stage prop), /r/:share_token page, notifications hook.

## ITEM D — Gemini, polish, demo (create the Gemini key first)
Item D. Read docs/SPEC.md §11, §15, §16. Create Supabase Edge Functions agent-intake, agent-outreach, agent-verifier-assist, agent-donor-coach (verify_jwt, client from caller's Authorization header, Gemini REST with GEMINI_API_KEY and GEMINI_MODEL from Deno.env, structured JSON, 8s timeout, CORS, per-user rate limit via agent_calls in migration 004, {fallback:true} when the key is missing or Gemini fails). Add a regex fallback parser in the frontend. Wire Smart fill (user must confirm), outreach drafts, verifier flags, donor coach. Then README, DEMO.md, ASSUMPTIONS.md, a 390px mobile pass, and ONE short browser check of the demo flow (max 3 screenshots).

---------------------------------------------------------------------
## Gemini key (by hand, right before item D)
1. Google AI Studio -> Get API key. Pick a CURRENT Flash-class model and check its free-tier limits (per model, per project). Note the exact model name.
2. After `supabase login` and `supabase link --project-ref <ref>` once:
       supabase secrets set GEMINI_API_KEY=<key> GEMINI_MODEL=<model-name>
       supabase functions deploy agent-intake
       supabase functions deploy agent-outreach
       supabase functions deploy agent-verifier-assist
       supabase functions deploy agent-donor-coach
3. NEVER put the key in Vercel, .env, or any VITE_ variable.

## Free-quota habits
- One item per chat. Paste only 10 lines of any error. Commit after every item.
- Fast mode for A, C, D; Planning mode only for B (schema). Browser testing only at the end of D.
- If the agent stops mid-item because quota ran out, open a new chat, paste BOOT + the same item prompt: STATUS.md tells it what is left.
