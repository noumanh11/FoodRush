/**
 * Generates restaurant & menu SVG illustrations for FoodRush public assets.
 * Run: node scripts/generate-food-svgs.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public', 'images');

const RESTAURANTS = [
  { slug: 'biryani-house', label: 'Biryani House', emoji: '🍛', accent: '#f97316' },
  { slug: 'dragon-wok', label: 'Dragon Wok', emoji: '🥡', accent: '#ef4444' },
  { slug: 'napoli-kitchen', label: 'Napoli Kitchen', emoji: '🍝', accent: '#22c55e' },
  { slug: 'burger-forge', label: 'Burger Forge', emoji: '🍔', accent: '#eab308' },
  { slug: 'spice-route', label: 'Spice Route', emoji: '🌶️', accent: '#f43f5e' },
  { slug: 'taco-fiesta', label: 'Taco Fiesta', emoji: '🌮', accent: '#84cc16' },
  { slug: 'default', label: 'Restaurant', emoji: '🍽️', accent: '#fb923c' },
];

const MENUS = [
  { slug: 'chicken-biryani', label: 'Chicken Biryani', emoji: '🍗', accent: '#f97316' },
  { slug: 'beef-biryani', label: 'Beef Biryani', emoji: '🥩', accent: '#dc2626' },
  { slug: 'mutton-karahi', label: 'Mutton Karahi', emoji: '🍖', accent: '#b45309' },
  { slug: 'chicken-karahi', label: 'Chicken Karahi', emoji: '🍲', accent: '#ea580c' },
  { slug: 'garlic-naan', label: 'Garlic Naan', emoji: '🫓', accent: '#d97706' },
  { slug: 'raita', label: 'Raita', emoji: '🥛', accent: '#38bdf8' },
  { slug: 'kung-pao-chicken', label: 'Kung Pao', emoji: '🌶️', accent: '#ef4444' },
  { slug: 'sweet-sour-pork', label: 'Sweet & Sour', emoji: '🍖', accent: '#f43f5e' },
  { slug: 'fried-rice', label: 'Fried Rice', emoji: '🍚', accent: '#facc15' },
  { slug: 'dumplings', label: 'Dumplings', emoji: '🥟', accent: '#fbbf24' },
  { slug: 'hot-sour-soup', label: 'Hot & Sour', emoji: '🍜', accent: '#fb923c' },
  { slug: 'chow-mein', label: 'Chow Mein', emoji: '🍝', accent: '#f59e0b' },
  { slug: 'margherita-pizza', label: 'Margherita', emoji: '🍕', accent: '#ef4444' },
  { slug: 'carbonara', label: 'Carbonara', emoji: '🍝', accent: '#fde68a' },
  { slug: 'lasagna', label: 'Lasagna', emoji: '🧀', accent: '#f97316' },
  { slug: 'tiramisu', label: 'Tiramisu', emoji: '🍰', accent: '#a16207' },
  { slug: 'bruschetta', label: 'Bruschetta', emoji: '🍅', accent: '#ef4444' },
  { slug: 'smash-burger', label: 'Smash Burger', emoji: '🍔', accent: '#eab308' },
  { slug: 'chicken-burger', label: 'Chicken Burger', emoji: '🍔', accent: '#f59e0b' },
  { slug: 'loaded-fries', label: 'Loaded Fries', emoji: '🍟', accent: '#facc15' },
  { slug: 'onion-rings', label: 'Onion Rings', emoji: '🧅', accent: '#fbbf24' },
  { slug: 'milkshake', label: 'Milkshake', emoji: '🥤', accent: '#a16207' },
  { slug: 'butter-chicken', label: 'Butter Chicken', emoji: '🍛', accent: '#f97316' },
  { slug: 'paneer-tikka', label: 'Paneer Tikka', emoji: '🧀', accent: '#fde047' },
  { slug: 'dal-makhani', label: 'Dal Makhani', emoji: '🫘', accent: '#78350f' },
  { slug: 'mango-lassi', label: 'Mango Lassi', emoji: '🥭', accent: '#fbbf24' },
  { slug: 'samosa', label: 'Samosa', emoji: '🥟', accent: '#d97706' },
  { slug: 'beef-tacos', label: 'Beef Tacos', emoji: '🌮', accent: '#84cc16' },
  { slug: 'quesadilla', label: 'Quesadilla', emoji: '🧀', accent: '#facc15' },
  { slug: 'nachos', label: 'Nachos', emoji: '🧀', accent: '#eab308' },
  { slug: 'guacamole', label: 'Guacamole', emoji: '🥑', accent: '#22c55e' },
  { slug: 'churros', label: 'Churros', emoji: '🍩', accent: '#a16207' },
  { slug: 'default', label: 'Menu Item', emoji: '🍽️', accent: '#fb923c' },
];

function restaurantSvg({ label, emoji, accent }, w = 600, h = 400) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="45%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <circle cx="300" cy="155" r="88" fill="${accent}" fill-opacity="0.12" stroke="${accent}" stroke-opacity="0.35" stroke-width="2"/>
  <text x="300" y="175" text-anchor="middle" font-size="72">${emoji}</text>
  <text x="300" y="290" text-anchor="middle" fill="#f8fafc" font-family="system-ui,sans-serif" font-size="28" font-weight="700">${label}</text>
  <text x="300" y="325" text-anchor="middle" fill="#94a3b8" font-family="system-ui,sans-serif" font-size="14" letter-spacing="4">FOODRUSH</text>
  <rect x="40" y="360" width="520" height="4" rx="2" fill="${accent}" fill-opacity="0.6"/>
</svg>`;
}

function menuSvg({ label, emoji, accent }, size = 400) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="50%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="24" fill="url(#bg)"/>
  <rect width="${size}" height="${size}" rx="24" fill="url(#glow)"/>
  <rect x="16" y="16" width="${size - 32}" height="${size - 32}" rx="20" fill="none" stroke="${accent}" stroke-opacity="0.25" stroke-width="2"/>
  <text x="200" y="195" text-anchor="middle" font-size="96">${emoji}</text>
  <text x="200" y="300" text-anchor="middle" fill="#f1f5f9" font-family="system-ui,sans-serif" font-size="22" font-weight="600">${label}</text>
  <circle cx="200" cy="340" r="4" fill="${accent}"/>
</svg>`;
}

mkdirSync(join(publicDir, 'restaurants'), { recursive: true });
mkdirSync(join(publicDir, 'menus'), { recursive: true });

for (const r of RESTAURANTS) {
  writeFileSync(join(publicDir, 'restaurants', `${r.slug}.svg`), restaurantSvg(r));
}
for (const m of MENUS) {
  writeFileSync(join(publicDir, 'menus', `${m.slug}.svg`), menuSvg(m));
}

console.log(`Generated ${RESTAURANTS.length} restaurant + ${MENUS.length} menu SVGs`);
