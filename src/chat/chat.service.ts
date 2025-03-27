import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schemas';
import { Chat } from './shemas/chat.schema';
import { Message } from 'src/message/schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name)
    private chatModel: mongoose.Model<Chat>,
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
    @InjectModel(Message.name)
    private messageModel: mongoose.Model<Message>,
  ) {}

  async findUserByNik(nik: string): Promise<User | null> {
    return this.userModel.findOne({ nik }).exec();
  }

  async searchUsersByNik(nik: string): Promise<User[]> {
    return this.userModel.find({ nik: new RegExp(nik, 'i') }).exec();
  }

  async createChat(
    participantIds: string[],
    isGroup: boolean = false,
    groupName?: string,
  ): Promise<Chat> {
    if (!isGroup && participantIds.length !== 2) {
      throw new Error('Личный чат возможен только с 2 участниками');
    }

    const participants = participantIds.map((id) => new Types.ObjectId(id));
    const chat = new this.chatModel({
      participants,
      isGroup,
      groupName: isGroup ? groupName : null,
      messages: [],
    });

    return chat.save();
  }

  async sendMessage(
    chatId: string,
    senderId: string,
    content: string,
    fileUrl?: string,
  ): Promise<Message> {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) throw new Error('Чат не найден');

    // Создаём сообщение
    const message = new this.messageModel({
      senderId: new Types.ObjectId(senderId),
      receiverId: chat.isGroup
        ? null
        : chat.participants.find((id) => !id.equals(senderId)),
      content,
      fileUrl,
    });

    await message.save();

    // Обновляем чат
    chat.messages.push(message._id);
    chat.lastMessage = message._id;
    await chat.save();

    return message;
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    try {
      const chats = await this.chatModel
        .find({ participants: new Types.ObjectId(userId) })
        .sort({ updatedAt: -1 })
        .populate({
          path: 'lastMessage',
          select: 'content createdAt',
        })
        .populate({
          path: 'participants',
          select: 'name nik',
          match: { _id: { $ne: new Types.ObjectId(userId) } }, // Исключаем текущего пользователя
        })
        .lean() // Конвертируем в обычный объект для дебага
        .exec();

      console.log('Found chats:', chats); // Логируем результат
      return chats;
    } catch (error) {
      console.error('Error in getUserChats:', error);
      throw error;
    }
  }

  async getChatMessages(
    chatId: string,
    skip: number = 0,
    limit: number = 50,
  ): Promise<Message[]> {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) throw new Error('Чат не найден');

    return this.messageModel
      .find({ _id: { $in: chat.messages } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'name nik')
      .exec();
  }

  async getUnreadCount(userId: string, chatId: string): Promise<number> {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) return 0;

    const lastReadMessage = await this.messageModel
      .findOne({
        _id: { $in: chat.messages },
        senderId: { $ne: userId },
        readBy: { $ne: userId },
      })
      .sort({ createdAt: -1 });

    return lastReadMessage ? 1 : 0; // Упрощённый пример (реализуйте логику под вашу схему)
  }

  async deleteChat(chatId: string, userId: string): Promise<void> {
    // 1. Проверяем существование чата
    const chat = await this.chatModel.findOne({
      _id: new Types.ObjectId(chatId),
      participants: new Types.ObjectId(userId), // Пользователь должен быть участником
    });

    if (!chat) {
      throw new NotFoundException(
        'Чат не найден или у вас нет прав на удаление',
      );
    }

    // 2. Удаляем все сообщения чата
    await this.messageModel.deleteMany({
      _id: { $in: chat.messages },
    });

    // 3. Удаляем сам чат
    await this.chatModel.deleteOne({ _id: chat._id });
  }
}
