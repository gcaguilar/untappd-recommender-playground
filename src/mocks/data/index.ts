import { generateBeers } from "./generateBeers"

export const MOCK_BEERS = generateBeers(100)

export function getBeerById(id: number) {
  return MOCK_BEERS.find((b) => b.id === id) || null
}

export function getBeersByPage(page: number, perPage: number, query?: string) {
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
