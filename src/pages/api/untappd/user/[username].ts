import type { APIRoute } from "astro"
import { buildUserProfile, fetchAllCheckins } from "@/services/userHistoryService"
import { z } from "zod"
import { apiError, validationError } from "@/lib/api"
import { rateLimit } from "@/lib/rateLimit"

export const prerender = false

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  checkins: z.coerce.boolean().default(false),
  access_token: z.string().optional(),
})

export const GET: APIRoute = async ({ params, url, request }) => {
  const rl = await rateLimit(request, "user")
  if (rl && rl.status === 429) return rl

  const parsed = schema.safeParse({
    username: params.username,
    checkins: url.searchParams.get("checkins"),
    access_token: url.searchParams.get("access_token") || undefined,
  })

  if (!parsed.success) {
    return validationError(parsed.error.errors)
  }

  const { username, checkins, access_token } = parsed.data

  try {
    const profile = await buildUserProfile(username, access_token)

    let checkinsData: any[] = []
    if (checkins) {
      checkinsData = await fetchAllCheckins(username, access_token)
    }

    return new Response(JSON.stringify({ profile, checkins: checkinsData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    const { body, status } = apiError(err)
    return new Response(body, { status, headers: { "Content-Type": "application/json" } })
  }
}
