# Backend setup + wiring (≈ 25 min)

## A. Supabase (10 min)
1. supabase.com → New project (note the DB password; region closest to you).
2. **SQL Editor → New query → paste `supabase/schema.sql` → Run.** (Tested: tables, RLS, 9 RPCs, realtime publication.)
3. **Authentication → Sign In / Providers → Anonymous Sign-Ins → ON.**  (customers join with zero signup)
4. **Authentication → Sign In / Providers → Email → turn "Confirm email" OFF.**  (default mail is heavily rate-limited; you don't want a provider locked out mid-demo)
5. **Authentication → Rate Limits:** raise sign-ins per IP (venue Wi-Fi = one shared IP for all judges).
6. **Authentication → Users → Add user** → provider@demo.com + password, tick *Auto Confirm User*.
7. **Project Settings → API:** copy Project URL + publishable/anon key.
   (Optional check: Database → Publications → `supabase_realtime` lists `queues` and `tokens`.)

## B. Frontend (5 min)
```bash
npm i @supabase/supabase-js react-router-dom qrcode.react
cp .env.example .env     # paste URL + key
```
Copy `src/lib/*` and `src/hooks/*` into your project. Restart `npm run dev` after editing `.env`.

## C. Wire the screens
**Join button (keeps your idle → spinner → ✓ micro-interaction, now driven by the real call):**
```tsx
const [st, setSt] = useState<'idle'|'joining'|'done'>('idle')
async function onJoin() {
  setSt('joining')
  try { await joinQueue(queueId, name); setSt('done'); setTimeout(() => nav(`/ticket/${queueId}`), 1200) }
  catch (e: any) { toast(e.message); setSt('idle') }
}
```
**Ticket / hero screen:**
```tsx
const { queue, live } = useQueue(id)
const { token } = useMyToken(id)
const now = useNow()
const NOTIFY_AT = 3
const ahead = token && queue ? aheadOf(token.number, queue) : 0
const eta = queue ? etaSecs(ahead, queue, now) : 0
const turn = turnState(token, ahead, NOTIFY_AT)          // 'waiting' | 'near' | 'now' | 'finished'
useNotifyOnTurn({ enabled: notifyOn, tokenId: token?.id, ahead, threshold: NOTIFY_AT,
                  isNow: turn === 'now', label: queue && token ? label(queue.prefix, token.number) : '' })

<section data-turn={turn}>                                  {/* CSS swaps Joey's animation per state */}
  <h2>You're <em>{token ? label(queue.prefix, token.number) : '—'}</em></h2>
  <p>{ahead} ahead · {fmtEta(eta)}</p>
  <div className={live ? 'animate-ping …' : '…'} />          {/* radar = connected */}
  <div style={{ width: `${progressOf(ahead, token?.ahead_at_join ?? 0) * 100}%` }} />  {/* progress bar */}
</section>
```
**Notify toggle (permission must be requested inside the click):**
`onClick={async () => setNotifyOn(await enableNotifications())}`

**Provider console:**
```tsx
const { queue } = useQueue(id); const tokens = useProviderTokens(id)
<button onClick={() => callNext(id)}>Call next</button>
<button onClick={() => skipCurrent(id)}>No-show</button>
<button onClick={() => issueWalkin(id, name)}>Walk-in</button>
<button onClick={() => setQueueStatus(id, queue.status === 'open' ? 'paused' : 'open')}>Pause</button>
<QRCodeSVG value={`${location.origin}/q/${id}`} />
```
Create your first queue once from the console: `createQueue('City Clinic OPD', 'Rewa', 'C')`.

## D. Test checklist (do this before you polish anything)
- [ ] Phone/incognito tab = customer; normal tab = provider. Join → token appears instantly.
- [ ] Provider "Call next" → customer's `ahead` / ETA / mascot state update with no refresh.
- [ ] Join twice → friendly "already have a token" error.
- [ ] Cancel → everyone behind moves up by one.
- [ ] Toggle notifications → at `ahead == 3` and at "your turn" you get toast + sound (+ vibrate on Android).
- [ ] Turn Wi-Fi off/on on the customer phone → state heals (refetch on reconnect).
- [ ] `simulateCrowd(id, 20)` for the demo; `resetQueue(id)` between runs.

## E. Deploy
Vercel → import repo → Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` → Deploy.
SPA routing: add `vercel.json` → `{"rewrites":[{"source":"/(.*)","destination":"/"}]}` so `/q/:id` deep links (QR codes) work.
