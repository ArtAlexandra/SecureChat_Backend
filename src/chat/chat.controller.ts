import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChat } from './dto/create-chat.dto';
import { CreateMessage } from 'src/message/dto/create-message.dto';
import { AuthGuard } from '../user/auth.guard';
import { UserDecorator } from 'src/decorators/user.decorator';
import { User } from 'src/user/schemas/user.schemas';

@Controller('chats')
@UseGuards(AuthGuard) // Защищаем все роуты контроллера
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Создать новый чат (личный или групповой)
   */
  @Post('/create-chat')
  @UseGuards(AuthGuard)
  async createChat(
    @Body() createChatDto: CreateChat,
    @UserDecorator() user: User,
  ) {
    const userId = user.id;
    return this.chatService.createChat(
      [userId, ...createChatDto.participantIds],
      createChatDto.isGroup,
      createChatDto.groupName,
    );
  }

  /**
   * Отправить сообщение в чат
   */
  @Post('/send-messages/:chatId')
  @UseGuards(AuthGuard)
  async sendMessage(
    @Param('chatId') chatId: string,
    @Body() sendMessageDto: CreateMessage,
    @UserDecorator() user: User,
  ) {
    const userId = user.id;
    return this.chatService.sendMessage(chatId, userId, sendMessageDto.content);
  }

  /**
   * Получить все чаты пользователя
   */
  @Get('/all-chats/:userId')
  @UseGuards(AuthGuard)
  async getUserChats(@Param('userId') user: User) {
    const userId = user.id;
    return this.chatService.getUserChats(userId);
  }

  /**
   * Получить сообщения чата (с пагинацией)
   */
  @Get('/messages/:chatId')
  @UseGuards(AuthGuard)
  async getChatMessages(
    @Param('chatId') chatId: string,
    @Query('skip') skip: number = 0,
    @Query('limit') limit: number = 50,
  ) {
    return this.chatService.getChatMessages(chatId, skip, limit);
  }

  /**
   * Получить количество непрочитанных сообщений в чате
   */
  @Get('unread-count/:chatId')
  @UseGuards(AuthGuard)
  async getUnreadCount(
    @Param('chatId') chatId: string,
    @UserDecorator() user: User,
  ) {
    const userId = user.id;
    return this.chatService.getUnreadCount(userId, chatId);
  }

  /**
   * Удалить чат
   */
  @Delete('/delete/:chatId')
  @UseGuards(AuthGuard)
  async deleteChat(
    @Param('chatId') chatId: string,
    @UserDecorator() user: User,
  ) {
    const userId = user.id;
    return this.chatService.deleteChat(chatId, userId);
  }
}
