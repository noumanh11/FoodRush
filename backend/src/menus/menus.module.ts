import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from '../restaurants/menu-item.entity';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { RestaurantsModule } from '../restaurants/restaurants.module';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItem]), RestaurantsModule],
  providers: [MenusService],
  controllers: [MenusController],
  exports: [MenusService],
})
export class MenusModule {}