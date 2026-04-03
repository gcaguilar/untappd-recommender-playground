import enTranslations from './en.json'
import esTranslations from './es.json'

const translations: Record<string, typeof enTranslations> = {
  en: enTranslations,
  es: esTranslations,
}

type TranslationValue = typeof enTranslations
type NestedKey<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? NestedKey<T[K], `${Prefix}${K & string}.`>
        : `${Prefix}${K & string}`
    }[keyof T]
  : never

export type DeepKey = NestedKey<TranslationValue>

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj) as string
}

export function getTranslations(locale: string): TranslationValue {
  return translations[locale] || translations.en
}

export function t(locale: string, key: DeepKey, params?: Record<string, string>): string {
  const translationMap = translations[locale] || translations.en
  let value = getNestedValue(translationMap as unknown as Record<string, unknown>, key)

  if (!value && locale !== 'en') {
    value = getNestedValue(translations.en as unknown as Record<string, unknown>, key)
  }

  if (!value) return key

  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      value = value.replace(`{${paramKey}}`, paramValue)
    })
  }

  return value
}
