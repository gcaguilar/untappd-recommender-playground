import { createContext, useContext, type ReactNode } from 'react'
import { getTranslations, t as translate, type DeepKey } from './index'

interface I18nContextValue {
  locale: string
  t: (key: DeepKey, params?: Record<string, string>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ locale, children }: { locale: string; children: ReactNode }) {
  return (
    <I18nContext.Provider
      value={{
        locale,
        t: (key, params) => translate(locale, key, params),
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider')
  }
  return context
}
