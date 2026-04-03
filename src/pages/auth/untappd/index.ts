import type { APIRoute } from "astro"
import { generateAuthUrl } from "@/services/untappdOAuth"

export const prerender = false

export const GET: APIRoute = async ({ redirect }) => {
  try {
    const authUrl = generateAuthUrl()
    return redirect(authUrl, 302)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
