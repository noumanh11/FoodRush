import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuItemDto } from './create-menu-item.dto';
import { UpdateMenuItemDto } from './update-menu-item.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User } from '../users/user.entity';

@Controller()
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get('restaurants/:restaurantId/menu')
  findByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.menusService.findByRestaurant(restaurantId);
  }

  @Post('restaurants/:restaurantId/menu')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT)
  create(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateMenuItemDto,
    @CurrentUser() user: User,
  ) {
    return this.menusService.create(restaurantId, dto, user.id);
  }

  @Patch('menu/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
    @CurrentUser() user: User,
  ) {
    return this.menusService.update(id, dto, user.id);
  }

  @Delete('menu/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.menusService.remove(id, user.id);
  }
}