import { describe, it, expect } from "bun:test"
import type { Beer, UserProfile } from "@/domain/models"
import { scoreCandidate, generateRecommendations } from "@/engine/recommendationEngine"
import { DEFAULT_WEIGHTS } from "@/engine/config"

function makeBeer(overrides: Partial<Beer> = {}): Beer {
  return {
    id: 1,
    name: "Test Beer",
    breweryName: "Test Brewery",
    style: "American IPA",
    abv: 6.5,
    ibu: 50,
    country: "United States",
    ...overrides,
  }
}

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    username: "testuser",
    totalCheckins: 50,
    averageRating: 3.8,
    preferredStyles: ["American IPA", "West Coast IPA", "New England IPA"],
    preferredBreweries: ["BrewDog", "Sierra Nevada"],
    preferredCountries: ["United States", "England"],
    preferredAbvRange: { min: 5.0, max: 8.0 },
    styleRatings: new Map([
      ["American IPA", 4.2],
      ["West Coast IPA", 4.0],
      ["New England IPA", 3.8],
      ["Imperial Stout", 2.5],
      ["Sour", 2.8],
    ]),
    breweryRatings: new Map([
      ["BrewDog", 4.0],
      ["Sierra Nevada", 4.3],
      ["Mikkeller", 3.0],
    ]),
    recentTasteSignals: ["American IPA", "New England IPA"],
    consumedBeerIds: new Set([101, 102, 103, 104]),
    ...overrides,
  }
}

describe("scoreCandidate", () => {
  it("scores same style beer highly", () => {
    const selected = makeBeer({ id: 100, name: "Seed IPA", style: "American IPA", abv: 6.5 })
    const candidate = makeBeer({ id: 200, name: "Similar IPA", style: "American IPA", abv: 6.8 })
    const profile = makeProfile()

    const result = scoreCandidate(candidate, { selectedBeer: selected, profile, weights: DEFAULT_WEIGHTS })

    expect(result.breakdown.styleSimilarity).toBe(1.0)
    expect(result.score).toBeGreaterThan(0.5)
  })

  it("scores unrelated style low", () => {
    const selected = makeBeer({ id: 100, name: "Seed IPA", style: "American IPA", abv: 6.5 })
    const candidate = makeBeer({ id: 200, name: "Random Sour", style: "Sour", abv: 4.0 })
    const profile = makeProfile()

    const result = scoreCandidate(candidate, { selectedBeer: selected, profile, weights: DEFAULT_WEIGHTS })

    expect(result.breakdown.styleSimilarity).toBe(0.0)
  })

  it("scores related styles moderately", () => {
    const selected = makeBeer({ id: 100, name: "West Coast IPA", style: "West Coast IPA", abv: 6.5 })
    const candidate = makeBeer({ id: 200, name: "NE IPA", style: "New England IPA", abv: 6.0 })
    const profile = makeProfile()

    const result = scoreCandidate(candidate, { selectedBeer: selected, profile, weights: DEFAULT_WEIGHTS })

    expect(result.breakdown.styleSimilarity).toBe(0.7)
  })

  it("gives full brewery similarity for same brewery", () => {
    const selected = makeBeer({ id: 100, name: "Beer A", breweryName: "BrewDog", breweryId: 1 })
    const candidate = makeBeer({ id: 200, name: "Beer B", breweryName: "BrewDog", breweryId: 1 })
    const profile = makeProfile()

    const result = scoreCandidate(candidate, { selectedBeer: selected, profile, weights: DEFAULT_WEIGHTS })

    expect(result.breakdown.brewerySimilarity).toBe(1.0)
  })

  it("gives partial brewery similarity for same country", () => {
    const selected = makeBeer({ id: 100, name: "Beer A", breweryName: "BrewDog", country: "England" })
    const candidate = makeBeer({ id: 200, name: "Beer B", breweryName: "Other", country: "England" })
    const profile = makeProfile()

    const result = scoreCandidate(candidate, { selectedBeer: selected, profile, weights: DEFAULT_WEIGHTS })

    expect(result.breakdown.brewerySimilarity).toBe(0.5)
  })

  it("penalizes already consumed beers via novelty", () => {
    const selected = makeBeer({ id: 100, name: "Seed", style: "American IPA" })
    const candidate = makeBeer({ id: 101, name: "Already Had", style: "American IPA" })
    const profile = makeProfile()

    const result = scoreCandidate(candidate, { selectedBeer: selected, profile, weights: DEFAULT_WEIGHTS })

    expect(result.breakdown.novelty).toBe(0.0)
  })

  it("boosts history affinity for well-rated styles", () => {
    const selected = makeBeer({ id: 100, name: "Seed", style: "American IPA" })
    const candidate = makeBeer({ id: 200, name: "Good Style", style: "American IPA" })
    const profile = makeProfile()

    const result = scoreCandidate(candidate, { selectedBeer: selected, profile, weights: DEFAULT_WEIGHTS })

    expect(result.breakdown.historyAffinity).toBeGreaterThan(0.5)
  })

  it("reduces history affinity for poorly-rated styles", () => {
    const selected = makeBeer({ id: 100, name: "Seed", style: "American IPA" })
    const candidate = makeBeer({ id: 200, name: "Bad Style", style: "Imperial Stout" })
    const profile = makeProfile()

    const result = scoreCandidate(candidate, { selectedBeer: selected, profile, weights: DEFAULT_WEIGHTS })

    expect(result.breakdown.historyAffinity).toBeLessThan(0.5)
  })
})

describe("generateRecommendations", () => {
  it("excludes already consumed beers", () => {
    const selected = makeBeer({ id: 100, name: "Seed", style: "American IPA" })
    const profile = makeProfile({ consumedBeerIds: new Set([101, 102]) })
    const candidates = [
      makeBeer({ id: 101, name: "Consumed 1" }),
      makeBeer({ id: 102, name: "Consumed 2" }),
      makeBeer({ id: 200, name: "New Beer", style: "American IPA" }),
    ]

    const results = generateRecommendations(candidates, selected, profile)

    expect(results.every((r) => r.beer.id !== 101 && r.beer.id !== 102)).toBe(true)
    expect(results.some((r) => r.beer.id === 200)).toBe(true)
  })

  it("ranks IPAs above stouts for IPA fan", () => {
    const selected = makeBeer({ id: 100, name: "Seed IPA", style: "American IPA" })
    const profile = makeProfile()
    const candidates = [
      makeBeer({ id: 200, name: "Another IPA", style: "American IPA", abv: 6.5 }),
      makeBeer({ id: 201, name: "Stout", style: "Imperial Stout", abv: 9.0 }),
      makeBeer({ id: 202, name: "Sour", style: "Sour", abv: 4.0 }),
    ]

    const results = generateRecommendations(candidates, selected, profile)

    expect(results[0].beer.style).toBe("American IPA")
    expect(results[0].score).toBeGreaterThan(results[1].score)
  })

  it("limits results to topN", () => {
    const selected = makeBeer({ id: 100, name: "Seed", style: "American IPA" })
    const profile = makeProfile()
    const candidates = Array.from({ length: 20 }, (_, i) =>
      makeBeer({ id: 200 + i, name: `Beer ${i}`, style: "American IPA" })
    )

    const results = generateRecommendations(candidates, selected, profile, DEFAULT_WEIGHTS, 5)

    expect(results.length).toBe(5)
  })

  it("works with sparse history", () => {
    const selected = makeBeer({ id: 100, name: "Seed", style: "American IPA" })
    const profile = makeProfile({
      totalCheckins: 2,
      averageRating: 0,
      preferredStyles: [],
      styleRatings: new Map(),
      breweryRatings: new Map(),
      recentTasteSignals: [],
      consumedBeerIds: new Set(),
    })
    const candidates = [
      makeBeer({ id: 200, name: "Candidate 1", style: "American IPA" }),
      makeBeer({ id: 201, name: "Candidate 2", style: "Sour" }),
    ]

    const results = generateRecommendations(candidates, selected, profile)

    expect(results.length).toBeGreaterThan(0)
    expect(results.every((r) => r.score > 0)).toBe(true)
  })

  it("provides human-readable reasons", () => {
    const selected = makeBeer({ id: 100, name: "Seed IPA", style: "American IPA" })
    const candidate = makeBeer({ id: 200, name: "Similar IPA", style: "American IPA", abv: 6.5 })
    const profile = makeProfile()

    const result = scoreCandidate(candidate, { selectedBeer: selected, profile, weights: DEFAULT_WEIGHTS })

    expect(result.reasons.length).toBeGreaterThan(0)
    expect(result.reasons.some((r) => r.includes("American IPA"))).toBe(true)
  })
})
