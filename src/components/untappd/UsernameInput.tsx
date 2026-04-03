import { useState, type ReactElement, type ChangeEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, User, Loader2 } from "lucide-react"
import { t } from "@/i18n"

interface UsernameInputProps {
  locale: string
  onSubmit: (username: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

export function UsernameInput({ locale, onSubmit, isLoading, error }: UsernameInputProps): ReactElement {
  const [username, setUsername] = useState("")

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      try {
        await onSubmit(username.trim().toLowerCase())
      } catch {
        // Error is handled by parent
      }
    }
  }

  const errorMessages: Record<string, string> = {
    UNTAPPD_NOT_FOUND: t(locale, "untappd.userNotFound"),
    UNTAPPD_PRIVATE_USER: t(locale, "untappd.privateUser"),
    UNTAPPD_CREDENTIALS_MISSING: t(locale, "untappd.missingCredentials"),
    UNTAPPD_RATE_LIMIT: t(locale, "untappd.rateLimit"),
    UNTAPPD_EMPTY_HISTORY: t(locale, "untappd.emptyHistory"),
  }

  const displayError = error ? (errorMessages[error] || error) : null

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">{t(locale, "untappd.findUser")}</h2>
        <p className="text-muted-foreground">{t(locale, "untappd.findUserDescription")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={t(locale, "untappd.usernamePlaceholder")}
            value={username}
            onChange={handleChange}
            className="flex-1"
            disabled={isLoading}
            data-testid="username-input"
          />
          <Button type="submit" disabled={isLoading || !username.trim()} data-testid="submit-button">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t(locale, "common.loading")}
              </>
            ) : (
              t(locale, "untappd.loadHistory")
            )}
          </Button>
        </div>
      </form>

      {displayError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t(locale, "common.error")}</AlertTitle>
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
