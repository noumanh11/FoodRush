import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatMessageDto } from './chat-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  async chat(@Body() dto: ChatMessageDto) {
    const reply = await this.chatbotService.chat(dto.message);
    return { reply };
  }
}
