import type { APIRoute } from "astro"
import { generateBeers } from "../../mocks/data/generateBeers"

export interface Beer {
  id: number
  name: string
  tagline: string
  first_brewed: string
  description: string
  image_url: string
  abv: number
  ibu: number | null
  target_fg: number
  target_og: number
  ebc: number
  srm: number
  ph: number
  attenuation_level: number
  volume: { value: number; unit: string }
  boil_volume: { value: number; unit: string }
  method: {
    mash_temp: Array<{ temp: { value: number; unit: string }; duration: number | null }>
    fermentation: { temp: { value: number; unit: string } }
    twist: string | null
  }
  ingredients: {
    malt: Array<{ name: string; amount: { value: number; unit: string } }>
    hops: Array<{
      name: string
      amount: { value: number; unit: string }
      add: string
      attribute: string
    }>
    yeast: string
  }
  food_pairing: string[]
  brewers_tips: string
  contributed_by: string
}

const API_BASE = "https://api.punkapi.com/v2"
const TEST_MODE = process.env.TEST_MODE === "true"

let mockBeers: Beer[] = []

if (TEST_MODE) {
  mockBeers = generateBeers(100)
}

function getMockBeersPage(page: number, perPage: number, query?: string): Beer[] {
  let filtered = mockBeers
  if (query) {
    const q = query.toLowerCase()
    filtered = mockBeers.filter(
      (b) => b.name.toLowerCase().includes(q) || b.tagline.toLowerCase().includes(q)
    )
  }
  const start = (page - 1) * perPage
  return filtered.slice(start, start + perPage)
}

export const GET: APIRoute = async ({ url }) => {
  const search = url.searchParams.get("q")
  const page = parseInt(url.searchParams.get("page") || "1", 10)
  const perPage = parseInt(url.searchParams.get("per_page") || "24", 10)

  if (TEST_MODE) {
    const results = getMockBeersPage(page, perPage, search || undefined)
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  let endpoint = `${API_BASE}/beers?page=${page}&per_page=${perPage}`

  if (search) {
    endpoint += `&beer_name=${encodeURIComponent(search)}`
  }

  try {
    const response = await fetch(endpoint)

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch beers" }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      )
    }

    const beers: Beer[] = await response.json()

    return new Response(JSON.stringify(beers), {
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
