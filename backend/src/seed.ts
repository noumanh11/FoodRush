import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { RestaurantsService } from './restaurants/restaurants.service';
import { MenusService } from './menus/menus.service';
import { UserRole } from './users/user.entity';

const RESTAURANT_EMAIL = 'restaurant@foodrush.com';
const MENU_ITEMS = [
  { name: 'Chicken Biryani', price: 350, category: 'Rice', description: 'Fragrant basmati rice with tender chicken' },
  { name: 'Beef Biryani', price: 400, category: 'Rice', description: 'Spicy beef biryani with hand-pounded spices' },
  { name: 'Mutton Karahi', price: 650, category: 'Curry', description: 'Slow-cooked mutton in tomato gravy' },
  { name: 'Chicken Karahi', price: 550, category: 'Curry', description: 'Classic chicken karahi with ginger' },
  { name: 'Garlic Naan', price: 40, category: 'Bread', description: 'Tandoor-baked garlic naan' },
  { name: 'Raita', price: 50, category: 'Sides', description: 'Yogurt with cucumber and mint' },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const restaurantsService = app.get(RestaurantsService);
  const menusService = app.get(MenusService);

  const ADMIN_EMAIL = 'admin@foodrush.com';
  try {
    const admin = await usersService.createWithRole(
      { email: ADMIN_EMAIL, password: 'admin123', name: 'Admin' },
      UserRole.ADMIN,
    );
    console.log('✅ Admin created:', admin.email);
  } catch (e: any) {
    const fixed = await usersService.ensureRole(ADMIN_EMAIL, UserRole.ADMIN);
    if (fixed) {
      console.log('✅ Admin role ensured:', fixed.email);
    } else {
      console.log('ℹ️ Admin:', e?.message || 'already exists');
    }
  }

  let owner = await usersService.findByEmail(RESTAURANT_EMAIL);
  if (!owner) {
    try {
      owner = await usersService.create({
        email: RESTAURANT_EMAIL,
        password: 'rest123',
        name: 'Biryani House',
        role: UserRole.RESTAURANT,
      });
      console.log('✅ Restaurant owner created:', owner.email);
    } catch (e: any) {
      console.error('❌ Failed to create restaurant owner:', e?.message);
    }
  } else {
    console.log('ℹ️ Restaurant owner already exists:', owner.email);
  }

  try {
    const customer = await usersService.create({
      email: 'customer@foodrush.com',
      password: 'cust123',
      name: 'Ahmed',
      role: UserRole.USER,
    });
    console.log('✅ Customer created:', customer.email);
  } catch (e: any) {
    console.log('ℹ️ Customer:', e?.message || 'already exists');
  }

  if (owner) {
    let restaurant = await restaurantsService.findByOwner(owner.id);

    if (!restaurant) {
      try {
        restaurant = await restaurantsService.create(
          {
            name: 'Biryani House',
            cuisine: 'Pakistani',
            address: 'Karachi',
            phone: '+92 300 0000000',
            description: 'Best biryani in town',
          },
          owner,
        );
        console.log('✅ Restaurant created:', restaurant.name);
      } catch (e: any) {
        console.error('❌ Failed to create restaurant:', e?.message);
      }
    } else {
      console.log('ℹ️ Restaurant already exists:', restaurant.name);
    }

    if (restaurant) {
      const existingMenu = await menusService.findByRestaurant(restaurant.id);
      const existingNames = new Set(existingMenu.map((m) => m.name));

      for (const item of MENU_ITEMS) {
        if (existingNames.has(item.name)) {
          console.log(`  ℹ️ Menu item exists: ${item.name}`);
          continue;
        }
        try {
          await menusService.create(
            restaurant.id,
            { ...item, isAvailable: true },
            owner.id,
          );
          console.log(`  ✅ Menu item: ${item.name}`);
        } catch (e: any) {
          console.log(`  ⚠️ Menu item ${item.name}:`, e?.message);
        }
      }
    }
  }

  console.log('\n🎉 Seeding complete!');
  await app.close();
}

bootstrap().catch(console.error);
