import type { APIRoute } from "astro"
import type { Beer } from "./beers"
import { generateBeers } from "../../../mocks/data/generateBeers"

export const prerender = false

const API_BASE = "https://api.punkapi.com/v2"
const TEST_MODE = process.env.TEST_MODE === "true"

let mockBeers: Beer[] = []

if (TEST_MODE) {
  mockBeers = generateBeers(100)
}

export const GET: APIRoute = async ({ params }) => {
  const id = params.id

  if (!id) {
    return new Response(
      JSON.stringify({ error: "Beer ID is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  if (TEST_MODE) {
    const beer = mockBeers.find((b) => b.id === parseInt(id, 10))
    if (!beer) {
      return new Response(
        JSON.stringify({ error: "Beer not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }
    return new Response(JSON.stringify(beer), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const response = await fetch(`${API_BASE}/beers/${id}`)

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Beer not found" }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      )
    }

    const beers: Beer[] = await response.json()

    if (beers.length === 0) {
      return new Response(
        JSON.stringify({ error: "Beer not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(JSON.stringify(beers[0]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
