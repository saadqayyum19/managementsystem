import type { NextFunction, Request, Response } from 'express'

export class AppError extends Error {
  statusCode: number
  code: string
  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

export function asyncHandler(handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => { void handler(req, res, next).catch(next) }
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const appError = error instanceof AppError ? error : new AppError('Unexpected server error')
  if (!(error instanceof AppError)) console.error(error)
  res.status(appError.statusCode).json({ success: false, error: { code: appError.code, message: appError.message } })
}
