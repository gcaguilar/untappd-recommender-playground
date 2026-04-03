import { useQuery } from "@tanstack/react-query"
import type { Beer } from "@/pages/api/beers"
import { BeerCard } from "./BeerCard"
import { BeerCardSkeleton } from "./BeerCardSkeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Beer as BeerIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"
import { t } from "@/i18n"

async function fetchBeers(query?: string, page = 1, perPage = 24): Promise<Beer[]> {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  params.set("page", String(page))
  params.set("per_page", String(perPage))

  const response = await fetch(`/api/beers?${params.toString()}`)

  if (!response.ok) {
    throw new Error("Failed to fetch beers")
  }

  return response.json()
}

interface BeerListProps {
  query: string
  page: number
  perPage: number
  onLoadMore: () => void
  locale: string
}

export function BeerList({ query, page, perPage, onLoadMore, locale }: BeerListProps) {
  const [allBeers, setAllBeers] = useState<Beer[]>([])
  const prevQueryRef = useRef(query)
  const prevPageRef = useRef(page)

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["beers", query, page],
    queryFn: () => fetchBeers(query, page, perPage),
  })

  useEffect(() => {
    if (query !== prevQueryRef.current) {
      setAllBeers([])
      prevQueryRef.current = query
      prevPageRef.current = 1
    }

    if (data) {
      if (page === 1) {
        setAllBeers(data)
      } else if (page !== prevPageRef.current) {
        setAllBeers((prev) => {
          const existingIds = new Set(prev.map((b) => b.id))
          const newBeers = data.filter((b) => !existingIds.has(b.id))
          return [...prev, ...newBeers]
        })
        prevPageRef.current = page
      }
    }
  }, [data, query, page])

  const hasMore = data ? data.length >= perPage : false
  const isInitialLoading = isLoading && allBeers.length === 0
  const isLoadingMore = isFetching && page > 1 && allBeers.length > 0

  if (isInitialLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <BeerCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError && allBeers.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t(locale, "common.error")}</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : t(locale, "beerList.fetchError")}
        </AlertDescription>
      </Alert>
    )
  }

  if (allBeers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <BeerIcon className="h-16 w-16 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">{t(locale, "beerList.noBeersFound")}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {query
            ? t(locale, "beerList.noResults", { query })
            : t(locale, "beerList.noBeersAvailable")}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allBeers.map((beer) => (
          <BeerCard key={beer.id} beer={beer} locale={locale} />
        ))}
        {isLoadingMore &&
          Array.from({ length: 4 }).map((_, i) => (
            <BeerCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={onLoadMore}
            variant="outline"
            size="lg"
            disabled={isFetching}
          >
            {isFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t(locale, "common.loading")}
              </>
            ) : (
              t(locale, "beerList.loadMore")
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
