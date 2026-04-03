import type { UntappdUserInfo, UntappdCheckin, UntappdSearchResult } from "@/domain/models"
import { getOAuthConfig } from "@/services/untappdOAuth"
import { MOCK_USERS, MOCK_CHECKINS, MOCK_SEARCH_RESULTS } from "@/mocks/untappd/data"

const USE_MOCK = process.env.USE_UNTAPPD_MOCK === "true" || !process.env.UNTAPPD_CLIENT_ID

function checkCredentials() {
  if (!USE_MOCK && (!process.env.UNTAPPD_CLIENT_ID || !process.env.UNTAPPD_CLIENT_SECRET)) {
    throw new Error("UNTAPPD_CREDENTIALS_MISSING")
  }
}

function buildAuthParams(accessToken?: string) {
  if (accessToken) {
    return `access_token=${encodeURIComponent(accessToken)}`
  }
  const config = getOAuthConfig()
  return `client_id=${config.clientId}&client_secret=${config.clientSecret}`
}

export async function getUserInfo(username: string, accessToken?: string): Promise<UntappdUserInfo> {
  checkCredentials()

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    const user = MOCK_USERS[username.toLowerCase()]
    if (!user) throw new Error("UNTAPPD_NOT_FOUND")
    if (user.is_private) throw new Error("UNTAPPD_PRIVATE_USER")
    return user
  }

  const auth = buildAuthParams(accessToken)
  const response = await fetch(
    `https://api.untappd.com/v4/user/info/${username}?${auth}`
  )
  const data = await response.json()
  if (data.meta.code === 404) throw new Error("UNTAPPD_NOT_FOUND")
  if (data.meta.code === 403) throw new Error("UNTAPPD_PRIVATE_USER")
  return data.response
}

export async function getUserCheckins(
  username: string,
  options: { maxId?: number; limit?: number } = {},
  accessToken?: string
): Promise<{ checkins: UntappdCheckin[]; hasMore: boolean }> {
  checkCredentials()

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400))
    const user = MOCK_USERS[username.toLowerCase()]
    if (!user) throw new Error("UNTAPPD_NOT_FOUND")
    if (user.is_private) throw new Error("UNTAPPD_PRIVATE_USER")

    const limit = options.limit || 50
    const start = options.maxId ? MOCK_CHECKINS.findIndex((c) => c.checkin_id <= options.maxId!) + 1 : 0
    const checkins = MOCK_CHECKINS.slice(start, start + limit)
    return { checkins, hasMore: start + limit < MOCK_CHECKINS.length }
  }

  const auth = buildAuthParams(accessToken)
  const params = new URLSearchParams({
    limit: String(options.limit || 50),
  })
  if (options.maxId) params.set("max_id", String(options.maxId))

  const response = await fetch(
    `https://api.untappd.com/v4/user/checkins/${username}?${auth}&${params.toString()}`
  )
  const data = await response.json()
  return {
    checkins: data.response?.checkins?.items || [],
    hasMore: (data.response?.checkins?.items || []).length >= (options.limit || 50),
  }
}

export async function searchBeers(query: string, accessToken?: string): Promise<UntappdSearchResult[]> {
  checkCredentials()

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200))
    if (!query) return MOCK_SEARCH_RESULTS
    const q = query.toLowerCase()
    return MOCK_SEARCH_RESULTS.filter(
      (b) =>
        b.beer_name.toLowerCase().includes(q) ||
        b.beer_style.toLowerCase().includes(q) ||
        b.brewery.brewery_name.toLowerCase().includes(q)
    )
  }

  const auth = buildAuthParams(accessToken)
  const params = new URLSearchParams({
    q: query,
    limit: "25",
  })

  const response = await fetch(
    `https://api.untappd.com/v4/search/beer?${auth}&${params.toString()}`
  )
  const data = await response.json()
  return data.response?.beers?.items?.map((item: any) => ({
    bid: item.beer.bid,
    beer_name: item.beer.beer_name,
    beer_label: item.beer.beer_label,
    beer_style: item.beer.beer_style,
    beer_abv: item.beer.beer_abv,
    beer_ibu: item.beer.beer_ibu,
    beer_description: item.beer.beer_description,
    brewery: {
      brewery_id: item.brewery.brewery_id,
      brewery_name: item.brewery.brewery_name,
      country_name: item.brewery.country_name,
    },
    country: { country_name: item.brewery.country_name },
  })) || []
}

export async function getBeerInfo(beerId: number, accessToken?: string) {
  checkCredentials()

  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 100))
    const allBeers = [...MOCK_CHECKINS.map((c) => ({ ...c.beer, brewery: c.brewery })), ...MOCK_SEARCH_RESULTS]
    const beer = allBeers.find((b) => b.bid === beerId)
    if (!beer) throw new Error("UNTAPPD_NOT_FOUND")
    return beer
  }

  const auth = buildAuthParams(accessToken)
  const response = await fetch(
    `https://api.untappd.com/v4/beer/info/${beerId}?${auth}`
  )
  const data = await response.json()
  return data.response
}

export async function getAuthenticatedUser(accessToken: string): Promise<UntappdUserInfo> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    return Object.values(MOCK_USERS)[0] as UntappdUserInfo
  }

  const response = await fetch(
    `https://api.untappd.com/v4/user/info?access_token=${encodeURIComponent(accessToken)}`
  )
  const data = await response.json()
  if (data.meta.code === 401) throw new Error("UNTAPPD_AUTH_FAILED")
  if (data.meta.code === 403) throw new Error("UNTAPPD_PRIVATE_USER")
  return data.response
}
