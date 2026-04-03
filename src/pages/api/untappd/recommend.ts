import type { APIRoute } from "astro"
import { buildUserProfile, searchCandidateBeers } from "@/services/userHistoryService"
import { generateRecommendations } from "@/engine/recommendationEngine"
import { DEFAULT_WEIGHTS } from "@/engine/config"
import { z } from "zod"
import { apiError, validationError } from "@/lib/api"
import { rateLimit } from "@/lib/rateLimit"

export const prerender = false

const beerSchema = z.object({
  id: z.number(),
  name: z.string(),
  breweryName: z.string(),
  breweryId: z.number().optional(),
  style: z.string(),
  abv: z.number().optional(),
  ibu: z.number().optional(),
  description: z.string().optional(),
  labelUrl: z.string().optional(),
  country: z.string().optional(),
})

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  selectedBeer: beerSchema,
  topN: z.coerce.number().min(1).max(50).default(10),
  accessToken: z.string().optional(),
})

export const POST: APIRoute = async ({ request }) => {
  const rl = await rateLimit(request, "recommend")
  if (rl && rl.status === 429) return rl

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return validationError(parsed.error.errors)
  }

  const { username, selectedBeer, topN, accessToken } = parsed.data

  try {
    const profile = await buildUserProfile(username, accessToken)

    const searchQueries = [
      selectedBeer.style,
      `${selectedBeer.breweryName} ${selectedBeer.style}`,
      selectedBeer.style.split(" ").pop() || selectedBeer.style,
    ]

    const allCandidates = new Map()

    for (const query of searchQueries) {
      try {
        const results = await searchCandidateBeers(query, accessToken)
        for (const beer of results) {
          if (!allCandidates.has(beer.id) && !profile.consumedBeerIds.has(beer.id)) {
            allCandidates.set(beer.id, beer)
          }
        }
      } catch {
        continue
      }
    }

    const candidates = [...allCandidates.values()]

    if (candidates.length === 0) {
      return new Response(
        JSON.stringify({ recommendations: [], message: "No candidates found" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    }

    const recommendations = generateRecommendations(
      candidates,
      selectedBeer,
      profile,
      DEFAULT_WEIGHTS,
      topN
    )

    return new Response(JSON.stringify({ recommendations }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    const { body, status } = apiError(err)
    return new Response(body, { status, headers: { "Content-Type": "application/json" } })
  }
}
