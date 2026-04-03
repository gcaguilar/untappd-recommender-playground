import { type ReactElement } from 'react'
import { useTranslation } from '@/i18n/ui'
import { Globe } from 'lucide-react'

export function LanguageSwitcher(): ReactElement {
  const { locale } = useTranslation()
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'

  const switchLocale = (newLocale: string) => {
    const pathWithoutLocale = currentPath.replace(/^\/(en|es)/, '') || '/'
    const newPath = newLocale === 'en' ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`
    window.location.href = newPath
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => switchLocale('en')}
        className={`flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors ${
          locale === 'en'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
        aria-label="Switch to English"
      >
        <Globe className="h-4 w-4" />
        EN
      </button>
      <button
        onClick={() => switchLocale('es')}
        className={`flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors ${
          locale === 'es'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
        aria-label="Cambiar a español"
      >
        <Globe className="h-4 w-4" />
        ES
      </button>
    </div>
  )
}
