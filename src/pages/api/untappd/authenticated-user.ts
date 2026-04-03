import type { APIRoute } from "astro"
import { getAuthenticatedUser } from "@/adapters/untappdClient"
import { buildUserProfile, fetchAllCheckins } from "@/services/userHistoryService"
import { z } from "zod"
import { apiError, validationError } from "@/lib/api"
import { rateLimit } from "@/lib/rateLimit"

export const prerender = false

const schema = z.object({
  access_token: z.string().min(1, "Access token is required"),
})

export const GET: APIRoute = async ({ url, request }) => {
  const rl = await rateLimit(request, "authenticated")
  if (rl && rl.status === 429) return rl

  const parsed = schema.safeParse({
    access_token: url.searchParams.get("access_token") || undefined,
  })

  if (!parsed.success) {
    return validationError(parsed.error.errors)
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
    const { body, status } = apiError(err)
    return new Response(body, { status, headers: { "Content-Type": "application/json" } })
  }
}
