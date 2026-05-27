import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const router = Router()

function getDb() {
  return new Database(join(__dirname, '../db/impactiq.db'))
}

function gatherMerchantStats(db) {
  const days = 90
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = since.toISOString().replace('T', ' ').substring(0, 19)

  const overview = db.prepare(`
    SELECT 
      COUNT(*) as total_orders,
      SUM(completed) as completed_orders,
      AVG(total_price) as overall_aov,
      SUM(total_price) as total_revenue
    FROM orders WHERE created_at >= ?
  `).get(sinceStr)

  const charityStats = db.prepare(`
    SELECT 
      COUNT(DISTINCT oc.order_id) as charity_order_count,
      AVG(o.total_price) as charity_aov,
      SUM(oc.donation_amount) as total_donations
    FROM order_charities oc
    JOIN orders o ON oc.order_id = o.id
    WHERE o.created_at >= ? AND o.completed = 1
  `).get(sinceStr)

  const baselineAOV = db.prepare(`
    SELECT AVG(o.total_price) as aov
    FROM orders o
    LEFT JOIN order_charities oc ON o.id = oc.order_id
    WHERE oc.id IS NULL AND o.completed = 1 AND o.created_at >= ?
  `).get(sinceStr)

  const mobileStats = db.prepare(`
    SELECT 
      source,
      COUNT(*) as total,
      COUNT(oc.id) as with_charity
    FROM orders o
    LEFT JOIN order_charities oc ON o.id = oc.order_id
    WHERE o.created_at >= ? AND o.completed = 1
    GROUP BY source
  `).all(sinceStr)

  const weekendStats = db.prepare(`
    SELECT 
      CASE WHEN strftime('%w', created_at) IN ('0','6') THEN 'weekend' ELSE 'weekday' END as day_type,
      COUNT(*) as total,
      COUNT(oc.id) as with_charity
    FROM orders o
    LEFT JOIN order_charities oc ON o.id = oc.order_id
    WHERE o.created_at >= ? AND o.completed = 1
    GROUP BY day_type
  `).all(sinceStr)

  const topCharities = db.prepare(`
    SELECT c.name, COUNT(oc.id) as selections, AVG(o.total_price) as avg_aov, SUM(oc.donation_amount) as donations
    FROM charities c
    JOIN order_charities oc ON c.id = oc.charity_id
    JOIN orders o ON oc.order_id = o.id
    WHERE o.created_at >= ? AND o.completed = 1
    GROUP BY c.id, c.name
    ORDER BY selections DESC
  `).all(sinceStr)

  return { overview, charityStats, baselineAOV, mobileStats, weekendStats, topCharities }
}

// POST /api/insights/generate
router.post('/generate', async (req, res) => {
  const db = getDb()
  let stats

  try {
    stats = gatherMerchantStats(db)
  } finally {
    db.close()
  }

  const mobile = stats.mobileStats.find(s => s.source === 'mobile')
  const desktop = stats.mobileStats.find(s => s.source === 'web')
  const weekend = stats.weekendStats.find(s => s.day_type === 'weekend')
  const weekday = stats.weekendStats.find(s => s.day_type === 'weekday')
  const topCharity = stats.topCharities[0]
  const highestAOVCharity = [...stats.topCharities].sort((a, b) => b.avg_aov - a.avg_aov)[0]

  const prompt = `You are an expert Shopify e-commerce analyst advising a merchant about the ROI of their charity donation integration.

Merchant data (last 90 days):
- Total orders: ${stats.overview.total_orders}
- Completed orders: ${stats.overview.completed_orders}
- Overall AOV: $${stats.overview.overall_aov?.toFixed(2)}
- Charity order AOV: $${stats.charityStats.charity_aov?.toFixed(2)}
- Baseline AOV (no charity): $${stats.baselineAOV.aov?.toFixed(2)}
- Total donations generated: $${stats.charityStats.total_donations?.toFixed(0)}
- Charity order count: ${stats.charityStats.charity_order_count}
- Mobile charity selection rate: ${mobile ? ((mobile.with_charity / mobile.total) * 100).toFixed(1) : 'N/A'}%
- Desktop charity selection rate: ${desktop ? ((desktop.with_charity / desktop.total) * 100).toFixed(1) : 'N/A'}%
- Weekend charity selection rate: ${weekend ? ((weekend.with_charity / weekend.total) * 100).toFixed(1) : 'N/A'}%
- Weekday charity selection rate: ${weekday ? ((weekday.with_charity / weekday.total) * 100).toFixed(1) : 'N/A'}%
- Top charity by selections: ${topCharity?.name} (${topCharity?.selections} orders, $${topCharity?.avg_aov?.toFixed(2)} AOV)
- Highest AOV charity: ${highestAOVCharity?.name} ($${highestAOVCharity?.avg_aov?.toFixed(2)} AOV)

Generate 5 specific, actionable business recommendations. Return ONLY a JSON array — no preamble, no markdown fences.

Each object must have exactly these fields:
- id: number (1-5)
- category: one of "revenue", "mobile", "timing", "product", "conversion"
- priority: one of "urgent", "high", "medium"
- title: concise actionable headline (max 12 words)
- insight: 2-3 sentences of specific data-backed analysis
- action: one concrete next step the merchant can take this week
- impact: one of "Very High", "High", "Medium", "Low"
- effort: one of "High", "Medium", "Low"
- metric: short stat string like "+85% AOV" or "214 sessions"`

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content.find(b => b.type === 'text')?.text || ''
    const cleaned = text.replace(/```json|```/g, '').trim()
    const insights = JSON.parse(cleaned)

    res.json({ insights, generatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('Claude API error:', err.message)
    res.status(500).json({ error: 'Failed to generate insights', detail: err.message })
  }
})

export default router
