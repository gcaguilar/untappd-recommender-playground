import type { APIRoute } from "astro"
import { getAuthenticatedUser } from "@/adapters/untappdClient"
import { buildUserProfile, fetchAllCheckins } from "@/services/userHistoryService"
import { z } from "zod"

export const prerender = false

const schema = z.object({
  access_token: z.string().min(1, "Access token is required"),
})

export const GET: APIRoute = async ({ url }) => {
  const parsed = schema.safeParse({
    access_token: url.searchParams.get("access_token") || undefined,
  })

  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Validation failed", details: parsed.error.errors }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  const { access_token } = parsed.data

  try {
    const userInfo = await getAuthenticatedUser(access_token)
    const username = userInfo.user_name

    const profile = await buildUserProfile(username, access_token)
    const checkins = await fetchAllCheckins(username, access_token)

    return new Response(JSON.stringify({ profile, checkins, accessToken: access_token }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    const status = message === "UNTAPPD_NOT_FOUND" ? 404 :
                   message === "UNTAPPD_AUTH_FAILED" ? 401 : 500
    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { "Content-Type": "application/json" } }
    )
  }
}
