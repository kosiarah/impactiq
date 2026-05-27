# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is
Charity analytics SaaS for Shopify merchants running donation integrations (Conscious Cart, Shop for Good, etc.). Answers: "Is my charity tie-in actually driving conversions and AOV?" Monetization: $29–49/mo per store.

---

## Development Commands

```bash
# Frontend (port 5173)
cd client && npm install && npm run dev

# Backend (port 3001)
cd server
cp .env.example .env   # add ANTHROPIC_API_KEY
npm install
npm run dev            # uses --watch for auto-reload

# Reseed database (only if impactiq.db is missing)
cd server && npm run seed
```

There is no test suite yet.

---

## Stack
| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Backend | Node.js + Express (ESM, `"type": "module"`) |
| Database | SQLite via **better-sqlite3** (sync API) |
| AI | Anthropic Claude API — `claude-sonnet-4-6` |
| Charts | Recharts |
| Icons | lucide-react |
| Fonts | Syne (`font-display`) + DM Sans (`font-body`) via Google Fonts |

> ⚠️ **Do not switch to sql.js.** The routes use better-sqlite3's synchronous API throughout.

---

## Architecture

**Single-page app** — `App.jsx` manages a single `active` state string (`overview | charities | insights`) and renders one of three screen components. No router.

**Frontend → Backend**: The Vite dev server has **no proxy configured**. When wiring components to the API, either add a proxy in `vite.config.js` or use full URLs (`http://localhost:3001/api/...`). The `ANTHROPIC_API_KEY` must stay server-side only — never call the Anthropic SDK from the browser.

**Backend DB pattern**: Both route files (`routes/analytics.js`, `routes/insights.js`) open a new better-sqlite3 connection per request via `getDb()` and close it in a `finally` block. All SQL queries are synchronous.

**AI Insights flow** (`POST /api/insights/generate`):
1. `gatherMerchantStats()` runs ~6 SQL queries to build a merchant stats object
2. Stats are interpolated into a prompt string
3. Claude is called with `max_tokens: 2000`, expected to return a raw JSON array (no markdown fences)
4. Response is parsed and forwarded to the client

**Current state**: Frontend components (`Overview.jsx`, `CharityBreakdown.jsx`, `AIInsights.jsx`) still use **hardcoded static mock data** — they have not been wired to the backend REST API yet.

---

## API Endpoints
```
GET  /api/analytics/overview?days=90    # KPIs + weekly time series
GET  /api/analytics/charities?days=90   # per-charity breakdown
POST /api/insights/generate             # calls Claude, returns 5 insight objects
GET  /api/health
```

All analytics endpoints accept a `?days=` query param (default 90).

---

## Data Model
```sql
charities       (id, name, category, emoji)
orders          (id, shopify_order_id, created_at, total_price, completed, source, customer_id)
order_charities (id, order_id, charity_id, donation_amount)
```
- `source`: `web | mobile | pos`
- `completed`: `1` = converted, `0` = abandoned
- Pre-seeded `server/db/impactiq.db` is committed (1,380 orders, 90 days, 5 charities)

---

## AI Insights Response Schema
Claude must return a JSON array of exactly 5 objects:
```json
{
  "id": 1,
  "category": "revenue | mobile | timing | product | conversion",
  "priority": "urgent | high | medium",
  "title": "concise headline",
  "insight": "2-3 sentences of data-backed analysis",
  "action": "specific next step",
  "impact": "Very High | High | Medium | Low",
  "effort": "High | Medium | Low",
  "metric": "+85% AOV"
}
```

---

## Design System
- **Background**: `#080d1a` (page), `#0a0f1e` (sidebar), `#0f172a` (cards)
- **Accent**: `#34d399` (emerald) — primary brand color
- **Secondary**: `#60a5fa` blue, `#a78bfa` violet, `#f59e0b` amber, `#f472b6` pink
- **Text**: `#e2e8f0` primary, `#94a3b8` secondary, `#475569` muted
- **Card style**: `bg-slate-900/60 border border-slate-800/60 rounded-2xl`
- **Animations**: `.fade-up` (fadeUp keyframe), `.card-glow` (pulse-glow on hover) — defined in `index.css`

---

## Roadmap (current: Week 2)
- [ ] Wire `Overview.jsx` and `CharityBreakdown.jsx` to `GET /api/analytics/*`
- [ ] Wire `AIInsights.jsx` to `POST /api/insights/generate` (remove any client-side Anthropic calls)
- [ ] Add loading skeletons to Overview and CharityBreakdown (AIInsights already has them)
- [ ] Add `?days=` selector (30/60/90) wired to both frontend state and API query params
- [ ] JWT auth middleware on server routes
