import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schemas';
import { Chat } from './shemas/chat.schema';
import { Message } from 'src/message/schemas/message.schema';
import { PopulatedChat, PopulatedUser } from './interfaces/populated';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name)
    private chatModel: mongoose.Model<Chat>,
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
    @InjectModel(Message.name)
    private messageModel: mongoose.Model<Message>,
  ) { }

  async findUserByNik(nik: string): Promise<User | null> {
    return this.userModel.findOne({ nik }).exec();
  }

  async searchUsersByNik(nik: string): Promise<User[]> {
    return this.userModel.find({ nik: new RegExp(nik, 'i') }).exec();
  }

  async createChat(
    participantsIds: string[],
    isGroup: boolean = false,
    groupName?: string,
  ): Promise<Chat> {
    try {
      // Валидация параметров
      if (!participantsIds || participantsIds.length < 2) {
        throw new ConflictException('Chat must have at least 2 participants');
      }

      if (isGroup && !groupName) {
        throw new ConflictException('Group chat must have a name');
      }

      if (!isGroup && participantsIds.length !== 2) {
        throw new ConflictException('Private chat must have exactly 2 participants');
      }
      // Преобразование ID в ObjectId
      const participants = participantsIds.map(id => {
        try {
          return new Types.ObjectId(id);
        } catch (error) {
          throw new ConflictException(`Invalid user ID: ${id}`);
        }
      });

    const existingChat = await this.chatModel.findOne({
      participants: { $all: participants },
    });
    if(existingChat)  return existingChat;
  
      const newChatData: Partial<Chat> = {
        participants,
        isGroup,
        ...(isGroup && { groupName }),
      };

      const createdChat = await this.chatModel.create(newChatData);

      return createdChat.toObject();
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
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

  async getUserChats(userId: string): Promise<PopulatedChat[]> {
    try {
        const userObjectId = new Types.ObjectId(userId);
        const a = await this.chatModel
            .find({ participants: userObjectId })
            console.log(a)

        const chats = await this.chatModel
            .find({ participants: userObjectId })
            .sort({ updatedAt: -1 })
            .populate<{ participants: PopulatedUser[] }>({
                path: "participants",
                select: "name nik email",
                match: { _id: { $ne: userObjectId } }
            })
            .populate({
                path: "lastMessage",
                select: "content createdAt"
            })
            .lean<PopulatedChat[]>()
            .exec();
        const processedChats = await Promise.all(
            chats.map(async (chat) => {
                const participantsWithDetails = await Promise.all(
                    chat.participants.map(async (participantId) => {
                        const user = await this.userModel.findOne(
                            { _id: participantId },
                            { name: 1, nik: 1, email: 1 }
                        ).lean().exec();
                        return user || null;
                    })
                );
                const selectedinterlocutor = participantsWithDetails.find((item) => item._id.toString() !== userId);
                console.log("!!!!!!")
                console.log(participantsWithDetails)
                console.log(userId)
                return {
                    ...chat,
                    participants: participantsWithDetails.filter(p => p !== null),
                    interlocutor: selectedinterlocutor || null
                } as PopulatedChat;
            })
        );

        return processedChats;
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
