const isDev = process.env.NODE_ENV !== "production"

export function apiError(err: unknown): { body: string; status: number } {
  const message = err instanceof Error ? err.message : String(err)

  if (isDev) {
    console.error(`[API Error] ${message}`)
    if (err instanceof Error && err.stack) {
      console.error(err.stack)
    }
  } else {
    console.error(`[API Error] ${message}`)
  }

  const userErrors: Record<string, { status: number; message: string }> = {
    UNTAPPD_NOT_FOUND: { status: 404, message: "User not found" },
    UNTAPPD_PRIVATE_USER: { status: 403, message: "This user's profile is private" },
    UNTAPPD_CREDENTIALS_MISSING: { status: 503, message: "Service unavailable" },
    UNTAPPD_RATE_LIMIT: { status: 429, message: "Too many requests" },
    UNTAPPD_EMPTY_HISTORY: { status: 404, message: "User has no check-ins" },
    UNTAPPD_AUTH_FAILED: { status: 401, message: "Authentication failed" },
  }

  const known = userErrors[message]
  if (known) {
    return {
      status: known.status,
      body: JSON.stringify({ error: known.message }),
    }
  }

  return {
    status: 500,
    body: JSON.stringify({
      error: isDev ? message : "Internal server error",
    }),
  }
}

export function validationError(errors: Array<{ path: string[]; message: string }>) {
  return new Response(
    JSON.stringify({
      error: "Validation failed",
      details: errors.map((e) => ({ field: e.path.join("."), message: e.message })),
    }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  )
}
