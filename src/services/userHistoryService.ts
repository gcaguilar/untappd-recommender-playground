import type { Checkin, UserProfile, Beer } from "@/domain/models"
import { getUserCheckins, getUserInfo, searchBeers, getBeerInfo } from "@/adapters/untappdClient"
import { normalizeCheckin, normalizeUserInfo, normalizeSearchResult } from "@/adapters/normalizers"

const HIGH_RATING = 4.0
const LOW_RATING = 3.0
const RECENT_DAYS = 90

export async function buildUserProfile(username: string, accessToken?: string): Promise<UserProfile> {
  const userInfo = await getUserInfo(username, accessToken)
  const profile = normalizeUserInfo(userInfo)

  const allCheckins: Checkin[] = []
  let maxId: number | undefined
  let hasMore = true
  let page = 0
  const MAX_PAGES = 10

  while (hasMore && page < MAX_PAGES) {
    const result = await getUserCheckins(username, { maxId, limit: 50 }, accessToken)
    const normalized = result.checkins.map(normalizeCheckin)
    allCheckins.push(...normalized)
    hasMore = result.hasMore
    if (result.checkins.length > 0) {
      maxId = result.checkins[result.checkins.length - 1].checkin_id
    }
    page++
  }

  if (allCheckins.length === 0) {
    return profile
  }

  const styleRatings = new Map<string, number[]>()
  const breweryRatings = new Map<string, number[]>()
  const abvValues: number[] = []
  const consumedBeerIds = new Set<number>()
  const styleCounts = new Map<string, number>()
  const breweryCounts = new Map<string, number>()
  const countryCounts = new Map<string, number>()
  const recentSignals: string[] = []
  const now = new Date()

  for (const checkin of allCheckins) {
    consumedBeerIds.add(checkin.beer.id)

    if (checkin.rating !== undefined) {
      const styleRatingsForStyle = styleRatings.get(checkin.beer.style) || []
      styleRatingsForStyle.push(checkin.rating)
      styleRatings.set(checkin.beer.style, styleRatingsForStyle)

      const breweryRatingsForBrewery = breweryRatings.get(checkin.beer.breweryName) || []
      breweryRatingsForBrewery.push(checkin.rating)
      breweryRatings.set(checkin.beer.breweryName, breweryRatingsForBrewery)
    }

    if (checkin.beer.abv !== undefined) {
      abvValues.push(checkin.beer.abv)
    }

    styleCounts.set(checkin.beer.style, (styleCounts.get(checkin.beer.style) || 0) + 1)
    breweryCounts.set(checkin.beer.breweryName, (breweryCounts.get(checkin.beer.breweryName) || 0) + 1)
    if (checkin.beer.country) {
      countryCounts.set(checkin.beer.country, (countryCounts.get(checkin.beer.country) || 0) + 1)
    }

    const checkinDate = new Date(checkin.createdAt)
    const daysAgo = (now.getTime() - checkinDate.getTime()) / 86400000
    if (daysAgo <= RECENT_DAYS && checkin.rating !== undefined) {
      recentSignals.push(checkin.beer.style)
    }
  }

  const avgStyleRatings = new Map<string, number>()
  for (const [style, ratings] of styleRatings) {
    avgStyleRatings.set(style, ratings.reduce((a, b) => a + b, 0) / ratings.length)
  }

  const avgBreweryRatings = new Map<string, number>()
  for (const [brewery, ratings] of breweryRatings) {
    avgBreweryRatings.set(brewery, ratings.reduce((a, b) => a + b, 0) / ratings.length)
  }

  const preferredStyles = [...styleCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([style]) => style)

  const preferredBreweries = [...breweryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([brewery]) => brewery)

  const preferredCountries = [...countryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([country]) => country)

  const highAbv = abvValues.filter((abv) => {
    const beer = allCheckins.find((c) => c.beer.abv === abv)
    return beer && beer.rating !== undefined && beer.rating >= HIGH_RATING
  })

  const preferredAbvRange = highAbv.length > 0
    ? { min: Math.min(...highAbv) - 1, max: Math.max(...highAbv) + 1 }
    : abvValues.length > 0
      ? { min: Math.min(...abvValues), max: Math.max(...abvValues) }
      : { min: 0, max: 15 }

  return {
    username: profile.username,
    totalCheckins: allCheckins.length,
    averageRating: allCheckins.filter((c) => c.rating !== undefined).reduce((sum, c) => sum + (c.rating || 0), 0) /
      allCheckins.filter((c) => c.rating !== undefined).length || 0,
    preferredStyles,
    preferredBreweries,
    preferredCountries,
    preferredAbvRange,
    styleRatings: avgStyleRatings,
    breweryRatings: avgBreweryRatings,
    recentTasteSignals: recentSignals,
    consumedBeerIds,
  }
}

export async function fetchAllCheckins(username: string, accessToken?: string): Promise<Checkin[]> {
  const allCheckins: Checkin[] = []
  let maxId: number | undefined
  let hasMore = true
  let page = 0
  const MAX_PAGES = 10

  while (hasMore && page < MAX_PAGES) {
    const result = await getUserCheckins(username, { maxId, limit: 50 }, accessToken)
    const normalized = result.checkins.map(normalizeCheckin)
    allCheckins.push(...normalized)
    hasMore = result.hasMore
    if (result.checkins.length > 0) {
      maxId = result.checkins[result.checkins.length - 1].checkin_id
    }
    page++
  }

  return allCheckins
}

export async function searchCandidateBeers(query: string, accessToken?: string): Promise<Beer[]> {
  const results = await searchBeers(query, accessToken)
  return results.map(normalizeSearchResult)
}

export async function fetchBeerInfo(beerId: number, accessToken?: string): Promise<Beer> {
  const raw = await getBeerInfo(beerId, accessToken)
  return normalizeSearchResult({
    bid: raw.bid,
    beer_name: raw.beer_name,
    beer_label: raw.beer_label,
    beer_abv: raw.beer_abv,
    beer_ibu: raw.beer_ibu,
    beer_description: raw.beer_description,
    beer_style: raw.beer_style,
    brewery: raw.brewery,
    country: raw.country,
  })
}
