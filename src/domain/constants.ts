export const RECOMMENDATION_WEIGHTS = {
  styleSimilarity: 0.35,
  brewerySimilarity: 0.10,
  abvMatch: 0.15,
  historyAffinity: 0.30,
  novelty: 0.10,
} as const

export const STYLE_FAMILIES: Record<string, string[]> = {
  ipa: [
    "IPA",
    "American IPA",
    "West Coast IPA",
    "New England IPA",
    "Session IPA",
    "Black IPA",
    "Brut IPA",
    "Double IPA",
    "Imperial IPA",
  ],
  stout: [
    "Stout",
    "Imperial Stout",
    "Milk Stout",
    "Oatmeal Stout",
    "Dry Stout",
    "Sweet Stout",
    "Pastry Stout",
    "Russian Imperial Stout",
  ],
  porter: [
    "Porter",
    "Robust Porter",
    "Brown Porter",
    "Baltic Porter",
    "Smoked Porter",
  ],
  pilsner: [
    "Pilsner",
    "German Pilsner",
    "Czech Pilsner",
    "Italian Pilsner",
  ],
  lager: [
    "Lager",
    "Helles",
    "Dunkel",
    "Vienna Lager",
    "Märzen",
    "Bock",
    "Doppelbock",
    "Schwarzbier",
  ],
  wheat: [
    "Wheat Beer",
    "Hefeweizen",
    "Witbier",
    "American Wheat",
    "Berliner Weisse",
  ],
  sour: [
    "Sour",
    "Berliner Weisse",
    "Gose",
    "Flanders Red",
    "Lambic",
    "Wild Ale",
    "American Wild Ale",
    "Kettle Sour",
  ],
  paleAle: [
    "Pale Ale",
    "American Pale Ale",
    "English Pale Ale",
    "Belgian Pale Ale",
  ],
  belgian: [
    "Belgian Blonde",
    "Belgian Dubbel",
    "Belgian Tripel",
    "Belgian Strong Dark",
    "Belgian Strong Pale",
    "Saison",
    "Farmhouse Ale",
  ],
  amber: [
    "Amber Ale",
    "Red Ale",
    "Scottish Ale",
    "Irish Red",
  ],
  strong: [
    "Barleywine",
    "Old Ale",
    "English Barleywine",
    "American Barleywine",
    "Weizenbock",
  ],
  light: [
    "Kölsch",
    "Cream Ale",
    "Blonde Ale",
    "Light Lager",
    "American Lager",
  ],
}

export function getStyleFamily(style: string): string | null {
  const normalized = style.toLowerCase()
  for (const [family, styles] of Object.entries(STYLE_FAMILIES)) {
    if (styles.some((s) => normalized.includes(s.toLowerCase()))) {
      return family
    }
  }
  return null
}
