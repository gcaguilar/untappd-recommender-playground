export interface Beer {
  id: number
  name: string
  breweryName: string
  breweryId?: number
  style: string
  abv?: number
  ibu?: number
  description?: string
  labelUrl?: string
  country?: string
}

export interface Checkin {
  id: number
  createdAt: string
  rating?: number
  beer: Beer
}

export interface UserProfile {
  username: string
  totalCheckins: number
  averageRating: number
  preferredStyles: string[]
  preferredBreweries: string[]
  preferredCountries: string[]
  preferredAbvRange: { min: number; max: number }
  styleRatings: Map<string, number>
  breweryRatings: Map<string, number>
  recentTasteSignals: string[]
  consumedBeerIds: Set<number>
}

export interface RecommendationBreakdown {
  styleSimilarity: number
  brewerySimilarity: number
  abvMatch: number
  historyAffinity: number
  novelty: number
}

export interface Recommendation {
  beer: Beer
  score: number
  breakdown: RecommendationBreakdown
  reasons: string[]
}

export interface UntappdUser {
  user_id: number
  user_name: string
  first_name: string
  last_name: string
  is_private: boolean
  stats: {
    total_checkins: number
    total_beers: number
    total_followers: number
    total_following: number
  }
}

export interface UntappdCheckin {
  checkin_id: number
  created_at: string
  rating_score?: number
  beer: {
    beer_id: number
    beer_name: string
    beer_label: string
    beer_style: string
    beer_abv: number
    beer_ibu?: number
    beer_description?: string
  }
  brewery: {
    brewery_id: number
    brewery_name: string
    country_name?: string
  }
}

export interface UntappdCheckinResponse {
  checkins: {
    items: UntappdCheckin[]
    pagination: {
      max_id?: number
      since_url?: string
    }
  }
}

export interface UntappdUserInfoResponse {
  user: UntappdUser
}

export interface UntappdBeerSearchResponse {
  beers: {
    items: Array<{
      beer: {
        bid: number
        beer_name: string
        beer_label: string
        beer_style: string
        beer_abv: number
        beer_ibu?: number
        beer_description?: string
      }
      brewery: {
        brewery_id: number
        brewery_name: string
        country_name?: string
      }
    }>
  }
  pagination: {
    max_id?: number
  }
}
