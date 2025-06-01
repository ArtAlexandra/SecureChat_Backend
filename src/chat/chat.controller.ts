import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Patch,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChat } from './dto/create-chat.dto';
import { CreateMessage } from 'src/message/dto/create-message.dto';
import { AuthGuard } from '../user/auth.guard';
import { UserDecorator } from 'src/decorators/user.decorator';
import { User } from 'src/user/schemas/user.schemas';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { IChangeInfoChat, IInfoChat } from './interfaces/infoChat';

export const multerOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `${uniqueSuffix}${ext}`;
      callback(null, filename);
    },
  }),
};

@Controller('chats')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  /**
   * Создать новый чат (личный или групповой)
   */
  @Post('/create-chat')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async createChat(
    @Body() createChatDto: CreateChat,
    @UserDecorator() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {

    try {
      const fileUrl = file ? `/uploads/${file.filename}` : undefined;
      const userId = user.id;
      return this.chatService.createChat(
        [userId, ...createChatDto.participantIds],
        createChatDto.isGroup,
        createChatDto.groupName,
        fileUrl
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          warning: error.message,
        },
        HttpStatus.CONFLICT,
        {
          cause: error,
        },
      );
    }


  }

  /**
   * Отправить сообщение в чат
   */
  @Post('/send-messages/:chatId')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async sendMessage(
    @Param('chatId') chatId: string,
    @Body() sendMessageDto: CreateMessage,
    @UploadedFile() file: Express.Multer.File,
    @UserDecorator() user: User,
  ) {
    const fileUrl = file ? `/uploads/${file.filename}` : undefined;
    const userId = user.id;
    return this.chatService.sendMessage(chatId, userId, sendMessageDto.content, fileUrl);
  }

  /**
  * Получить чат по id
  */
  @Get('/chat-by-id/:chatId')
  @UseGuards(AuthGuard)
  async getChatById(
    @Param('chatId') chatId: string,
    @UserDecorator() user: User) {
    const userId = user.id;
    return this.chatService.getChatById(userId, chatId);
  }


  /**
* Получить чат по id
*/
  @Patch('/chat-by-id/:chatId')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async changeChatById(
    @Param('chatId') chatId: string,
    @Body() infoChat: IChangeInfoChat,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const fileUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.chatService.changeChatById(chatId, infoChat, fileUrl);
  }

  /**
   * Получить все чаты пользователя
   */
  @Get('/all-chats')
  @UseGuards(AuthGuard)
  async getUserChats(@UserDecorator() user: User) {
    const userId = user.id;
    return this.chatService.getUserChats(userId);
  }

  /**
   * Получить сообщения чата (с пагинацией)
   */
  @Get('/messages/:chatId')
  @UseGuards(AuthGuard)
  async getChatMessages(
    @UserDecorator() user: User,
    @Param('chatId') chatId: string,
    @Query('skip') skip: number = 0,
    @Query('limit') limit: number = 50,
  ) {
    const userId = user.id;
    return this.chatService.getChatMessages(chatId, userId, skip, limit);
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

  /**
 * Получить общее количество непрочитанных чатов
 */
  @Get('/unread-chats')
  @UseGuards(AuthGuard)
  async getUnreadChatsCount(@UserDecorator() user: User) {
    const userId = user.id;
    return this.chatService.getUnreadChatsCount(userId);
  }

}
