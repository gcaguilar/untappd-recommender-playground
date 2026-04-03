import type { Beer, UserProfile, Recommendation, RecommendationBreakdown } from "@/domain/models"
import { DEFAULT_WEIGHTS, getStyleSimilarity } from "@/engine/config"

interface ScoringContext {
  selectedBeer: Beer
  profile: UserProfile
  weights: typeof DEFAULT_WEIGHTS
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

function calculateAbvMatch(candidate: Beer, selected: Beer, profile: UserProfile): number {
  if (candidate.abv === undefined || selected.abv === undefined) return 0.5
  const abvDiff = Math.abs(candidate.abv - selected.abv)
  const abvScore = clamp(1 - abvDiff / 5)

  const inRange =
    candidate.abv >= profile.preferredAbvRange.min &&
    candidate.abv <= profile.preferredAbvRange.max
  const rangeBonus = inRange ? 0.2 : 0

  return clamp(abvScore + rangeBonus)
}

function calculateBrewerySimilarity(candidate: Beer, selected: Beer, profile: UserProfile): number {
  if (candidate.breweryId && selected.breweryId && candidate.breweryId === selected.breweryId) return 1.0
  if (candidate.breweryName && selected.breweryName && candidate.breweryName === selected.breweryName) return 1.0
  if (candidate.country && selected.country && candidate.country === selected.country) return 0.5
  return 0.0
}

function calculateHistoryAffinity(candidate: Beer, profile: UserProfile): number {
  let score = 0.5

  const styleAvg = profile.styleRatings.get(candidate.style)
  if (styleAvg !== undefined) {
    score += (styleAvg - 3) * 0.3
  }

  const breweryAvg = profile.breweryRatings.get(candidate.breweryName)
  if (breweryAvg !== undefined) {
    score += (breweryAvg - 3) * 0.15
  }

  if (profile.preferredCountries.includes(candidate.country || "")) {
    score += 0.1
  }

  if (profile.recentTasteSignals.includes(candidate.style)) {
    score += 0.1
  }

  return clamp(score)
}

function calculateNovelty(candidate: Beer, profile: UserProfile, selected: Beer): number {
  if (profile.consumedBeerIds.has(candidate.id)) return 0.0

  const sameStyleConsumed = [...profile.consumedBeerIds].filter((id) => {
    const consumedStyle = profile.consumedBeerIds.size > 0 ? candidate.style : null
    return consumedStyle === candidate.style
  }).length

  const noveltyBonus = clamp(1 - sameStyleConsumed * 0.1)
  return clamp(0.5 + noveltyBonus * 0.3)
}

export function scoreCandidate(
  candidate: Beer,
  context: ScoringContext
): Recommendation {
  const { selectedBeer, profile, weights } = context

  const styleSimilarity = getStyleSimilarity(selectedBeer.style, candidate.style)
  const brewerySimilarity = calculateBrewerySimilarity(candidate, selectedBeer, profile)
  const abvMatch = calculateAbvMatch(candidate, selectedBeer, profile)
  const historyAffinity = calculateHistoryAffinity(candidate, profile)
  const novelty = calculateNovelty(candidate, profile, selectedBeer)

  const finalScore = clamp(
    weights.styleSimilarity * styleSimilarity +
    weights.brewerySimilarity * brewerySimilarity +
    weights.abvMatch * abvMatch +
    weights.historyAffinity * historyAffinity +
    weights.novelty * novelty
  )

  const reasons = generateReasons(
    candidate,
    selectedBeer,
    profile,
    { styleSimilarity, brewerySimilarity, abvMatch, historyAffinity, novelty }
  )

  return {
    beer: candidate,
    score: Math.round(finalScore * 100) / 100,
    breakdown: { styleSimilarity, brewerySimilarity, abvMatch, historyAffinity, novelty },
    reasons,
  }
}

function generateReasons(
  candidate: Beer,
  selected: Beer,
  profile: UserProfile,
  breakdown: RecommendationBreakdown
): string[] {
  const reasons: string[] = []

  if (breakdown.styleSimilarity >= 0.7) {
    reasons.push(`Se parece a "${selected.name}" por estilo (${candidate.style}).`)
  } else if (breakdown.styleSimilarity >= 0.3) {
    reasons.push(`Tiene relación de estilo con "${selected.name}".`)
  }

  if (breakdown.brewerySimilarity >= 1.0) {
    reasons.push(`Es de la misma cervecería: ${candidate.breweryName}.`)
  } else if (breakdown.brewerySimilarity >= 0.5) {
    reasons.push(`Es del mismo país: ${candidate.country}.`)
  }

  if (breakdown.abvMatch >= 0.7) {
    reasons.push(`La graduación (${candidate.abv}% ABV) encaja con tu rango preferido.`)
  }

  const styleAvg = profile.styleRatings.get(candidate.style)
  if (styleAvg !== undefined && styleAvg >= 4.0) {
    reasons.push(`Sueles valorar bien las ${candidate.style} (${styleAvg.toFixed(1)}/5).`)
  }

  const breweryAvg = profile.breweryRatings.get(candidate.breweryName)
  if (breweryAvg !== undefined && breweryAvg >= 4.0) {
    reasons.push(`Te gustan las cervezas de ${candidate.breweryName}.`)
  }

  if (profile.recentTasteSignals.includes(candidate.style)) {
    reasons.push(`Has consumido ${candidate.style} recientemente.`)
  }

  if (breakdown.novelty > 0.6 && !profile.consumedBeerIds.has(candidate.id)) {
    reasons.push("Es una cerveza nueva para ti, pero encaja con tus gustos.")
  }

  if (reasons.length === 0) {
    reasons.push("Podría interesarte según tu historial.")
  }

  return reasons
}

export function generateRecommendations(
  candidates: Beer[],
  selectedBeer: Beer,
  profile: UserProfile,
  weights: typeof DEFAULT_WEIGHTS = DEFAULT_WEIGHTS,
  topN = 10
): Recommendation[] {
  const context: ScoringContext = { selectedBeer, profile, weights }

  const scored = candidates
    .filter((beer) => !profile.consumedBeerIds.has(beer.id))
    .filter((beer) => beer.name && beer.style)
    .map((beer) => scoreCandidate(beer, context))

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}
