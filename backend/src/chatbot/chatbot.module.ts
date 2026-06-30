import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { MenusModule } from '../menus/menus.module';
import { ChatConversation } from './chat-conversation.entity';
import { ChatMessageEntity } from './chat-message.entity';

@Module({
  imports: [
    MenusModule,
    TypeOrmModule.forFeature([ChatConversation, ChatMessageEntity]),
  ],
  providers: [ChatbotService],
  controllers: [ChatbotController],
})
export class ChatbotModule {}