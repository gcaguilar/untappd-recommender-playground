import type { APIRoute } from "astro"
import { buildUserProfile, searchCandidateBeers } from "@/services/userHistoryService"
import { generateRecommendations } from "@/engine/recommendationEngine"
import { DEFAULT_WEIGHTS } from "@/engine/config"
import { z } from "zod"

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
    return new Response(
      JSON.stringify({ error: "Validation failed", details: parsed.error.errors }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
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
    const message = err instanceof Error ? err.message : "Unknown error"
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
