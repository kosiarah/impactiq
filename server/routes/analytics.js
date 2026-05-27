import { Router } from 'express'
import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const router = Router()
const db = new Database(join(__dirname, '../db/impactiq.db'))

// GET /api/analytics/overview
router.get('/overview', (req, res) => {
  try {
    const _d = parseInt(req.query.days)
    const days = isNaN(_d) || _d <= 0 || _d > 3650 ? 90 : _d
    const shopId = req.merchant.shopDomain
    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceStr = since.toISOString().replace('T', ' ').substring(0, 19)

    const donations = db.prepare(`
      SELECT COALESCE(SUM(oc.donation_amount), 0) as total
      FROM order_charities oc
      JOIN orders o ON oc.order_id = o.id
      WHERE o.created_at >= ? AND o.shop_id = ?
    `).get(sinceStr, shopId)

    const conversionStats = db.prepare(`
      SELECT
        COUNT(*) as total_orders,
        SUM(completed) as completed_orders,
        COUNT(CASE WHEN oc.id IS NOT NULL THEN 1 END) as charity_shown,
        SUM(CASE WHEN oc.id IS NOT NULL AND o.completed = 1 THEN 1 ELSE 0 END) as charity_completed
      FROM orders o
      LEFT JOIN order_charities oc ON o.id = oc.order_id
      WHERE o.created_at >= ? AND o.shop_id = ?
    `).get(sinceStr, shopId)

    const revenueStats = db.prepare(`
      SELECT
        COALESCE(SUM(o.total_price), 0) as charity_revenue,
        COALESCE(AVG(o.total_price), 0) as charity_aov
      FROM orders o
      JOIN order_charities oc ON o.id = oc.order_id
      WHERE o.created_at >= ? AND o.completed = 1 AND o.shop_id = ?
    `).get(sinceStr, shopId)

    const baselineAOV = db.prepare(`
      SELECT COALESCE(AVG(total_price), 0) as baseline_aov
      FROM orders o
      LEFT JOIN order_charities oc ON o.id = oc.order_id
      WHERE oc.id IS NULL AND o.completed = 1 AND o.created_at >= ? AND o.shop_id = ?
    `).get(sinceStr, shopId)

    const timeSeries = db.prepare(`
      SELECT
        strftime('%Y-%W', o.created_at) as week,
        MIN(DATE(o.created_at)) as week_start,
        COUNT(oc.id) as charity_orders,
        COALESCE(SUM(oc.donation_amount), 0) as donations,
        COALESCE(SUM(o.total_price), 0) as revenue
      FROM orders o
      LEFT JOIN order_charities oc ON o.id = oc.order_id
      WHERE o.created_at >= ? AND o.shop_id = ?
      GROUP BY week
      ORDER BY week
    `).all(sinceStr, shopId)

    res.json({
      totalDonations: donations.total,
      charityConversionRate: conversionStats.charity_shown > 0
        ? (conversionStats.charity_completed / conversionStats.charity_shown * 100)
        : 0,
      baselineConversionRate: conversionStats.total_orders > 0
        ? (conversionStats.completed_orders / conversionStats.total_orders * 100)
        : 0,
      charityRevenue: revenueStats.charity_revenue,
      charityAOV: revenueStats.charity_aov,
      baselineAOV: baselineAOV.baseline_aov,
      totalOrders: conversionStats.total_orders,
      charityOrders: conversionStats.charity_shown,
      timeSeries,
    })
  } catch (err) {
    console.error('Analytics overview error:', err)
    res.status(500).json({ error: 'Failed to load overview data' })
  }
})

// GET /api/analytics/charities
router.get('/charities', (req, res) => {
  try {
    const _d = parseInt(req.query.days)
    const days = isNaN(_d) || _d <= 0 || _d > 3650 ? 90 : _d
    const shopId = req.merchant.shopDomain
    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceStr = since.toISOString().replace('T', ' ').substring(0, 19)

    const charityStats = db.prepare(`
      SELECT
        c.id,
        c.name,
        c.category,
        c.emoji,
        COUNT(oc.id) as total_selections,
        SUM(CASE WHEN o.completed = 1 THEN 1 ELSE 0 END) as completed_orders,
        COALESCE(SUM(oc.donation_amount), 0) as total_donations,
        COALESCE(AVG(CASE WHEN o.completed = 1 THEN o.total_price END), 0) as avg_order_value
      FROM charities c
      LEFT JOIN order_charities oc ON c.id = oc.charity_id
      LEFT JOIN orders o ON oc.order_id = o.id AND o.created_at >= ? AND o.shop_id = ?
      GROUP BY c.id, c.name, c.category, c.emoji
      ORDER BY total_selections DESC
    `).all(sinceStr, shopId)

    const baselineAOV = db.prepare(`
      SELECT COALESCE(AVG(total_price), 0) as aov
      FROM orders o
      LEFT JOIN order_charities oc ON o.id = oc.order_id
      WHERE oc.id IS NULL AND o.completed = 1 AND o.created_at >= ? AND o.shop_id = ?
    `).get(sinceStr, shopId).aov

    const totalSelections = charityStats.reduce((s, c) => s + c.total_selections, 0)

    res.json({
      charities: charityStats.map(c => ({
        ...c,
        selectionRate: totalSelections > 0 ? (c.total_selections / totalSelections * 100) : 0,
        aovLift: baselineAOV > 0 ? ((c.avg_order_value - baselineAOV) / baselineAOV * 100) : 0,
        baselineAOV,
      })),
      baselineAOV,
      totalSelections,
    })
  } catch (err) {
    console.error('Analytics charities error:', err)
    res.status(500).json({ error: 'Failed to load charity data' })
  }
})

export default router
