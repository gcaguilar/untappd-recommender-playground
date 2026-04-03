import { RateLimiterMemory } from "rate-limiter-flexible"

const isDev = process.env.NODE_ENV !== "production"

const limiters = {
  user: new RateLimiterMemory({
    points: isDev ? 100 : 30,
    duration: 60,
    blockDuration: 60,
  }),
  recommend: new RateLimiterMemory({
    points: isDev ? 100 : 20,
    duration: 60,
    blockDuration: 60,
  }),
  authenticated: new RateLimiterMemory({
    points: isDev ? 100 : 10,
    duration: 60,
    blockDuration: 60,
  }),
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

export async function rateLimit(
  request: Request,
  endpoint: "user" | "recommend" | "authenticated"
): Promise<Response | null> {
  const ip = getClientIp(request)
  const key = `${ip}:${endpoint}`
  const limiter = limiters[endpoint]

  try {
    const res = await limiter.consume(key)
    const headers = new Headers()
    headers.set("X-RateLimit-Limit", String(limiter.points))
    headers.set("X-RateLimit-Remaining", String(res.remainingPoints))
    headers.set("X-RateLimit-Reset", String(Math.ceil(res.msBeforeNext / 1000)))
    return { headers } as any
  } catch (rejRes: any) {
    if (isDev) {
      console.warn(`[Rate Limit] ${ip} exceeded on ${endpoint} (${rejRes.msBeforeNext}ms blocked)`)
    }

    return new Response(
      JSON.stringify({
        error: "Too many requests",
        retryAfter: Math.ceil(rejRes.msBeforeNext / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": String(limiter.points),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rejRes.msBeforeNext / 1000)),
          "Retry-After": String(Math.ceil(rejRes.msBeforeNext / 1000)),
        },
      }
    )
  }
}
