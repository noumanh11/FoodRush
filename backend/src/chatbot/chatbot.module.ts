import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { MenusModule } from '../menus/menus.module';

@Module({
  imports: [MenusModule],
  providers: [ChatbotService],
  controllers: [ChatbotController],
})
export class ChatbotModule {}