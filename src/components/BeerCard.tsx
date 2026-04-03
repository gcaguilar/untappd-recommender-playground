import { useState, type CSSProperties } from "react"
import type { Beer } from "@/pages/api/beers"
import { t } from "@/i18n"

interface BeerCardProps {
  beer: Beer
  locale: string
}

export function BeerCard({ beer, locale }: BeerCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <a href={`/beer/${beer.id}`} className="block transition-transform hover:scale-[1.02]">
      <div className="overflow-hidden h-full rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 p-4">
          <div className="flex-shrink-0 relative">
            <div
              className={`h-32 w-24 rounded-md bg-muted sm:h-40 sm:w-32 transition-opacity duration-300 ${
                imageLoaded ? "opacity-0 absolute inset-0" : "absolute inset-0"
              }`}
            />
            <img
              src={beer.image_url}
              alt={beer.name}
              className={`h-32 w-24 rounded-md object-cover sm:h-40 sm:w-32 relative transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          </div>
          <div className="flex flex-col justify-center min-w-0 flex-1">
            <h3 className="text-lg font-semibold truncate">{beer.name}</h3>
            {beer.tagline && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {beer.tagline}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                {beer.abv}{t(locale, "beerDetail.abvSuffix")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </a>
  )
}
