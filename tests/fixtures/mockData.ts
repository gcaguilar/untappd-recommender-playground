import type { Beer } from "../../pages/api/beers"
import { generateBeers } from "../../mocks/data/generateBeers"

export const MOCK_BEERS: Beer[] = generateBeers(100)

export function getMockBeersPage(page: number, perPage: number, query?: string): Beer[] {
  let filtered = MOCK_BEERS

  if (query) {
    const q = query.toLowerCase()
    filtered = MOCK_BEERS.filter(
      (b) => b.name.toLowerCase().includes(q) || b.tagline.toLowerCase().includes(q)
    )
  }

  const start = (page - 1) * perPage
  const end = start + perPage

  return filtered.slice(start, end)
}

export function getMockBeerById(id: number): Beer | null {
  return MOCK_BEERS.find((b) => b.id === id) || null
}
