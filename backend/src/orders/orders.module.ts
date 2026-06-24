import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MenusModule } from '../menus/menus.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), MenusModule, RestaurantsModule],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}