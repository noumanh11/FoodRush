import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './users/user.entity';
import { Restaurant } from './restaurants/restaurant.entity';
import { MenuItem } from './restaurants/menu-item.entity';
import { Order } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'food_ordering_db',
  entities: [User, Restaurant, MenuItem, Order, OrderItem],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
