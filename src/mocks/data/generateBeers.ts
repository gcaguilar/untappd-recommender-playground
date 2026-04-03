import type { Beer } from "../../pages/api/beers"

const STYLES = [
  "IPA", "Double IPA", "West Coast IPA", "New England IPA",
  "Pale Ale", "American Pale Ale", "English Pale Ale",
  "Stout", "Imperial Stout", "Milk Stout", "Oatmeal Stout",
  "Porter", "Robust Porter", "Brown Porter",
  "Lager", "Pilsner", "Helles", "Dunkel",
  "Wheat Beer", "Hefeweizen", "Witbier",
  "Sour", "Berliner Weisse", "Gose", "Flanders Red",
  "Amber Ale", "Red Ale", "Scottish Ale",
  "Belgian Blonde", "Belgian Dubbel", "Belgian Tripel", "Saison",
  "Barleywine", "Old Ale", "Bock", "Doppelbock",
  "Session IPA", "Black IPA", "Brut IPA",
  "Kolsch", "Cream Ale", "Blonde Ale",
]

const PREFIXES = [
  "Hoppy", "Dark", "Golden", "Crystal", "Amber", "Midnight",
  "Royal", "Iron", "Copper", "Silver", "Rusty", "Wild",
  "Bold", "Smooth", "Rich", "Crisp", "Bright", "Deep",
  "Frosty", "Stormy", "Cloudy", "Hazy", "Clear", "Heavy",
  "Light", "Strong", "Mighty", "Grand", "Noble", "Ancient",
  "Cosmic", "Lunar", "Solar", "Stellar", "Atomic", "Electric",
  "Mystic", "Shadow", "Phantom", "Ghost", "Silent", "Loud",
]

const NOUNS = [
  "Hound", "Wolf", "Bear", "Eagle", "Hawk", "Fox",
  "Dragon", "Phoenix", "Raven", "Falcon", "Lion", "Tiger",
  "Anchor", "Compass", "Beacon", "Lantern", "Torch", "Flame",
  "Thunder", "Lightning", "Storm", "Tempest", "Gale", "Breeze",
  "Mountain", "Valley", "River", "Ocean", "Forest", "Meadow",
  "Harvest", "Orchard", "Garden", "Meadow", "Summit", "Ridge",
  "Knight", "Crown", "Shield", "Sword", "Hammer", "Anvil",
]

const MALTS = [
  "Maris Otter Pale", "Pilsner", "Munich", "Vienna",
  "Crystal 40", "Crystal 80", "Crystal 120",
  "Chocolate", "Roasted Barley", "Black Patent",
  "Wheat", "Flaked Oats", "Caramel 60",
  "Pale Ale", "Biscuit", "Melanoidin",
]

const HOPS = [
  "Citra", "Mosaic", "Simcoe", "Amarillo",
  "Cascade", "Centennial", "Chinook", "Columbus",
  "Galaxy", "Nelson Sauvin", "Motueka", "Rakau",
  "Hallertau Mittelfrueh", "Saaz", "Fuggles",
  "East Kent Goldings", "Willamette", "Ahtanum",
]

const YEASTS = [
  "Wyeast 1056 - American Ale",
  "White Labs WLP001 - California Ale",
  "SafAle US-05",
  "Wyeast 1318 - London Ale III",
  "White Labs WLP007 - Dry English Ale",
  "Safale S-04",
  "Wyeast 3068 - Weihenstephan Weizen",
  "White Labs WLP530 - Abbey Ale",
  "Safale WB-06",
  "Wyeast 3787 - Trappist High Gravity",
]

const FOOD_PAIRINGS_OPTIONS = [
  ["Spicy chicken tikka masala", "Sharp cheddar cheese", "Grilled lemon herb chicken"],
  ["Rich beef stew", "Aged gouda", "Dark chocolate brownie"],
  ["Fresh oysters", "Goat cheese salad", "Lemon sorbet"],
  ["BBQ pulled pork", "Nachos with jalapenos", "Key lime pie"],
  ["Fish and chips", "Bangers and mash", "Sticky toffee pudding"],
  ["Grilled salmon", "Caesar salad", "Crème brûlée"],
  ["Thai green curry", "Pad thai", "Mango sticky rice"],
  ["Margherita pizza", "Garlic bread", "Tiramisu"],
  ["Smoked brisket", "Coleslaw", "Cornbread"],
  ["Sushi platter", "Edamame", "Mochi ice cream"],
  ["Roast duck", "Fig and brie tart", "Chocolate mousse"],
  ["Lamb chops with rosemary", "Roasted vegetables", "Baklava"],
]

const BREWERS_TIPS = [
  "Mash at 65°C for a balance of fermentability and body.",
  "Dry hop for 3-5 days for maximum aroma without excessive bitterness.",
  "Use a wort chiller to reach pitching temperature quickly.",
  "Oxygenate the wort well before pitching yeast.",
  "A diacetyl rest at the end of fermentation helps clean up buttery off-flavours.",
  "Cold crash for 48 hours before packaging for a clearer beer.",
  "Use fresh hops for the best aroma - check the harvest date.",
  "Pitch an adequate amount of yeast - underpitching causes stress and off-flavours.",
  "Keep fermentation temperature stable to avoid fusel alcohols.",
  "Sanitise everything that touches the beer after the boil.",
  "Add some wheat or oats to improve head retention.",
  "Consider a step mash for complex grain bills.",
  "Let the beer condition in bottle for at least 2 weeks.",
  "A small addition of lactose can add body and sweetness to stouts.",
  "Brew water chemistry matters - adjust your water profile to match the style.",
]

const TAGLINES = [
  "A bold and hoppy adventure",
  "Smooth, dark and dangerously drinkable",
  "Crisp, clean and refreshing",
  "Unapologetically hoppy",
  "Rich, complex and rewarding",
  "Light in colour, heavy in flavour",
  "The beer that started it all",
  "Not your average session beer",
  "Brewed for the adventurous",
  "A modern classic",
  "Tradition meets innovation",
  "Hoppy, hazy and delicious",
  "Dark as night, smooth as silk",
  "A refreshing twist on a classic style",
  "Big flavours, balanced finish",
  "The perfect balance of malt and hops",
  "Brewed with passion and precision",
  "A tribute to the old world",
  "Bold, brash and unapologetic",
  "Easy drinking with a complex character",
]

const DESCRIPTIONS = [
  "A beautifully balanced beer with layers of tropical fruit and citrus hop character, underpinned by a solid malt backbone. The finish is dry and lingering with a pleasant bitterness.",
  "Deep amber in colour with aromas of caramel, toffee and dark fruit. The palate is rich and malty with a warming alcohol presence and a long, satisfying finish.",
  "Light golden with a fluffy white head. Delicate floral and herbal hop notes give way to a crisp, clean malt character. Refreshingly dry on the finish.",
  "Jet black with ruby highlights. Roasted coffee and dark chocolate dominate the aroma, with subtle notes of vanilla and dark fruit. Full-bodied with a warming finish.",
  "Hazy orange with a persistent white head. Bursting with mango, passion fruit and grapefruit aromas. Juicy and tropical on the palate with a soft, pillowy mouthfeel.",
  "Copper coloured with a creamy tan head. Biscuity malt character balanced by earthy, herbal hops. A classic example of the style with a clean, dry finish.",
  "Straw coloured with a brilliant clarity. Spicy phenols and fruity esters create a complex aroma. Light-bodied and effervescent with a refreshing tartness.",
  "Mahogany with a pinkish head. Rich toffee and dried fruit aromas lead to a complex palate of caramel, plum and subtle roast. Warming and contemplative.",
  "Pale gold with a persistent stream of fine bubbles. Delicate floral and grassy hop character with a crisp, bready malt foundation. Clean and refreshing.",
  "Deep ruby with a beige head. Rich chocolate and coffee aromas with hints of vanilla and dark cherry. Full and creamy with a long, roasty finish.",
]

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)]
}

function pickMany<T>(arr: T[], count: number, rand: () => number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

function formatMonthYear(rand: () => number): string {
  const month = Math.floor(rand() * 12) + 1
  const year = 2010 + Math.floor(rand() * 14)
  return `${String(month).padStart(2, "0")}/${year}`
}

export function generateBeers(count: number): Beer[] {
  const beers: Beer[] = []

  for (let i = 1; i <= count; i++) {
    const rand = seededRandom(i * 7919)
    const prefix = pick(PREFIXES, rand)
    const noun = pick(NOUNS, rand)
    const style = pick(STYLES, rand)
    const name = `${prefix} ${noun} ${style}`

    const abv = Math.round((3 + rand() * 9) * 10) / 10
    const ibu = Math.round(10 + rand() * 90)
    const maltCount = 2 + Math.floor(rand() * 4)
    const hopCount = 2 + Math.floor(rand() * 4)
    const foodPairing = pick(FOOD_PAIRINGS_OPTIONS, rand)
    const brewerTip = pick(BREWERS_TIPS, rand)
    const tagline = pick(TAGLINES, rand)
    const description = pick(DESCRIPTIONS, rand)

    beers.push({
      id: i,
      name,
      tagline,
      first_brewed: formatMonthYear(rand),
      description,
      image_url: `https://images.punkapi.com/v2/${i}.png`,
      abv,
      ibu,
      target_fg: Math.round((1.008 + rand() * 0.016) * 1000) / 1000,
      target_og: Math.round((1.036 + rand() * 0.040) * 1000) / 1000,
      ebc: Math.round(8 + rand() * 80),
      srm: Math.round(4 + rand() * 40),
      ph: Math.round((3.5 + rand() * 1.2) * 10) / 10,
      attenuation_level: Math.round(65 + rand() * 15),
      volume: { value: Math.round((20 + rand() * 40) * 10) / 10, unit: "litres" },
      boil_volume: { value: Math.round((25 + rand() * 50) * 10) / 10, unit: "litres" },
      method: {
        mash_temp: [{ temp: { value: Math.round(62 + rand() * 8), unit: "celsius" }, duration: Math.round(30 + rand() * 60) }],
        fermentation: { temp: { value: Math.round(16 + rand() * 8), unit: "celsius" } },
        twist: null,
      },
      ingredients: {
        malt: pickMany(MALTS, maltCount, rand).map((name) => ({
          name,
          amount: { value: Math.round((1 + rand() * 5) * 100) / 100, unit: "kilograms" },
        })),
        hops: pickMany(HOPS, hopCount, rand).map((name) => ({
          name,
          amount: { value: Math.round((0.5 + rand() * 3) * 100) / 100, unit: "grams" },
          add: pick(["start", "middle", "end", "dry hop"], rand),
          attribute: pick(["bitter", "flavour", "aroma"], rand),
        })),
        yeast: pick(YEASTS, rand),
      },
      food_pairing: foodPairing,
      brewers_tips: brewerTip,
      contributed_by: "BrewDog",
    })
  }

  return beers
}
