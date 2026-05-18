/** Keep in sync with src/lib/storefrontCategories.ts */

const ALIAS_TO_CANONICAL = {
  smartphone: 'Smartphones',
  smartphones: 'Smartphones',
  phone: 'Smartphones',
  phones: 'Smartphones',
  mobile: 'Smartphones',
  mobiles: 'Smartphones',
  tablet: 'Tablets',
  tablets: 'Tablets',
  ipad: 'Tablets',
  audio: 'Audio',
  headphones: 'Audio',
  headphone: 'Audio',
  earbuds: 'Audio',
  earbud: 'Audio',
  speakers: 'Audio',
  speaker: 'Audio',
  computer: 'Computers',
  computers: 'Computers',
  laptop: 'Computers',
  laptops: 'Computers',
  pc: 'Computers',
  wearable: 'Wearables',
  wearables: 'Wearables',
  watch: 'Wearables',
  watches: 'Wearables',
  smartwatch: 'Wearables',
  smartwatches: 'Wearables',
  gaming: 'Gaming',
  game: 'Gaming',
  games: 'Gaming',
  'gaming consoles': 'Gaming',
  'gaming console': 'Gaming',
  console: 'Gaming',
  consoles: 'Gaming',
  playstation: 'Gaming',
  accessory: 'Accessories',
  accessories: 'Accessories',
  'phone accessories': 'Accessories',
  'phone accessory': 'Accessories',
  charging: 'Charging',
  charger: 'Charging',
  chargers: 'Charging',
  'power bank': 'Charging',
  'power banks': 'Charging',
  electronic: 'Electronics',
  electronics: 'Electronics',
  'iphone case': 'iPhone Cases',
  'iphone cases': 'iPhone Cases',
  iphonecases: 'iPhone Cases',
  other: 'Other',
  misc: 'Other',
  miscellaneous: 'Other',
};

const CANONICAL = new Set(Object.values(ALIAS_TO_CANONICAL));

export function normalizeStorefrontCategory(raw) {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return 'Other';
  const key = trimmed.toLowerCase();
  if (ALIAS_TO_CANONICAL[key]) return ALIAS_TO_CANONICAL[key];
  for (const c of CANONICAL) {
    if (c.toLowerCase() === key) return c;
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function normalizeSecondaryCategories(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = new Set();
  for (const item of raw) {
    const n = normalizeStorefrontCategory(item);
    const k = n.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(n);
    }
  }
  return out;
}
