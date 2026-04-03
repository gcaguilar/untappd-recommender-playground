const UNTAPPD_AUTH_BASE = "https://untappd.com/oauth"
const UNTAPPD_API_BASE = "https://api.untappd.com/v4"

export interface UntappdOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUrl: string
}

export function getOAuthConfig(): UntappdOAuthConfig {
  const clientId = process.env.UNTAPPD_CLIENT_ID
  const clientSecret = process.env.UNTAPPD_CLIENT_SECRET
  const redirectUrl = process.env.UNTAPPD_REDIRECT_URL || "http://localhost:4321/auth/untappd/callback"

  if (!clientId || !clientSecret) {
    throw new Error("UNTAPPD_CLIENT_ID and UNTAPPD_CLIENT_SECRET are required")
  }

  return { clientId, clientSecret, redirectUrl }
}

export function generateAuthUrl(state?: string): string {
  const config = getOAuthConfig()
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_url: config.redirectUrl,
  })

  if (state) {
    params.set("state", state)
  }

  return `${UNTAPPD_AUTH_BASE}/authenticate/?${params.toString()}`
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const config = getOAuthConfig()

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    response_type: "code",
    redirect_url: config.redirectUrl,
    code,
  })

  const response = await fetch(
    `${UNTAPPD_AUTH_BASE}/authorize/?${params.toString()}`
  )

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(
      `OAuth token exchange failed: ${error?.meta?.error_detail || response.statusText}`
    )
  }

  const data = await response.json()

  if (data.meta?.code !== 200 || !data.response?.access_token) {
    throw new Error(
      `Invalid OAuth response: ${data.meta?.error_detail || "No access token received"}`
    )
  }

  return data.response.access_token
}

export async function revokeToken(accessToken: string): Promise<boolean> {
  const config = getOAuthConfig()

  const response = await fetch(
    `${UNTAPPD_API_BASE}/auth/revoke?client_id=${config.clientId}&client_secret=${config.clientSecret}&access_token=${encodeURIComponent(accessToken)}`
  )

  return response.ok
}
