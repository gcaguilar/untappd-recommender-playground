import type { UntappdUserInfo, UntappdCheckin, UntappdSearchResult } from "@/domain/models"

function generateCheckins(count: number): UntappdCheckin[] {
  const breweries = [
    { brewery_id: 1, brewery_name: "BrewDog", country_name: "Scotland" },
    { brewery_id: 2, brewery_name: "Sierra Nevada", country_name: "United States" },
    { brewery_id: 3, brewery_name: "Mikkeller", country_name: "Denmark" },
    { brewery_id: 4, brewery_name: "Stone Brewing", country_name: "United States" },
    { brewery_id: 5, brewery_name: "To Øl", country_name: "Denmark" },
    { brewery_id: 6, brewery_name: "Cloudwater", country_name: "England" },
    { brewery_id: 7, brewery_name: "Beavertown", country_name: "England" },
    { brewery_id: 8, brewery_name: "Northern Monk", country_name: "England" },
  ]

  const beers = [
    { bid: 101, beer_name: "Punk IPA", beer_style: "American IPA", beer_abv: 5.6, beer_ibu: 35, beer_description: "A light, crisp and balanced IPA.", beer_label: "https://example.com/punk.png" },
    { bid: 102, beer_name: "Elvis Juice", beer_style: "American IPA", beer_abv: 6.5, beer_ibu: 40, beer_description: "Grapefruit infused IPA.", beer_label: "https://example.com/elvis.png" },
    { bid: 103, beer_name: "Dead Pony Club", beer_style: "American Pale Ale", beer_abv: 3.8, beer_ibu: 25, beer_description: "A session pale ale.", beer_label: "https://example.com/deadpony.png" },
    { bid: 104, beer_name: "5AM Saint", beer_style: "American Amber Ale", beer_abv: 5.0, beer_ibu: 30, beer_description: "A balanced amber ale.", beer_label: "https://example.com/5am.png" },
    { bid: 201, beer_name: "Torpedo Extra IPA", beer_style: "American IPA", beer_abv: 7.2, beer_ibu: 65, beer_description: "An aggressive IPA.", beer_label: "https://example.com/torpedo.png" },
    { bid: 202, beer_name: "Celebration Ale", beer_style: "American IPA", beer_abv: 6.8, beer_ibu: 65, beer_description: "A fresh hop IPA.", beer_label: "https://example.com/celebration.png" },
    { bid: 203, beer_name: "Hazy Little Thing", beer_style: "New England IPA", beer_abv: 6.7, beer_ibu: 35, beer_description: "Unfiltered IPA.", beer_label: "https://example.com/hazy.png" },
    { bid: 301, beer_name: "Beer Geek Breakfast", beer_style: "Imperial Stout", beer_abv: 9.2, beer_ibu: 50, beer_description: "An oatmeal imperial stout.", beer_label: "https://example.com/breakfast.png" },
    { bid: 302, beer_name: "Spontanbasil", beer_style: "Sour", beer_abv: 6.0, beer_ibu: 10, beer_description: "A basil infused sour.", beer_label: "https://example.com/basil.png" },
    { bid: 303, beer_name: "Milk Stout", beer_style: "Milk Stout", beer_abv: 6.0, beer_ibu: 25, beer_description: "A creamy milk stout.", beer_label: "https://example.com/milkstout.png" },
    { bid: 401, beer_name: "Arrogant Bastard Ale", beer_style: "American Strong Ale", beer_abv: 7.2, beer_ibu: 100, beer_description: "An aggressive ale.", beer_label: "https://example.com/arrogant.png" },
    { bid: 402, beer_name: "Enjoy By IPA", beer_style: "Imperial IPA", beer_abv: 9.4, beer_ibu: 90, beer_description: "A fresh double IPA.", beer_label: "https://example.com/enjoyby.png" },
    { bid: 501, beer_name: "Ghettø Blæbær", beer_style: "Sour", beer_abv: 6.0, beer_ibu: 10, beer_description: "A blueberry sour.", beer_label: "https://example.com/blaberry.png" },
    { bid: 601, beer_name: "Dry Hopped Lager", beer_style: "Lager", beer_abv: 4.5, beer_ibu: 20, beer_description: "A dry hopped lager.", beer_label: "https://example.com/dhl.png" },
    { bid: 701, beer_name: "Gamma Ray", beer_style: "American Pale Ale", beer_abv: 5.4, beer_ibu: 40, beer_description: "An American pale ale.", beer_label: "https://example.com/gamma.png" },
    { bid: 702, beer_name: "Neon Overlord", beer_style: "New England IPA", beer_abv: 6.5, beer_ibu: 35, beer_description: "A hazy IPA.", beer_label: "https://example.com/neon.png" },
    { bid: 801, beer_name: "Forever Ever", beer_style: "Session IPA", beer_abv: 4.5, beer_ibu: 30, beer_description: "A session IPA.", beer_label: "https://example.com/forever.png" },
    { bid: 802, beer_name: "Patron Saint", beer_style: "West Coast IPA", beer_abv: 5.5, beer_ibu: 45, beer_description: "A West Coast IPA.", beer_label: "https://example.com/patron.png" },
  ]

  const checkins: UntappdCheckin[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const beer = beers[i % beers.length]
    const brewery = breweries[Math.floor(i / beers.length) % breweries.length] || breweries[0]
    const date = new Date(now.getTime() - i * 86400000 * 3)

    const rating = beer.beer_style.includes("IPA")
      ? 3.5 + Math.random() * 1.5
      : beer.beer_style.includes("Stout")
        ? 2.5 + Math.random() * 1.5
        : 3.0 + Math.random() * 1.5

    checkins.push({
      checkin_id: 10000 + i,
      created_at: date.toISOString(),
      rating_score: Math.round(rating * 10) / 10,
      beer: {
        ...beer,
        country: { country_name: brewery.country_name },
      },
      brewery,
    })
  }

  return checkins
}

export const MOCK_USERS: Record<string, UntappdUserInfo> = {
  beerfan: {
    user_id: 1,
    user_name: "beerfan",
    first_name: "John",
    last_name: "Doe",
    avatar: "https://example.com/avatar.jpg",
    is_private: false,
    stats: {
      total_checkins: 250,
      total_beers: 180,
      total_created: 0,
      avg_rating: 3.6,
    },
  },
  ipalover: {
    user_id: 2,
    user_name: "ipalover",
    first_name: "Jane",
    last_name: "Smith",
    avatar: "https://example.com/avatar2.jpg",
    is_private: false,
    stats: {
      total_checkins: 500,
      total_beers: 350,
      total_created: 5,
      avg_rating: 3.8,
    },
  },
  privateuser: {
    user_id: 3,
    user_name: "privateuser",
    first_name: "Secret",
    last_name: "User",
    avatar: "https://example.com/avatar3.jpg",
    is_private: true,
    stats: {
      total_checkins: 0,
      total_beers: 0,
      total_created: 0,
      avg_rating: 0,
    },
  },
  emptyuser: {
    user_id: 4,
    user_name: "emptyuser",
    first_name: "Empty",
    last_name: "User",
    avatar: "https://example.com/avatar4.jpg",
    is_private: false,
    stats: {
      total_checkins: 0,
      total_beers: 0,
      total_created: 0,
      avg_rating: 0,
    },
  },
}

export const MOCK_CHECKINS = generateCheckins(50)

export const MOCK_SEARCH_RESULTS: UntappdSearchResult[] = [
  { bid: 901, beer_name: "Hazy IPA", beer_label: "https://example.com/hazy2.png", beer_abv: 6.5, beer_ibu: 40, beer_description: "A juicy hazy IPA.", beer_style: "New England IPA", brewery: { brewery_id: 9, brewery_name: "Cloudwater", country_name: "England" }, country: { country_name: "England" } },
  { bid: 902, beer_name: "West Coast IPA", beer_label: "https://example.com/wc.png", beer_abv: 6.8, beer_ibu: 60, beer_description: "A classic West Coast IPA.", beer_style: "West Coast IPA", brewery: { brewery_id: 4, brewery_name: "Stone Brewing", country_name: "United States" }, country: { country_name: "United States" } },
  { bid: 903, beer_name: "Session IPA", beer_label: "https://example.com/session.png", beer_abv: 4.5, beer_ibu: 35, beer_description: "A light session IPA.", beer_style: "Session IPA", brewery: { brewery_id: 8, brewery_name: "Northern Monk", country_name: "England" }, country: { country_name: "England" } },
  { bid: 904, beer_name: "Double IPA", beer_label: "https://example.com/dipa.png", beer_abv: 8.5, beer_ibu: 80, beer_description: "A big double IPA.", beer_style: "Double IPA", brewery: { brewery_id: 2, brewery_name: "Sierra Nevada", country_name: "United States" }, country: { country_name: "United States" } },
  { bid: 905, beer_name: "Imperial Stout", beer_label: "https://example.com/is.png", beer_abv: 10.5, beer_ibu: 55, beer_description: "A bold imperial stout.", beer_style: "Imperial Stout", brewery: { brewery_id: 3, brewery_name: "Mikkeller", country_name: "Denmark" }, country: { country_name: "Denmark" } },
  { bid: 906, beer_name: "Pilsner", beer_label: "https://example.com/pils.png", beer_abv: 4.8, beer_ibu: 30, beer_description: "A crisp pilsner.", beer_style: "Pilsner", brewery: { brewery_id: 6, brewery_name: "Cloudwater", country_name: "England" }, country: { country_name: "England" } },
  { bid: 907, beer_name: "Sour Ale", beer_label: "https://example.com/sour.png", beer_abv: 5.0, beer_ibu: 8, beer_description: "A tart sour ale.", beer_style: "Sour", brewery: { brewery_id: 5, brewery_name: "To Øl", country_name: "Denmark" }, country: { country_name: "Denmark" } },
  { bid: 908, beer_name: "Pale Ale", beer_label: "https://example.com/pale.png", beer_abv: 5.2, beer_ibu: 35, beer_description: "A balanced pale ale.", beer_style: "American Pale Ale", brewery: { brewery_id: 7, brewery_name: "Beavertown", country_name: "England" }, country: { country_name: "England" } },
]
