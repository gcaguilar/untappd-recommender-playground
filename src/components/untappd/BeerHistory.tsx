import { useState, type ReactElement } from "react"
import type { Checkin, Beer, UserProfile } from "@/domain/models"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Star, Beer as BeerIcon, Loader2 } from "lucide-react"
import { t } from "@/i18n"

interface BeerHistoryProps {
  locale: string
  checkins: Checkin[]
  profile: UserProfile | null
  isLoading: boolean
  onSelectBeer: (beer: Beer) => void
}

export function BeerHistory({ locale, checkins, profile, isLoading, onSelectBeer }: BeerHistoryProps): ReactElement {
  const [search, setSearch] = useState("")
  const [styleFilter, setStyleFilter] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "rating" | "abv">("date")

  const styles = [...new Set(checkins.map((c) => c.beer.style))].sort()

  const filtered = checkins
    .filter((c) => {
      if (search && !c.beer.name.toLowerCase().includes(search.toLowerCase())) return false
      if (styleFilter && c.beer.style !== styleFilter) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0)
      if (sortBy === "abv") return (b.beer.abv || 0) - (a.beer.abv || 0)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {profile && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold">{profile.totalCheckins}</p>
            <p className="text-sm text-muted-foreground">{t(locale, "untappd.checkins")}</p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold">{profile.averageRating.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">{t(locale, "untappd.avgRating")}</p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold">{profile.consumedBeerIds.size}</p>
            <p className="text-sm text-muted-foreground">{t(locale, "untappd.uniqueBeers")}</p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold">{profile.preferredStyles[0] || "-"}</p>
            <p className="text-sm text-muted-foreground">{t(locale, "untappd.topStyle")}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t(locale, "untappd.searchBeers")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={styleFilter}
          onChange={(e) => setStyleFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{t(locale, "untappd.allStyles")}</option>
          {styles.map((style) => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "date" | "rating" | "abv")}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="date">{t(locale, "untappd.sortByDate")}</option>
          <option value="rating">{t(locale, "untappd.sortByRating")}</option>
          <option value="abv">{t(locale, "untappd.sortByAbv")}</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BeerIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{t(locale, "untappd.noBeersFound")}</p>
          </div>
        ) : (
          filtered.map((checkin) => (
            <div
              key={checkin.id}
              className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer group"
              onClick={() => onSelectBeer(checkin.beer)}
            >
              {checkin.beer.labelUrl ? (
                <img
                  src={checkin.beer.labelUrl}
                  alt={checkin.beer.name}
                  className="h-12 w-12 rounded-md object-cover flex-shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <BeerIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{checkin.beer.name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {checkin.beer.breweryName} · {checkin.beer.style}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {checkin.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{checkin.rating.toFixed(1)}</span>
                  </div>
                )}
                {checkin.beer.abv && (
                  <span className="text-sm text-muted-foreground">{checkin.beer.abv}%</span>
                )}
                <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {t(locale, "untappd.recommend")}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {filtered.length} {t(locale, "untappd.beers")}
        </p>
      )}
    </div>
  )
}
