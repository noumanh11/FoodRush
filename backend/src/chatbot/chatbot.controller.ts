import { Controller, Get, Post, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatMessageDto } from './chat-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  async chat(@Body() dto: ChatMessageDto) {
    const reply = await this.chatbotService.chat(dto.message, dto.history);
    return { reply };
  }

  @Get('conversations')
  async getConversations(@Req() req: any) {
    return this.chatbotService.getConversations(req.user.id);
  }

  @Post('conversations')
  async createConversation(@Req() req: any) {
    return this.chatbotService.createConversation(req.user.id);
  }

  @Get('conversations/:id/messages')
  async getMessages(@Param('id') id: string, @Req() req: any) {
    return this.chatbotService.getMessages(id, req.user.id);
  }

  @Delete('conversations/:id')
  async deleteConversation(@Param('id') id: string, @Req() req: any) {
    await this.chatbotService.deleteConversation(id, req.user.id);
    return { success: true };
  }

  @Post('conversations/:id/message')
  async chatInConversation(
    @Param('id') id: string,
    @Body() dto: { message: string },
    @Req() req: any,
  ) {
    const reply = await this.chatbotService.chatInConversation(id, req.user.id, dto.message);
    return { reply };
  }
}
