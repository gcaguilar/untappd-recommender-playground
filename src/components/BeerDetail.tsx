import { useQuery } from "@tanstack/react-query"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { t } from "@/i18n"
import type { Beer } from "@/pages/api/beers"

async function fetchBeer(id: string): Promise<Beer> {
  const response = await fetch(`/api/beers/${id}`)
  if (!response.ok) {
    throw new Error(response.status === 404 ? "Beer not found" : "Failed to load beer details")
  }
  return response.json()
}

interface BeerDetailProps {
  id: string
  locale: string
}

export function BeerDetail({ id, locale }: BeerDetailProps) {
  const { data: beer, isLoading, isError, error } = useQuery({
    queryKey: ["beer", id],
    queryFn: () => fetchBeer(id),
    retry: 1,
  })

  if (isLoading) {
    return <BeerDetailSkeleton locale={locale} />
  }

  if (isError) {
    return (
      <div className="text-center py-16">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t(locale, "common.error")}</AlertTitle>
          <AlertDescription>
            {error instanceof Error && error.message === "Beer not found"
              ? t(locale, "beerDetail.notFound")
              : t(locale, "beerDetail.failedToLoad")}
          </AlertDescription>
        </Alert>
        <a href="/" className="mt-4 inline-block text-primary hover:underline">
          ← {t(locale, "common.backToBeers")}
        </a>
      </div>
    )
  }

  if (!beer) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">{t(locale, "beerDetail.notFound")}</p>
        <a href="/" className="mt-4 inline-block text-primary hover:underline">
          ← {t(locale, "common.backToBeers")}
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <a href="/" className="inline-block text-primary hover:underline">
        ← {t(locale, "common.backToBeers")}
      </a>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0">
          <img
            src={beer.image_url}
            alt={beer.name}
            className="h-64 w-48 rounded-lg object-cover shadow-lg md:h-96 md:w-72"
          />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl font-bold">{beer.name}</h1>
            {beer.tagline && (
              <p className="mt-2 text-lg text-muted-foreground">{beer.tagline}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {beer.abv}{t(locale, "beerDetail.abvSuffix")}
            </span>
            {beer.ibu && (
              <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium">
                {beer.ibu}{t(locale, "beerDetail.ibuSuffix")}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold">{t(locale, "beerDetail.description")}</h2>
            <p className="mt-2 text-muted-foreground">{beer.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t(locale, "beerDetail.firstBrew")}</p>
              <p className="mt-1 font-medium">{beer.first_brewed}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t(locale, "beerDetail.volume")}</p>
              <p className="mt-1 font-medium">{beer.volume.value} {beer.volume.unit}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t(locale, "beerDetail.boilVolume")}</p>
              <p className="mt-1 font-medium">{beer.boil_volume.value} {beer.boil_volume.unit}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t(locale, "beerDetail.attenuation")}</p>
              <p className="mt-1 font-medium">{beer.attenuation_level}%</p>
            </div>
          </div>

          {beer.food_pairing && beer.food_pairing.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold">{t(locale, "beerDetail.foodPairing")}</h2>
              <ul className="mt-2 space-y-1">
                {beer.food_pairing.map((food) => (
                  <li key={food} className="text-muted-foreground">• {food}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold">{t(locale, "beerDetail.ingredients")}</h2>
            <div className="mt-2 space-y-4">
              <div>
                <h3 className="font-medium">{t(locale, "beerDetail.malt")}</h3>
                <ul className="mt-1 space-y-1">
                  {beer.ingredients.malt.map((malt, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {malt.name} ({malt.amount.value}{malt.amount.unit})
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium">{t(locale, "beerDetail.hops")}</h3>
                <ul className="mt-1 space-y-1">
                  {beer.ingredients.hops.map((hop, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {hop.name} - {hop.add}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium">{t(locale, "beerDetail.yeast")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{beer.ingredients.yeast}</p>
              </div>
            </div>
          </div>

          {beer.brewers_tips && (
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-medium">{t(locale, "beerDetail.brewersTips")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{beer.brewers_tips}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BeerDetailSkeleton({ locale }: { locale: string }) {
  return (
    <div className="space-y-8">
      <Skeleton className="h-5 w-32" />

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0">
          <Skeleton className="h-64 w-48 rounded-lg md:h-96 md:w-72" />
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-2/3" />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <div className="space-y-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-1/2" />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <div className="space-y-1">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-1/2" />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}
