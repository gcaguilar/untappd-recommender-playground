import { useState, type ReactElement } from "react"
import { Input } from "@/components/ui/input"
import { Search, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BeerList } from "./BeerList"
import { QueryProvider } from "./QueryProvider"
import { I18nProvider } from "@/i18n/ui"
import { t } from "@/i18n"

const PER_PAGE = 24

function BeerSearchContent({ locale }: { locale: string }): ReactElement {
  const [query, setQuery] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = () => {
    setIsSearching(true)
    setSearchTerm(query)
    setPage(1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleClear = () => {
    setQuery("")
    setSearchTerm("")
    setPage(1)
  }

  const handleLoadMore = () => {
    setIsSearching(true)
    setPage((p) => p + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t(locale, "search.placeholder")}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsSearching(false)
            }}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
              onClick={handleClear}
              aria-label={t(locale, "search.clear")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button onClick={handleSearch} className="sm:w-auto" disabled={isSearching}>
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t(locale, "search.button")}
            </>
          ) : (
            t(locale, "search.button")
          )}
        </Button>
      </div>

      <BeerList
        query={searchTerm}
        page={page}
        perPage={PER_PAGE}
        onLoadMore={handleLoadMore}
        locale={locale}
      />
    </div>
  )
}

export function BeerSearch({ locale }: { locale: string }): ReactElement {
  return (
    <QueryProvider>
      <I18nProvider locale={locale}>
        <BeerSearchContent locale={locale} />
      </I18nProvider>
    </QueryProvider>
  )
}
