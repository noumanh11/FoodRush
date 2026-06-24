import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './create-order.dto';
import { UpdateOrderStatusDto } from './update-order-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, User } from '../users/user.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: User) {
    return this.ordersService.create(dto, user);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  getMyOrders(@CurrentUser() user: User) {
    return this.ordersService.findUserOrders(user.id);
  }

  @Get('restaurant/:restaurantId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT)
  getRestaurantOrders(
    @Param('restaurantId') restaurantId: string,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.findRestaurantOrders(restaurantId, user.id);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAllOrders() {
    return this.ordersService.findAllOrders();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.ordersService.findOne(id, user);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  cancelOrder(@Param('id') id: string, @CurrentUser() user: User) {
    return this.ordersService.cancelOrder(id, user);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.updateStatus(id, dto, user);
  }
}
