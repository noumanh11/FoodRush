/** Demo seed data — image paths served from Next.js public folder */

export const IMG = {
  restaurants: (slug: string) => `/images/restaurants/${slug}.svg`,
  menu: (slug: string) => `/images/menus/${slug}.svg`,
};

export const CUSTOMERS = [
  { email: 'customer@foodrush.com', password: 'cust123', name: 'Ahmed Khan', phone: '+92 300 1110001' },
  { email: 'sara@foodrush.com', password: 'cust123', name: 'Sara Ali', phone: '+92 300 1110002' },
  { email: 'hassan@foodrush.com', password: 'cust123', name: 'Hassan Raza', phone: '+92 300 1110003' },
  { email: 'fatima@foodrush.com', password: 'cust123', name: 'Fatima Noor', phone: '+92 300 1110004' },
];

export interface SeedMenuItem {
  slug: string;
  name: string;
  price: number;
  category: string;
  description: string;
}

export interface SeedRestaurant {
  slug: string;
  owner: { email: string; password: string; name: string; phone: string };
  restaurant: {
    name: string;
    cuisine: string;
    address: string;
    phone: string;
    description: string;
    rating: number;
    isOpen: boolean;
  };
  menu: SeedMenuItem[];
}

export const RESTAURANTS: SeedRestaurant[] = [
  {
    slug: 'biryani-house',
    owner: { email: 'restaurant@foodrush.com', password: 'rest123', name: 'Biryani House', phone: '+92 300 2220001' },
    restaurant: {
      name: 'Biryani House',
      cuisine: 'Pakistani',
      address: 'Clifton Block 5, Karachi',
      phone: '+92 21 35871234',
      description: 'Authentic Karachi-style biryani and karahi, slow-cooked with hand-ground spices.',
      rating: 4.8,
      isOpen: true,
    },
    menu: [
      { slug: 'chicken-biryani', name: 'Chicken Biryani', price: 350, category: 'Rice', description: 'Fragrant basmati rice with tender chicken and saffron.' },
      { slug: 'beef-biryani', name: 'Beef Biryani', price: 400, category: 'Rice', description: 'Spicy beef biryani with hand-pounded masala.' },
      { slug: 'mutton-karahi', name: 'Mutton Karahi', price: 650, category: 'Curry', description: 'Slow-cooked mutton in rich tomato and ginger gravy.' },
      { slug: 'chicken-karahi', name: 'Chicken Karahi', price: 550, category: 'Curry', description: 'Classic Lahori chicken karahi with green chilies.' },
      { slug: 'garlic-naan', name: 'Garlic Naan', price: 40, category: 'Bread', description: 'Tandoor-baked naan brushed with garlic butter.' },
      { slug: 'raita', name: 'Raita', price: 50, category: 'Sides', description: 'Cool yogurt with cucumber, mint, and roasted cumin.' },
    ],
  },
  {
    slug: 'dragon-wok',
    owner: { email: 'wok@foodrush.com', password: 'rest123', name: 'Dragon Wok', phone: '+92 300 2220002' },
    restaurant: {
      name: 'Dragon Wok',
      cuisine: 'Chinese',
      address: 'MM Alam Road, Lahore',
      phone: '+92 42 35789012',
      description: 'Szechuan heat and Cantonese classics from our fiery wok station.',
      rating: 4.6,
      isOpen: true,
    },
    menu: [
      { slug: 'kung-pao-chicken', name: 'Kung Pao Chicken', price: 480, category: 'Mains', description: 'Stir-fried chicken with peanuts, chilies, and Szechuan pepper.' },
      { slug: 'sweet-sour-pork', name: 'Sweet & Sour Pork', price: 520, category: 'Mains', description: 'Crispy pork tossed in tangy bell pepper glaze.' },
      { slug: 'fried-rice', name: 'Vegetable Fried Rice', price: 320, category: 'Rice', description: 'Wok-tossed jasmine rice with seasonal vegetables.' },
      { slug: 'dumplings', name: 'Steamed Dumplings', price: 280, category: 'Starters', description: 'Pork and chive dumplings served with chili oil.' },
      { slug: 'hot-sour-soup', name: 'Hot & Sour Soup', price: 220, category: 'Soups', description: 'Silky tofu soup with mushrooms and white pepper.' },
      { slug: 'chow-mein', name: 'Chicken Chow Mein', price: 380, category: 'Noodles', description: 'Springy noodles with chicken, bean sprouts, and soy.' },
    ],
  },
  {
    slug: 'napoli-kitchen',
    owner: { email: 'napoli@foodrush.com', password: 'rest123', name: 'Napoli Kitchen', phone: '+92 300 2220003' },
    restaurant: {
      name: 'Napoli Kitchen',
      cuisine: 'Italian',
      address: 'F-7 Markaz, Islamabad',
      phone: '+92 51 28765432',
      description: 'Wood-fired pizzas and handmade pasta from family recipes.',
      rating: 4.7,
      isOpen: true,
    },
    menu: [
      { slug: 'margherita-pizza', name: 'Margherita Pizza', price: 890, category: 'Pizza', description: 'San Marzano tomato, fresh mozzarella, and basil.' },
      { slug: 'carbonara', name: 'Spaghetti Carbonara', price: 750, category: 'Pasta', description: 'Creamy pecorino sauce with guanciale and black pepper.' },
      { slug: 'lasagna', name: 'Beef Lasagna', price: 820, category: 'Pasta', description: 'Layered pasta with slow-braised beef ragu and béchamel.' },
      { slug: 'tiramisu', name: 'Tiramisu', price: 350, category: 'Dessert', description: 'Espresso-soaked ladyfingers with mascarpone cream.' },
      { slug: 'bruschetta', name: 'Tomato Bruschetta', price: 290, category: 'Starters', description: 'Grilled sourdough with marinated tomatoes and olive oil.' },
    ],
  },
  {
    slug: 'burger-forge',
    owner: { email: 'burger@foodrush.com', password: 'rest123', name: 'Burger Forge', phone: '+92 300 2220004' },
    restaurant: {
      name: 'Burger Forge',
      cuisine: 'Fast Food',
      address: 'DHA Phase 6, Karachi',
      phone: '+92 21 35345678',
      description: 'Smash burgers, crispy chicken, and loaded sides made to order.',
      rating: 4.5,
      isOpen: true,
    },
    menu: [
      { slug: 'smash-burger', name: 'Classic Smash Burger', price: 450, category: 'Burgers', description: 'Double smashed patties, cheddar, pickles, and secret sauce.' },
      { slug: 'chicken-burger', name: 'Crispy Chicken Burger', price: 420, category: 'Burgers', description: 'Buttermilk fried chicken with coleslaw and chipotle mayo.' },
      { slug: 'loaded-fries', name: 'Loaded Fries', price: 320, category: 'Sides', description: 'Crispy fries with cheese sauce, jalapeños, and bacon bits.' },
      { slug: 'onion-rings', name: 'Onion Rings', price: 250, category: 'Sides', description: 'Beer-battered rings with smoky paprika aioli.' },
      { slug: 'milkshake', name: 'Chocolate Milkshake', price: 280, category: 'Drinks', description: 'Thick shake blended with real chocolate ice cream.' },
    ],
  },
  {
    slug: 'spice-route',
    owner: { email: 'spice@foodrush.com', password: 'rest123', name: 'Spice Route', phone: '+92 300 2220005' },
    restaurant: {
      name: 'Spice Route',
      cuisine: 'Indian',
      address: 'Gulberg III, Lahore',
      phone: '+92 42 35881234',
      description: 'North Indian curries, tandoor breads, and street-food favorites.',
      rating: 4.9,
      isOpen: true,
    },
    menu: [
      { slug: 'butter-chicken', name: 'Butter Chicken', price: 580, category: 'Curry', description: 'Tandoori chicken in creamy tomato and butter gravy.' },
      { slug: 'paneer-tikka', name: 'Paneer Tikka', price: 420, category: 'Starters', description: 'Char-grilled cottage cheese with mint chutney.' },
      { slug: 'dal-makhani', name: 'Dal Makhani', price: 380, category: 'Curry', description: 'Slow-cooked black lentils finished with cream.' },
      { slug: 'garlic-naan', name: 'Garlic Naan', price: 45, category: 'Bread', description: 'Soft naan with garlic and coriander from the tandoor.' },
      { slug: 'mango-lassi', name: 'Mango Lassi', price: 180, category: 'Drinks', description: 'Chilled yogurt drink blended with Alphonso mango.' },
      { slug: 'samosa', name: 'Vegetable Samosa', price: 120, category: 'Starters', description: 'Crispy pastry filled with spiced potatoes and peas.' },
    ],
  },
  {
    slug: 'taco-fiesta',
    owner: { email: 'taco@foodrush.com', password: 'rest123', name: 'Taco Fiesta', phone: '+92 300 2220006' },
    restaurant: {
      name: 'Taco Fiesta',
      cuisine: 'Mexican',
      address: 'Bahria Town, Rawalpindi',
      phone: '+92 51 55123456',
      description: 'Street-style tacos, quesadillas, and fresh guacamole daily.',
      rating: 4.4,
      isOpen: true,
    },
    menu: [
      { slug: 'beef-tacos', name: 'Beef Tacos', price: 360, category: 'Tacos', description: 'Three soft tacos with seasoned beef, salsa, and lime.' },
      { slug: 'quesadilla', name: 'Chicken Quesadilla', price: 390, category: 'Mains', description: 'Grilled tortilla with chicken, peppers, and melted cheese.' },
      { slug: 'nachos', name: 'Nachos Supreme', price: 420, category: 'Starters', description: 'Tortilla chips loaded with beans, cheese, and jalapeños.' },
      { slug: 'guacamole', name: 'Guacamole & Chips', price: 310, category: 'Starters', description: 'Fresh avocado dip with house-fried tortilla chips.' },
      { slug: 'churros', name: 'Cinnamon Churros', price: 260, category: 'Dessert', description: 'Warm churros rolled in cinnamon sugar with chocolate dip.' },
    ],
  },
];
