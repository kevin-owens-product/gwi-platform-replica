import express from 'express'
import cors from 'cors'
import { seed } from './db/seed.js'
import { authMiddleware } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'
import agenticRouter from './routes/agentic.js'

const app = express()
const PORT = parseInt(process.env.PORT ?? '3005', 10)

// ── Middleware ──────────────────────────────────────────────────────

app.use(cors({
  origin: ['http://localhost:3004', 'http://localhost:5173', 'http://127.0.0.1:3004'],
  credentials: true,
}))

app.use(express.json())
app.use(authMiddleware)

// ── Routes ─────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/agentic', agenticRouter)

// Future product routes will be mounted here:
// app.use('/v3/audiences', audiencesRouter)
// app.use('/v3/charts', chartsRouter)
// etc.

// ── Error handling ─────────────────────────────────────────────────

app.use(errorHandler)

// ── Startup ────────────────────────────────────────────────────────

seed()

app.listen(PORT, () => {
  console.log(`GWI Platform API server running on http://localhost:${PORT}`)
  console.log(`  Health:    http://localhost:${PORT}/health`)
  console.log(`  Agentic:   http://localhost:${PORT}/agentic/inventory`)
  console.log(`  Waves:     http://localhost:${PORT}/agentic/waves`)
})
