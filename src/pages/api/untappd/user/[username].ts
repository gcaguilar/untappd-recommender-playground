import type { APIRoute } from "astro"
import { buildUserProfile, fetchAllCheckins } from "@/services/userHistoryService"
import { z } from "zod"

export const prerender = false

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  checkins: z.coerce.boolean().default(false),
  access_token: z.string().optional(),
})

export const GET: APIRoute = async ({ params, url }) => {
  const parsed = schema.safeParse({
    username: params.username,
    checkins: url.searchParams.get("checkins"),
    access_token: url.searchParams.get("access_token") || undefined,
  })

  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Validation failed", details: parsed.error.errors }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
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
    const message = err instanceof Error ? err.message : "Unknown error"
    const status = message === "UNTAPPD_NOT_FOUND" ? 404 : 500
    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { "Content-Type": "application/json" } }
    )
  }
}
