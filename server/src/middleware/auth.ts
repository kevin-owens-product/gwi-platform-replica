import type { Request, Response, NextFunction } from 'express'

/**
 * Simple auth middleware — accepts any Bearer token for now.
 * In production this would validate JWTs against the auth service.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip auth for health check
  if (req.path === '/health') return next()

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    // For local development, allow requests without auth
    // Set a default user context
    ;(req as any).userId = 'dev-user'
    return next()
  }

  const token = authHeader.slice(7)
  if (!token) {
    res.status(401).json({ error: 'Invalid token' })
    return
  }

  // In a real system: verify JWT, extract user ID
  ;(req as any).userId = 'authenticated-user'
  next()
}
