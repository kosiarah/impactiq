# ImpactIQ — Charity Analytics for Shopify

> **AI-powered ROI analytics for Shopify merchants running charity integrations (Conscious Cart, Shop for Good, etc.)**

ImpactIQ answers the question every cause-commerce merchant is asking: *Is my charity tie-in actually driving revenue?*

---

## Screenshots

| Overview Dashboard | Charity Breakdown | AI Insights |
|---|---|---|
| KPIs + time series | Per-charity AOV comparison | Claude-generated recommendations |

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | SQLite (via better-sqlite3) |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) |
| Charts | Recharts |

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/yourusername/impactiq
cd impactiq

# Frontend
cd client && npm install

# Backend
cd ../server && npm install
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
```

### 3. Seed the database

```bash
cd server
npm run seed
```

This generates **1,380 realistic orders** across 90 days with 5 charities, varying AOVs, and mobile/desktop splits.

### 4. Run both servers

```bash
# Terminal 1 — Backend (port 3001)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

Open `http://localhost:5173`

---

## Features

### Screen 1 — Overview Dashboard
- **4 KPI cards**: Total donations, charity conversion rate vs baseline, attributed revenue, AOV lift
- **Area chart**: 90-day rolling donation + revenue trend
- **Bar chart**: Charity selection rate by day of week (weekend surge visible)
- **Summary tiles**: Order completion breakdown with progress bars

### Screen 2 — Charity Performance
- **Per-charity cards**: Selection rate, AOV comparison (with/without charity), completed orders, donations raised
- **#1 badge**: Top performing charity highlighted
- **Radar chart**: Multi-dimensional performance scoring
- **Revenue bars**: Donation totals per charity

### Screen 3 — AI Insights
- **Powered by Claude**: Backend aggregates real data, sends structured prompt to `claude-sonnet-4-20250514`
- **5 recommendations**: Each has priority badge, category, specific action, and impact/effort rating
- **Expandable cards**: Click to reveal the full recommendation + action step
- **Refresh button**: Re-runs analysis against live database data

---

## API Endpoints

```
GET  /api/analytics/overview?days=90    # KPIs + time series
GET  /api/analytics/charities?days=90   # Per-charity breakdown
POST /api/insights/generate             # Claude AI recommendations
GET  /api/health                        # Health check
```

---

## Pitch Context

**Market**: Shopify has 4.6M+ merchants. Cause-marketing plugins (Conscious Cart, Shop for Good) are growing fast but have zero analytics layer.

**Problem**: Merchants donate to charity at checkout, but have no idea if it's driving conversions or increasing AOV. They're flying blind.

**Solution**: ImpactIQ is the analytics layer that shows the commercial ROI of cause-commerce integrations.

**Wedge**: Start with charity analytics. The underlying pattern — AI-powered ROI attribution for Shopify plugins — applies to loyalty programs, subscriptions, upsells, and beyond.

**Revenue**: $29–49/mo SaaS. 100 merchants = ~$3–5K MRR.

---

## Build Roadmap

- [x] **Week 1**: React frontend with all 3 screens, polished UI, static data
- [ ] **Week 2**: Express backend + SQLite + REST API, connect frontend to real data
- [ ] **Week 3**: Claude AI integration, JWT auth
- [ ] **Week 4**: Polish, mobile responsiveness, landing page, README screenshots

---

## License

MIT
