# Raktify rules (always on)
- Start every chat by reading docs/STATUS.md; finish by updating it (tick box, set Next, 1-line notes).
- Product: Raktify (blood-donor matching). This repo is being CONVERTED IN PLACE from the old queue app: delete/replace queue screens, hooks, and copy freely. No legacy folder needed.
- Keep the same Supabase project, URL, keys and auth config. Backend changes go in supabase/migrations/ (000_drop_queue_app.sql already exists; new tables use numbered migrations after it).
- Never change the UI design system (tokens, fonts, colours, nav, animations). Reuse existing components. The blood-drop mascot "Boond" already exists in the Stitch export zip inside this repo: IMPORT it (see SPEC §3), never redraw it. It replaces the pink circle; keep Joey the sun.
- SPA only: no window.location redirects or full reloads. Auth is an in-place AuthSheet that resumes the interrupted action.
- The LLM never decides blood compatibility or eligibility (deterministic SQL only). Gemini key lives ONLY in Supabase secrets, never in client code or Vercel env.
- Health data only in private RLS tables; never returned by directory/tracker RPCs. Reveal phone only after donor accepts; audit it.
- Show on every screen: "Prototype — not an emergency medical service. In an emergency call 112."
- TOKEN DISCIPLINE: read only files you need (never node_modules, lockfiles, dist). Small diffs, never reprint whole files. No plan/walkthrough artifacts unless I ask. Do NOT run supabase/vercel CLI; list the commands for me. Verify with `npx tsc --noEmit` and `npm run build` once per phase. Final reply max 10 lines: changed files / commands for me / known gaps. Stop after the phase.
