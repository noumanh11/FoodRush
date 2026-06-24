import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../restaurants/menu-item.entity';
import { CreateMenuItemDto } from './create-menu-item.dto';
import { UpdateMenuItemDto } from './update-menu-item.dto';
import { RestaurantsService } from '../restaurants/restaurants.service';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async create(restaurantId: string, dto: CreateMenuItemDto, userId: string): Promise<MenuItem> {
    const restaurant = await this.restaurantsService.findOne(restaurantId);
    if (restaurant.ownerId !== userId) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    const item = this.menuItemRepository.create({ ...dto, restaurantId });
    return this.menuItemRepository.save(item);
  }

  async findByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    await this.restaurantsService.findOne(restaurantId);
    return this.menuItemRepository.find({
      where: { restaurantId },
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<MenuItem> {
    const item = await this.menuItemRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  async update(id: string, dto: UpdateMenuItemDto, userId: string): Promise<MenuItem> {
    const item = await this.findOne(id);
    const restaurant = await this.restaurantsService.findOne(item.restaurantId);
    if (restaurant.ownerId !== userId) {
      throw new ForbiddenException('You do not own this restaurant');
    }
    Object.assign(item, dto);
    return this.menuItemRepository.save(item);
  }

  async remove(id: string, userId: string): Promise<void> {
    const item = await this.findOne(id);
    const restaurant = await this.restaurantsService.findOne(item.restaurantId);
    if (restaurant.ownerId !== userId) {
      throw new ForbiddenException('You do not own this restaurant');
    }
    await this.menuItemRepository.remove(item);
  }

  async findAllForChatbot(): Promise<MenuItem[]> {
    return this.menuItemRepository.find({
      where: { isAvailable: true },
      relations: ['restaurant'],
      order: { name: 'ASC' },
    });
  }
}