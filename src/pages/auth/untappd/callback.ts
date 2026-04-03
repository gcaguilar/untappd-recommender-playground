import type { APIRoute } from "astro"
import { exchangeCodeForToken } from "@/services/untappdOAuth"

export const prerender = false

export const GET: APIRoute = async ({ url, redirect }) => {
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const error = url.searchParams.get("error")

  if (error) {
    return redirect(`/?auth_error=${encodeURIComponent(error)}`, 302)
  }

  if (!code) {
    return redirect("/?auth_error=no_code", 302)
  }

  try {
    const accessToken = await exchangeCodeForToken(code)
    
    return redirect(`/?access_token=${encodeURIComponent(accessToken)}${state ? `&state=${state}` : ""}`, 302)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return redirect(`/?auth_error=${encodeURIComponent(message)}`, 302)
  }
}
