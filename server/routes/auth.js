/**
 * Dev-only auth endpoint — issues a JWT for local development.
 * In production this will be replaced by Shopify OAuth.
 */
import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()

// POST /api/auth/token — dev only, replaced by Shopify OAuth in production
router.post('/token', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Use Shopify OAuth in production' })
  }

  const shopDomain = 'dev-store.myshopify.com'
  const token = jwt.sign(
    { shopDomain, plan: 'pro', iat: Math.floor(Date.now() / 1000) },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({ token, shopDomain, expiresIn: '7d' })
})

export default router
