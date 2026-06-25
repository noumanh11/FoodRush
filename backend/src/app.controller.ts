import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  health() {
    return {
      status: 'ok',
      message: 'FoodRush API is running',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        restaurants: '/api/restaurants',
        orders: '/api/orders',
        chatbot: '/api/chatbot',
      },
    };
  }
}
