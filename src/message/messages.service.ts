import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Message } from './schemas/message.schema';
import { CreateMessage } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: mongoose.Model<Message>,
  ) {}

  async createMessage(
    data: CreateMessage,
    userId: string,
    fileUrl?: string,
  ): Promise<Message> {
    const message = new this.messageModel({
      senderId: userId,
      receiverId: data.receiverId,
      content: data.content,
      fileUrl,
    });
    return message.save();
  }

  async getMessages(userId: string): Promise<Message[]> {
    return this.messageModel
      .find({ $or: [{ senderId: userId }, { receiverId: userId }] })
      .exec();
  }

  async updateMessage(
    messageId: string,
    userId: string,
    content: string,
  ): Promise<Message> {
    try {
      const message = await this.messageModel.findById(messageId).exec();

      if (!message) {
        throw new NotFoundException('Message not found');
      }
      if (message.senderId !== userId) {
        throw new ForbiddenException('You can only edit your own messages');
      }

      message.content = content;
      return await message.save();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update message');
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageModel.findById(messageId).exec();
    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }
    if (message.senderId.toString() !== userId) {
      throw new ForbiddenException('Вы можете удалять только свои сообщения');
    }
    await this.messageModel.findByIdAndDelete(messageId).exec();
  }
}
