import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import analyticsRouter from './routes/analytics.js'
import insightsRouter from './routes/insights.js'
import authRouter from './routes/auth.js'
import { requireAuth } from './middleware/auth.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Public routes
app.use('/api/auth', authRouter)

// Protected routes
app.use('/api/analytics', requireAuth, analyticsRouter)
app.use('/api/insights', requireAuth, insightsRouter)

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ImpactIQ API', timestamp: new Date().toISOString() })
})

// Root — redirect to the frontend dev server
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>ImpactIQ API</title>
        <style>
          body { font-family: 'DM Sans', sans-serif; background: #080d1a; color: #e2e8f0; padding: 48px; }
          h1 { color: #34d399; } a { color: #60a5fa; }
          code { background: #0f172a; padding: 2px 8px; border-radius: 4px; font-size: 13px; }
          ul { line-height: 2; }
        </style>
      </head>
      <body>
        <h1>⚡ ImpactIQ API</h1>
        <p>The frontend app is at <a href="http://localhost:5173">http://localhost:5173</a></p>
        <h3>Available endpoints</h3>
        <ul>
          <li><code>POST /api/auth/token</code> — get a dev JWT</li>
          <li><code>GET /api/health</code></li>
          <li><code>GET /api/analytics/overview?days=90</code> 🔒</li>
          <li><code>GET /api/analytics/charities?days=90</code> 🔒</li>
          <li><code>POST /api/insights/generate</code> 🔒</li>
        </ul>
        <p style="color:#475569; font-size:13px">🔒 = requires <code>Authorization: Bearer &lt;token&gt;</code></p>
      </body>
    </html>
  `)
})

app.listen(PORT, () => {
  console.log(`🚀 ImpactIQ server running on http://localhost:${PORT}`)
})
