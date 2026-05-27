import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import analyticsRouter from './routes/analytics.js'
import insightsRouter from './routes/insights.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/analytics', analyticsRouter)
app.use('/api/insights', insightsRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ImpactIQ API', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 ImpactIQ server running on http://localhost:${PORT}`)
})
