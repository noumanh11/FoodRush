import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { RestaurantsService } from './restaurants/restaurants.service';
import { MenusService } from './menus/menus.service';
import { User, UserRole } from './users/user.entity';
import { Restaurant } from './restaurants/restaurant.entity';
import { MenuItem } from './restaurants/menu-item.entity';
import { Order } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';
import { CUSTOMERS, RESTAURANTS, IMG } from './seed-data';

async function ensureUser(
  usersService: UsersService,
  data: { email: string; password: string; name: string; phone?: string },
  role: UserRole,
): Promise<User> {
  const existing = await usersService.findByEmail(data.email);
  if (existing) return existing;

  if (role === UserRole.ADMIN) {
    return usersService.createWithRole(
      { email: data.email, password: data.password, name: data.name, phone: data.phone },
      UserRole.ADMIN,
    );
  }

  return usersService.create({
    email: data.email,
    password: data.password,
    name: data.name,
    phone: data.phone,
    role,
  });
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const restaurantsService = app.get(RestaurantsService);
  const menusService = app.get(MenusService);
  const restaurantRepo = app.get(getRepositoryToken(Restaurant));
  const menuRepo = app.get(getRepositoryToken(MenuItem));

  // Admin
  try {
    const admin = await ensureUser(
      usersService,
      { email: 'admin@foodrush.com', password: 'admin123', name: 'Admin' },
      UserRole.ADMIN,
    );
    console.log('✅ Admin:', admin.email);
  } catch (e: any) {
    const fixed = await usersService.ensureRole('admin@foodrush.com', UserRole.ADMIN);
    console.log(fixed ? '✅ Admin role ensured' : `ℹ️ Admin: ${e?.message}`);
  }

  // Customers
  for (const customer of CUSTOMERS) {
    try {
      const user = await ensureUser(usersService, customer, UserRole.USER);
      console.log('✅ Customer:', user.email);
    } catch (e: any) {
      console.log(`ℹ️ Customer ${customer.email}:`, e?.message || 'exists');
    }
  }

  // Restaurants + menus
  for (const entry of RESTAURANTS) {
    const owner = await ensureUser(
      usersService,
      { ...entry.owner, phone: entry.owner.phone },
      UserRole.RESTAURANT,
    );

    let restaurant = await restaurantsService.findByOwner(owner.id);

    if (!restaurant) {
      restaurant = await restaurantsService.create(
        {
          ...entry.restaurant,
          imageUrl: IMG.restaurants(entry.slug),
        },
        owner,
      );
      console.log(`✅ Restaurant created: ${restaurant.name}`);
    } else {
      await restaurantRepo.update(restaurant.id, {
        ...entry.restaurant,
        imageUrl: IMG.restaurants(entry.slug),
      });
      restaurant = await restaurantsService.findOne(restaurant.id);
      console.log(`ℹ️ Restaurant updated: ${restaurant.name}`);
    }

    const existingMenu = await menusService.findByRestaurant(restaurant.id);
    const byName = new Map(existingMenu.map((m) => [m.name, m]));

    for (const item of entry.menu) {
      const imageUrl = IMG.menu(item.slug);
      const existing = byName.get(item.name);

      if (existing) {
        if (existing.imageUrl !== imageUrl) {
          await menuRepo.update(existing.id, { imageUrl });
          console.log(`  ↻ Image updated: ${item.name}`);
        } else {
          console.log(`  ℹ️ Menu item exists: ${item.name}`);
        }
        continue;
      }

      await menusService.create(
        restaurant.id,
        {
          name: item.name,
          price: item.price,
          category: item.category,
          description: item.description,
          imageUrl,
          isAvailable: true,
        },
        owner.id,
      );
      console.log(`  ✅ Menu item: ${item.name}`);
    }
  }

  // Create sample orders for demonstration
  const orderRepo = app.get(getRepositoryToken(Order));
  const orderItemRepo = app.get(getRepositoryToken(OrderItem));

  const demoCustomer = await usersService.findByEmail('customer@foodrush.com');
  const demoOwner = await usersService.findByEmail('restaurant@foodrush.com');
  const demoRestaurant = await restaurantsService.findByOwner(demoOwner.id);
  const demoMenuItems = await menusService.findByRestaurant(demoRestaurant.id);

  if (demoCustomer && demoRestaurant && demoMenuItems.length > 0) {
    const existingOrders = await orderRepo.find({ where: { userId: demoCustomer.id } });
    if (existingOrders.length === 0) {
      console.log('\n📦 Seeding demo orders...');
      
      const states = [
        { status: 'delivered', daysAgo: 5, items: [{ item: demoMenuItems[0], qty: 2 }, { item: demoMenuItems[1], qty: 1 }] },
        { status: 'delivered', daysAgo: 3, items: [{ item: demoMenuItems[0], qty: 1 }, { item: demoMenuItems[4], qty: 2 }] },
        { status: 'delivered', daysAgo: 1, items: [{ item: demoMenuItems[2], qty: 1 }, { item: demoMenuItems[5], qty: 1 }] },
        { status: 'pending', daysAgo: 0, items: [{ item: demoMenuItems[0], qty: 1 }] },
        { status: 'confirmed', daysAgo: 0, items: [{ item: demoMenuItems[3], qty: 1 }] },
      ];

      for (const s of states) {
        const orderItems: any[] = s.items.map(si => {
          const subtotal = Number(si.item.price) * si.qty;
          return orderItemRepo.create({
            menuItemId: si.item.id,
            menuItemName: si.item.name,
            quantity: si.qty,
            unitPrice: si.item.price,
            subtotal,
          });
        });

        const totalAmount = orderItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - s.daysAgo);

        const order = orderRepo.create({
          userId: demoCustomer.id,
          restaurantId: demoRestaurant.id,
          totalAmount,
          status: s.status as any,
          deliveryAddress: 'DHA Phase 5, Karachi',
          notes: 'Deliver hot, please!',
          items: orderItems,
          createdAt: orderDate,
          updatedAt: orderDate,
        });

        await orderRepo.save(order);
        console.log(`  ✅ Seeded ${s.status} order (Total: PKR ${totalAmount})`);
      }
    }
  }

  console.log('\n🎉 Seeding complete!');
  console.log('\nDemo accounts:');
  console.log('  Admin:      admin@foodrush.com / admin123');
  console.log('  Customer:   customer@foodrush.com / cust123');
  console.log('  Restaurant: restaurant@foodrush.com / rest123');
  console.log('  (+ 3 more customers, 5 more restaurants — see seed-data.ts)\n');

  await app.close();
}

bootstrap().catch(console.error);
