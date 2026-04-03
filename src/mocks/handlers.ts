import { http, HttpResponse } from "msw"
import { getBeerById, getBeersByPage, MOCK_BEERS } from "./data"

export const handlers = [
  http.get("https://api.punkapi.com/v2/beers", ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get("page") || "1", 10)
    const perPage = parseInt(url.searchParams.get("per_page") || "24", 10)
    const beerName = url.searchParams.get("beer_name") || undefined

    const results = getBeersByPage(page, perPage, beerName)

    return HttpResponse.json(results)
  }),

  http.get("https://api.punkapi.com/v2/beers/:id", ({ params }) => {
    const id = parseInt(params.id as string, 10)
    const beer = getBeerById(id)

    if (!beer) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json([beer])
  }),
]
