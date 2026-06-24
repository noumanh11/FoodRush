import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenusModule } from './menus/menus.module';
import { OrdersModule } from './orders/orders.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { User } from './users/user.entity';
import { Restaurant } from './restaurants/restaurant.entity';
import { MenuItem } from './restaurants/menu-item.entity';
import { Order } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'password'),
        database: config.get('DB_NAME', 'food_ordering_db'),
        entities: [User, Restaurant, MenuItem, Order, OrderItem],
        synchronize: config.get('NODE_ENV') !== 'production',
        migrations: ['dist/migrations/*.js'],
        migrationsRun: config.get('NODE_ENV') === 'production',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    UsersModule,
    RestaurantsModule,
    MenusModule,
    OrdersModule,
    ChatbotModule,
  ],
})
export class AppModule {}