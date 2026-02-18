import type { Request, Response, NextFunction } from 'express'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(`[ERROR] ${err.message}`)
  if (err.stack) console.error(err.stack)

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
}
