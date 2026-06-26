import { ZodError } from 'zod'
import { ERR } from './constants'

export class AppError extends Error {
  public readonly isOperational = true

  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'AppError'
  }

  static badRequest(code: string, message: string, details?: Record<string, unknown>) {
    return new AppError(code, message, 400, details)
  }
  static unauthorized(message = 'Authentication required') {
    return new AppError(ERR.UNAUTHORIZED, message, 401)
  }
  static tokenExpired(message = 'Token has expired') {
    return new AppError(ERR.TOKEN_EXPIRED, message, 401)
  }
  static tokenInvalid(message = 'Invalid token') {
    return new AppError(ERR.TOKEN_INVALID, message, 401)
  }
  static forbidden(message = 'You do not have permission to perform this action') {
    return new AppError(ERR.FORBIDDEN, message, 403)
  }
  static insufficientRole(required: string) {
    return new AppError(
      ERR.INSUFFICIENT_ROLE,
      `This action requires the '${required}' role or higher`,
      403,
    )
  }
  static planLimit(resource: string, limit: number) {
    const limitStr = limit === -1 ? 'unlimited' : String(limit)
    return new AppError(
      ERR.PLAN_LIMIT,
      `Plan limit reached: maximum ${limitStr} ${resource}. Upgrade to increase your limit.`,
      403,
      { resource, limit },
    )
  }
  static notFound(resource: string, identifier?: string) {
    const code = `${resource.toUpperCase().replace(/\s+/g, '_')}_NOT_FOUND`
    const message = identifier ? `${resource} '${identifier}' not found` : `${resource} not found`
    return new AppError(code, message, 404)
  }
  static conflict(code: string, message: string) {
    return new AppError(code, message, 409)
  }
  static rateLimited(message = 'Too many requests, please try again later') {
    return new AppError(ERR.RATE_LIMITED, message, 429)
  }
  static internal(message = 'An unexpected error occurred') {
    return new AppError(ERR.INTERNAL_ERROR, message, 500)
  }
}

export interface SuccessEnvelope<T> {
  success: true
  message: string
  data: T
  meta?: Record<string, unknown>
}

export interface ErrorEnvelope {
  success: false
  error: { code: string; message: string; details?: Record<string, unknown> }
}

export function success<T>(data: T, message: string, status = 200, meta?: Record<string, unknown>) {
  const body: SuccessEnvelope<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function jsonResponse(body: unknown, status = 200, extraHeaders?: HeadersInit) {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  if (extraHeaders) new Headers(extraHeaders).forEach((v, k) => headers.append(k, v))
  return new Response(JSON.stringify(body), { status, headers })
}

export function errorResponse(err: unknown): Response {
  if (err instanceof AppError) {
    return jsonResponse(
      { success: false, error: { code: err.code, message: err.message, ...(err.details && { details: err.details }) } },
      err.statusCode,
    )
  }

  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of err.issues) {
      const path = issue.path.join('.') || '_root'
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }
    return jsonResponse(
      {
        success: false,
        error: { code: ERR.VALIDATION_ERROR, message: 'Validation failed', details: { fields: fieldErrors } },
      },
      422,
    )
  }

  if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 11000) {
    const keyValue = (err as { keyValue?: Record<string, unknown> }).keyValue ?? {}
    const field = Object.keys(keyValue)[0] ?? 'unknown'
    return jsonResponse(
      {
        success: false,
        error: { code: `${field.toUpperCase()}_ALREADY_EXISTS`, message: `Duplicate value for '${field}'`, details: { field } },
      },
      409,
    )
  }

  console.error('[unhandled]', err)
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : (err as Error)?.message ?? 'An unexpected error occurred'
  return jsonResponse({ success: false, error: { code: ERR.INTERNAL_ERROR, message } }, 500)
}

/**
 * Wrap a server handler so any thrown error becomes a JSON envelope.
 * Use:  POST: handle(async ({ request }) => { ... return success(data, MSG.AUTH.OTP_SENT) })
 */
export function handle<T extends (...args: any[]) => Promise<Response>>(fn: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (err) {
      return errorResponse(err)
    }
  }) as T
}
