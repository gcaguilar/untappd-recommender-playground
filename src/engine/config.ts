export type RecommendationWeights = {
  styleSimilarity: number
  brewerySimilarity: number
  abvMatch: number
  historyAffinity: number
  novelty: number
}

export const DEFAULT_WEIGHTS: RecommendationWeights = {
  styleSimilarity: 0.35,
  brewerySimilarity: 0.1,
  abvMatch: 0.15,
  historyAffinity: 0.3,
  novelty: 0.1,
}

export const STYLE_FAMILIES: Record<string, string[]> = {
  ipa: [
    "IPA",
    "American IPA",
    "West Coast IPA",
    "East Coast IPA",
    "New England IPA",
    "Session IPA",
    "Black IPA",
    "Brut IPA",
    "Double IPA",
    "Imperial IPA",
    "Belgian IPA",
    "Rye IPA",
    "White IPA",
    "Red IPA",
    "Brown IPA",
  ],
  stout: [
    "Stout",
    "Imperial Stout",
    "Milk Stout",
    "Oatmeal Stout",
    "Dry Stout",
    "Sweet Stout",
    "Coffee Stout",
    "Chocolate Stout",
    "Pastry Stout",
    "Russian Imperial Stout",
    "Foreign / Export Stout",
  ],
  porter: [
    "Porter",
    "Robust Porter",
    "Brown Porter",
    "Smoked Porter",
    "Baltic Porter",
  ],
  lager: [
    "Lager",
    "Pilsner",
    "Helles",
    "Dunkel",
    "Vienna Lager",
    "Amber Lager",
    "Dark Lager",
    "Light Lager",
    "European Dark Lager",
    "Schwarzbier",
    "Bock",
    "Doppelbock",
    "Maibock",
    "Eisbock",
  ],
  wheat: [
    "Wheat Beer",
    "Hefeweizen",
    "Witbier",
    "American Wheat",
    "Dunkelweizen",
    "Weizenbock",
    "Berliner Weisse",
    "Kristallweizen",
  ],
  ale: [
    "Pale Ale",
    "American Pale Ale",
    "English Pale Ale",
    "Amber Ale",
    "Red Ale",
    "Scottish Ale",
    "Belgian Blonde",
    "Belgian Dubbel",
    "Belgian Tripel",
    "Saison",
    "Farmhouse Ale",
    "Blonde Ale",
    "Cream Ale",
    "Kölsch",
    "Barleywine",
    "Old Ale",
    "Strong Ale",
  ],
  sour: [
    "Sour",
    "Berliner Weisse",
    "Gose",
    "Flanders Red",
    "Lambic",
    "Gueuze",
    "Fruit Beer",
    "Wild Ale",
    "American Wild Ale",
    "Kettle Sour",
  ],
}

export function getStyleFamily(style: string): string | null {
  const normalized = style.toLowerCase()
  for (const [family, styles] of Object.entries(STYLE_FAMILIES)) {
    if (styles.some((s) => normalized.includes(s.toLowerCase()) || s.toLowerCase().includes(normalized))) {
      return family
    }
  }
  return null
}

export function areStylesRelated(style1: string, style2: string): boolean {
  if (style1.toLowerCase() === style2.toLowerCase()) return true
  const family1 = getStyleFamily(style1)
  const family2 = getStyleFamily(style2)
  return family1 !== null && family1 === family2
}

export function getStyleSimilarity(style1: string, style2: string): number {
  if (style1.toLowerCase() === style2.toLowerCase()) return 1.0
  if (areStylesRelated(style1, style2)) return 0.7
  const family1 = getStyleFamily(style1)
  const family2 = getStyleFamily(style2)
  if (family1 && family2 && family1 !== family2) {
    const crossFamily: Record<string, string[]> = {
      ipa: ["ale"],
      ale: ["ipa"],
      stout: ["porter"],
      porter: ["stout"],
    }
    if (crossFamily[family1]?.includes(family2)) return 0.3
  }
  return 0.0
}
