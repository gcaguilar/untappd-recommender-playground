import { useState, type ReactElement } from "react"
import type { Beer, UserProfile, Recommendation, Checkin } from "@/domain/models"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Star, ArrowLeft, Loader2, Beer as BeerIcon, TrendingUp } from "lucide-react"
import { t } from "@/i18n"
import { useUntappdApi } from "@/hooks/useUntappdApi"
import { UsernameInput } from "./UsernameInput"
import { BeerHistory } from "./BeerHistory"

interface UntappdAppProps {
  locale: string
  initialUsername?: string
}

type AppStep = "input" | "history" | "recommendations"

export function UntappdApp({ locale, initialUsername }: UntappdAppProps): ReactElement {
  const { isLoading, error, loadUserProfile, getRecommendations } = useUntappdApi()
  const [step, setStep] = useState<AppStep>(initialUsername ? "history" : "input")
  const [username, setUsername] = useState(initialUsername || "")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [selectedBeer, setSelectedBeer] = useState<Beer | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  const loadHistory = async (user: string) => {
    setUsername(user)

    try {
      const { profile: userProfile, checkins: userCheckins } = await loadUserProfile(user, true)

      if (userCheckins.length === 0) {
        throw new Error("UNTAPPD_EMPTY_HISTORY")
      }

      setProfile(userProfile)
      setCheckins(userCheckins)
      setStep("history")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      throw new Error(message)
    }
  }

  const handleSelectBeer = async (beer: Beer) => {
    setSelectedBeer(beer)

    try {
      const recs = await getRecommendations(username, beer, 10)
      setRecommendations(recs)
      setStep("recommendations")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      throw new Error(message)
    }
  }

  const handleBack = () => {
    if (step === "recommendations") {
      setStep("history")
      setSelectedBeer(null)
      setRecommendations([])
    } else if (step === "history") {
      setStep("input")
      setProfile(null)
      setCheckins([])
    }
  }

  if (step === "input") {
    return (
      <div className="space-y-6">
        <UsernameInput
          locale={locale}
          onSubmit={loadHistory}
          isLoading={isLoading}
          error={error}
        />
      </div>
    )
  }

  if (step === "history") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t(locale, "untappd.changeUser")}
          </Button>
          <h2 className="text-xl font-bold">{profile?.username}</h2>
        </div>
        <BeerHistory
          locale={locale}
          checkins={checkins}
          profile={profile}
          isLoading={isLoading}
          onSelectBeer={handleSelectBeer}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t(locale, "untappd.backToHistory")}
        </Button>
      </div>

      {selectedBeer && (
        <div className="rounded-lg border p-6 bg-card">
          <h3 className="text-sm text-muted-foreground mb-2">{t(locale, "untappd.recommendationsFor")}</h3>
          <div className="flex items-center gap-4">
            {selectedBeer.labelUrl ? (
              <img src={selectedBeer.labelUrl} alt={selectedBeer.name} className="h-16 w-12 rounded-md object-cover" />
            ) : (
              <div className="h-16 w-12 rounded-md bg-muted flex items-center justify-center">
                <BeerIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{selectedBeer.name}</h2>
              <p className="text-muted-foreground">{selectedBeer.breweryName} · {selectedBeer.style}</p>
              <div className="flex gap-2 mt-1">
                {selectedBeer.abv && <span className="text-sm">{selectedBeer.abv}% ABV</span>}
                {selectedBeer.ibu && <span className="text-sm">{selectedBeer.ibu} IBU</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
              <Skeleton className="h-16 w-12 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t(locale, "common.error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t(locale, "untappd.topRecommendations")}
          </h3>
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BeerIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t(locale, "untappd.noRecommendations")}</p>
            </div>
          ) : (
            recommendations.map((rec, i) => (
              <div key={rec.beer.id} className="rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium">{rec.beer.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {rec.beer.breweryName} · {rec.beer.style}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {rec.beer.abv && <span className="text-xs text-muted-foreground">{rec.beer.abv}% ABV</span>}
                          {rec.beer.ibu && <span className="text-xs text-muted-foreground">{rec.beer.ibu} IBU</span>}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-lg font-bold">{rec.score.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">score</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      {rec.reasons.map((reason, j) => (
                        <p key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Star className="h-3 w-3 mt-0.5 flex-shrink-0 fill-yellow-400 text-yellow-400" />
                          {reason}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
