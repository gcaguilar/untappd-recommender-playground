import type { UntappdCheckin, UntappdSearchResult, Beer, Checkin, UntappdUserInfo, UserProfile } from "@/domain/models"
import { getStyleFamily } from "@/engine/config"

export function normalizeBeer(raw: UntappdCheckin["beer"] & { brewery: UntappdCheckin["brewery"] }): Beer {
  return {
    id: raw.bid,
    name: raw.beer_name,
    breweryName: raw.brewery.brewery_name,
    breweryId: raw.brewery.brewery_id,
    style: raw.beer_style,
    abv: raw.beer_abv || undefined,
    ibu: raw.beer_ibu || undefined,
    description: raw.beer_description || undefined,
    labelUrl: raw.beer_label || undefined,
    country: raw.country?.country_name || raw.brewery.country_name,
  }
}

export function normalizeCheckin(raw: UntappdCheckin): Checkin {
  return {
    id: raw.checkin_id,
    createdAt: raw.created_at,
    rating: raw.rating_score ?? undefined,
    beer: normalizeBeer({ ...raw.beer, brewery: raw.brewery }),
  }
}

export function normalizeSearchResult(raw: UntappdSearchResult): Beer {
  return {
    id: raw.bid,
    name: raw.beer_name,
    breweryName: raw.brewery.brewery_name,
    breweryId: raw.brewery.brewery_id,
    style: raw.beer_style,
    abv: raw.beer_abv || undefined,
    ibu: raw.beer_ibu || undefined,
    description: raw.beer_description || undefined,
    labelUrl: raw.beer_label || undefined,
    country: raw.country?.country_name || raw.brewery.country_name,
  }
}

export function normalizeUserInfo(raw: UntappdUserInfo): UserProfile {
  return {
    username: raw.user_name,
    totalCheckins: raw.stats.total_checkins,
    averageRating: raw.stats.avg_rating,
    preferredStyles: [],
    preferredBreweries: [],
    preferredCountries: [],
    preferredAbvRange: { min: 0, max: 15 },
    styleRatings: new Map(),
    breweryRatings: new Map(),
    recentTasteSignals: [],
    consumedBeerIds: new Set(),
  }
}
