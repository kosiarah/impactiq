# ImpactIQ — Bug & Risk Audit
_Generated: 2026-05-27 · Updated: 2026-05-27 after stress test session_

---

## 🔴 CRITICAL — Fix before any real users

| ID | File | Issue | Fix |
|----|------|-------|-----|
| C1 | `server/routes/analytics.js:17,98` | `?days=-30` queries future (confirmed — returns 0 orders). `?days=0` silently coerces to 90. **`?days=999999999` crashes the server with a full Node.js stack trace (file paths, line numbers) sent to the browser.** | `let days = parseInt(req.query.days); if (isNaN(days) \|\| days <= 0 \|\| days > 3650) days = 90` |
| C2 | `server/routes/insights.js:145` | Full Anthropic SDK error leaked in response `detail` field — exposes request IDs, internal error types (confirmed live). | Log server-side; return only `{ error: 'Failed to generate insights' }` |
| C3 | `server/routes/auth.js:17-19` | Any caller can mint a valid JWT for any `shopDomain` (confirmed live — `evil.com` accepted). | Ignore request body: hardcode `const shopDomain = 'dev-store.myshopify.com'` |
| C4 | `client/vite.config.js:6-9` | Vite proxy is dev-only. Production build breaks all `/api/` calls (404). | Add `VITE_API_BASE_URL` env var; use in `api.js`: `` fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/...`) `` |
| C5 | `server/db/schema.sql` | No `shop_id` on any table — all merchant data is global. Multi-tenancy is impossible without this. | Add `shop_id TEXT NOT NULL` + index to `orders`, `order_charities`, `charities`. Filter all queries by `req.merchant.shopDomain`. |
| C6 | `server/index.js` | No rate limiting on `POST /api/insights/generate` — anyone authenticated can drain Claude credits in seconds. | `npm install express-rate-limit`; apply per-shopDomain limiter (e.g. 5 req/hour). |
| C7 | `server/index.js` (startup) | `JWT_SECRET` not validated at boot — if missing, `undefined` signs all tokens valid. | Add at startup: `if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be set')` |
| C8 | `server/package.json` | No production start script, no process manager — server crash = permanent downtime. | Add `"start": "node index.js"`; use PM2 or deploy to Railway/Render/Fly.io. |

---

## 🟠 HIGH — Fix before Week 3

| ID | File | Issue | Fix |
|----|------|-------|-----|
| H1 | `server/routes/analytics.js` | Both endpoints have `try/finally` but no `catch` — DB error = client hangs forever. | Add `catch (err) { res.status(500).json({ error: 'Database error' }) }` before `finally`. |
| H2 | `server/routes/insights.js:138-140` | Claude JSON parsed with no validation — malformed response crashes endpoint. | Wrap `JSON.parse` in try/catch; validate `Array.isArray(insights) && insights.length === 5`. |
| H3 | `server/routes/insights.js:92-96` | If a source has 0 orders (e.g. no mobile orders), `find()` returns `undefined` → Claude prompt contains `"undefined%"`. | Fallback: `|| { total: 0, with_charity: 0 }` and `|| { name: 'N/A', selections: 0, avg_aov: 0 }`. |
| H4 | `client/src/components/Overview.jsx`, `CharityBreakdown.jsx` | No `AbortController` in `useEffect` — rapid `days` clicks fire concurrent requests; stale response wins silently. | Add `AbortController`; return cleanup `() => controller.abort()`. |
| H5 | `client/src/App.jsx` | No React Error Boundary — any component crash = full white screen. | Create `<ErrorBoundary>` class component; wrap each screen. |
| H6 | `client/src/components/Overview.jsx:108` | `(charityAOV - baselineAOV) / baselineAOV` → `Infinity` if `baselineAOV === 0`. | Guard: `data.baselineAOV > 0 ? ... : null`; render "N/A" when null. |
| H7 | `client/src/components/CharityBreakdown.jsx:90` | ~~`completed_orders / total_selections` → `Infinity` if `total_selections === 0`.~~ **FALSE POSITIVE — guard already exists at line 89-92.** | N/A |
| H8 | `server/index.js:12` | `app.use(cors())` allows all origins — any website can call the API with credentials. | `app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' }))` |
| H9 | `client/src/components/AIInsights.jsx:258-268` | ~~Context strip hardcoded — shows wrong numbers for any real merchant or `days` value.~~ **✅ FIXED** — now fetches from `GET /api/analytics/overview`. | Done |
| H10 | `client/src/api.js`, `App.jsx` | `apiFetch` dispatches `window.dispatchEvent('impactiq:unauthorized')` on 401, but nothing in the app listens for it. Expired/invalid tokens fail silently — user sees a raw error rather than being prompted to re-authenticate. | Add `window.addEventListener('impactiq:unauthorized', ...)` in `App.jsx`; show a session-expired message or trigger re-auth. |
| H11 | `client/src/components/AIInsights.jsx:207-209` | Stats fetch (overview data for context strip) silently swallows all errors with `.catch(() => {})` — user sees "—" for every stat with no indication of failure. | Catch and set an error state; show a subtle warning below the strip. |
| H12 | `client/src/components/Overview.jsx`, `CharityBreakdown.jsx` | When a fetch fails, the error banner renders **above** the chart/skeleton sections but `loading` is set to false — chart skeletons stop pulsing but remain visible alongside the error, cluttering the page. | On error, set `data` to `null` and don't render the chart/summary sections when `error` is set. |

---

## 🟡 MEDIUM — Fix before production launch

| ID | File | Issue | Fix |
|----|------|-------|-----|
| M1 | `server/routes/analytics.js`, `insights.js` | New `better-sqlite3` connection opened per request — inefficient under load. | Create one connection at module load; reuse it. |
| M2 | `server/db/seed.js` vs `schema.sql` | Seed uses `sql.js` without `UNIQUE` constraint on `shopify_order_id` that `schema.sql` defines. | Align seed with schema or document the discrepancy. |
| M3 | `client/src/App.jsx:107-120` | No debounce on `days` selector — rapid clicks fire simultaneous API requests. | Debounce `setDays` by ~300ms. |
| M4 | `client/src/components/AIInsights.jsx:200` | `lastRefreshed` initializes to "Just now" — shows before first fetch, and stays "Just now" even after failed refresh. | Init to `null`; show "Fetching…" while loading; update to real timestamp on success; show "Failed" on error. |
| M5 | `Overview.jsx`, `CharityBreakdown.jsx` | No empty state when API returns 0 results (e.g. `?days=1` with no data). Charts render blank. | Check `timeSeries.length === 0` / `charities.length === 0`; render empty state card. |
| M6 | `.github/workflows/claude.yml` | Workflow triggered by any commenter; `contents: write` permission. Broad attack surface. | Add `if: github.actor == github.repository_owner` condition to job. |
| M7 | `client/` | Production bundle 599 KB (167 KB gzipped) — all Recharts chart types bundled together. | Code-split `CharityBreakdown` with dynamic `import()`. |
| M8 | Backend (all routes) | No structured logging — failed requests, slow queries, and auth failures leave no trace. | Add `pino` or `morgan` for structured HTTP logging. |
| M9 | `server/routes/auth.js:13`, `.env.example` | `NODE_ENV` never set — production gate (`=== 'production'`) always fails, dev endpoint stays open everywhere. | Add `NODE_ENV=development` to `.env.example`; set explicitly in deploy. |

---

## 🟢 LOW — Polish / future-proofing

| ID | File | Issue | Fix |
|----|------|-------|-----|
| L1 | `Overview.jsx` | `CustomTooltip` recreated every render | `React.memo(CustomTooltip)` |
| L2 | `AIInsights.jsx` | `useEffect` deps suppressed with `eslint-disable` | Use `useCallback` for `handleRefresh` |
| L3 | `insights.js:133` | `'claude-sonnet-4-6'` hardcoded | `process.env.CLAUDE_MODEL \|\| 'claude-sonnet-4-6'` |
| L4 | `client/index.html` | No favicon | Add favicon |
| L5 | `client/index.html` | No Content-Security-Policy | Add CSP meta tag |
| L6 | `server/db/schema.sql` | Missing composite index `(completed, created_at)` on orders | Add for faster filtered joins |
| L7 | `client/package.json` | Vite 5 has moderate CVE (path traversal, CWE-22) | Upgrade Vite to ≥8.0.14 |
| L8 | `App.jsx` | ~~"Last synced: 2 minutes ago" hardcoded~~ **✅ FIXED** — now shows live relative timestamp updated every 30s. | Done |
| L9 | `App.jsx` | Settings and Bell buttons have no `onClick` | Stub with "Coming soon" toast |
| L10 | `CharityBreakdown.jsx` | `topCategory` column removed but space still exists | Restore from API or remove the grid column |

---

## Week 3 / 4 Architecture Gaps (not bugs — missing features)

| Gap | Effort | Needed by |
|-----|--------|-----------|
| Shopify OAuth (replace dev `/api/auth/token`) | High | Week 3 |
| `shop_id` on all DB tables + query filtering | High | Week 3 |
| Shopify webhook handlers (`orders/create` sync) | High | Week 3 |
| Real order data replacing seeded SQLite | Medium | Week 3 |
| Rate limiting on insights endpoint (C6 above) | Low | Week 3 |
| Stripe payment processing ($29–49/mo subscriptions) | High | Week 4 |
| Subscription tier enforcement (usage limits) | Medium | Week 4 |
| SQLite → PostgreSQL migration (concurrent writes) | High | Pre-launch |
| PM2 / cloud deploy config (C8 above) | Medium | Pre-launch |
| `VITE_API_BASE_URL` for production frontend (C4 above) | Low | Week 3 |

---

## Live Test Results (2026-05-27, updated after stress test)

| Endpoint / Scenario | Result |
|---------------------|--------|
| `GET /api/health` | ✅ Healthy |
| `POST /api/auth/token` | ✅ Issues JWT |
| `GET /api/analytics/overview?days=90` | ✅ Real data |
| `GET /api/analytics/charities?days=90` | ✅ All 5 charities |
| Auth middleware (no token / bad token) | ✅ Returns 401 |
| `npm run build` | ✅ Succeeds (599 KB chunk) |
| `?days=-30` | ❌ Returns 0 orders (future window not rejected) |
| `?days=0` | ❌ Silently coerces to 90 |
| `?days=999999999` | ❌ **500 crash — full stack trace with file paths sent to browser** |
| `POST /api/insights/generate` (error path) | ❌ Full Anthropic SDK error (incl. request ID) leaked in `detail` |
| `POST /api/auth/token` with `shopDomain: "evil.com"` | ❌ Accepted, signed into JWT |
| Frontend with server down — Overview | ⚠️ Red banner shown, but raw `TypeError: Failed to fetch` displayed |
| Frontend with server down — Charity Performance | ⚠️ Same as above |
| Frontend with server down — AI Insights | ✅ Falls back to cached insights gracefully |
| `baselineAOV = 0` in Overview | ❌ Renders "Infinity%" in KPI card and summary row |
| Retry button (Overview / Charity Performance) | ✅ FIXED — added this session |
| "Last synced" sidebar | ✅ FIXED — live relative timestamp this session |
| AIInsights context strip | ✅ FIXED — wired to API this session |

---

## Current Git State

- **`main` (local + remote):** `b265903` — Week 2 complete (frontend wired to API, JWT auth, days selector)
- **Uncommitted changes (this session):** retry buttons on Overview + CharityBreakdown, live "Last synced" in sidebar, AIInsights context strip wired to API.
