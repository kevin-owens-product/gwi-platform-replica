import { Router } from 'express'
import { AgenticService } from '../services/agentic.js'

const router = Router()
const service = new AgenticService()

// GET /agentic/inventory — full capability inventory
router.get('/inventory', (_req, res) => {
  const inventory = service.getInventory()
  res.json(inventory)
})

// GET /agentic/flows — list all flows
router.get('/flows', (_req, res) => {
  const flows = service.listFlows()
  res.json(flows)
})

// GET /agentic/flows/:id — single flow
router.get('/flows/:id', (req, res) => {
  const flow = service.getFlow(req.params.id)
  if (!flow) {
    res.status(404).json({ error: `Flow "${req.params.id}" not found` })
    return
  }
  res.json(flow)
})

// GET /agentic/runs — list all runs
router.get('/runs', (_req, res) => {
  const runs = service.listRuns()
  res.json(runs)
})

// GET /agentic/runs/:id — single run with full output data
router.get('/runs/:id', (req, res) => {
  const run = service.getRun(req.params.id)
  if (!run) {
    res.status(404).json({ error: `Run "${req.params.id}" not found` })
    return
  }
  res.json(run)
})

// POST /agentic/runs — run a flow with analysis config
router.post('/runs', (req, res) => {
  const { flow_id, brief, analysis_config } = req.body

  if (!flow_id || !brief) {
    res.status(400).json({ error: 'flow_id and brief are required' })
    return
  }

  const run = service.runFlow(flow_id, brief, analysis_config)
  res.status(201).json(run)
})

// GET /agentic/waves — list available waves (for the filter UI)
router.get('/waves', (_req, res) => {
  const waves = service.listWaves()
  res.json(waves)
})

export default router
