import {
  Controller,
  Post,
  Put,
  Body,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { UserDecorator } from 'src/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessagesService } from './messages.service';
import { Message } from './schemas/message.schema';
import { CreateMessage } from './dto/create-message.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '../user/auth.guard';
import { User } from 'src/user/schemas/user.schemas';

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

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('/send')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async createMessage(
    @Body() data: CreateMessage,
    @UploadedFile() file: Express.Multer.File,
    @UserDecorator() user: User,
  ): Promise<Message> {
    const fileUrl = file ? `/uploads/${file.filename}` : undefined;
    const userId = user.id;
    return this.messagesService.createMessage(data, userId, fileUrl);
  }

  @Get('/get-message/:userId')
  async getMessages(@Param('userId') userId: string): Promise<{ messages: Message[]; unreadCount: number }> {
    return this.messagesService.getMessages(userId);
  }

  @Put('/update/:id')
  @UseGuards(AuthGuard)
  async updateMessage(
    @Param('id') id: string,
    @UserDecorator() user: User,
    @Body('content') content: string,
  ) {
    try {
      if (!content || content.trim().length === 0) {
        throw new BadRequestException('Content cannot be empty');
      }
      const userId = user.id;
      return await this.messagesService.updateMessage(id, userId, content);
    } catch (error) {
      throw error;
    }
  }

  @Delete('/delete/:id')
  @UseGuards(AuthGuard)
  async deleteMessage(@Param('id') id: string, @UserDecorator() user: User) {
    try {
      const userId = user.id;
      return await this.messagesService.deleteMessage(id, userId);
    } catch (error) {
      throw error;
    }
  }
}
