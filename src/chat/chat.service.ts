import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schemas';
import { Chat } from './shemas/chat.schema';
import { Message } from 'src/message/schemas/message.schema';
import { PopulatedChat, PopulatedUser } from './interfaces/populated';
import { IChangeInfoChat, IInfoChat } from './interfaces/infoChat';

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
    fileUrl?: string,
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
        throw new ConflictException(
          'Private chat must have exactly 2 participants',
        );
      }
      // Преобразование ID в ObjectId
      const participants = participantsIds.map((id) => {
        try {
          return new Types.ObjectId(id);
        } catch {
          throw new ConflictException(`Invalid user ID: ${id}`);
        }
      });
      const existingChat = await this.chatModel.findOne({
        participants: { $all: participants },
      });
      if (existingChat) return existingChat;

      const newChatData: Partial<Chat> = {
        participants,
        isGroup,
        fileUrl,
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

    const message = new this.messageModel({
      senderId: new Types.ObjectId(senderId),
      receiverId: chat.participants.find((id) => !id.equals(senderId)),
      content,
      fileUrl,
      chat: chatId,
      readBy: [new Types.ObjectId(senderId)],
    });

    await message.save();

    chat.messages.push(message._id);
    chat.lastMessage = message._id;
    await chat.save();

    return message;
  }

  async getUserChats(userId: string): Promise<PopulatedChat[]> {
    try {
      const userObjectId = new Types.ObjectId(userId);

      const chats = await this.chatModel
        .find({ participants: userObjectId })
        .sort({ updatedAt: -1 })
        .populate<{ participants: PopulatedUser[] }>({
          path: 'participants',
          select: 'name nik email image fileUrl',
          match: { _id: { $ne: userObjectId } },
        })
        .populate<{ lastMessage: PopulatedChat['lastMessage'] }>({
          path: 'lastMessage',
          select: 'content createdAt',
        })
        .lean()
        .exec();
      const processedChats = await Promise.all(
        chats.map(async (chat) => {
          const participantsWithDetails = await Promise.all(
            chat.participants.map(async (participantId) => {
              const user = await this.userModel
                .findOne(
                  { _id: participantId },
                  { name: 1, nik: 1, email: 1, image: 1 },
                )
                .lean()
                .exec();
              return user as PopulatedUser;
            }),
          );

          const selectedInterlocutor = participantsWithDetails.find(
            (item) => item && item._id.toString() !== userId,
          );

          const unreadCount = await this.messageModel.countDocuments({
            _id: { $in: chat.messages },
            readBy: { $nin: [new Types.ObjectId(userId)] },
          });
          return {
            ...chat,
            participants: participantsWithDetails.filter((p) => p !== null),
            interlocutor: selectedInterlocutor || null,
            unreadCount,
            isGroup: chat.isGroup,
            groupName: chat.groupName,
            fileUrl: chat?.fileUrl,
            lastMessage: chat.lastMessage
              ? {
                content: chat.lastMessage.content,
                createdAt: chat.lastMessage.createdAt,
                _id: chat.lastMessage._id,
              }
              : null,
          } as unknown as PopulatedChat;
        }),
      );
      return processedChats;
    } catch (error) {
      console.error('Error in getUserChats:', error);
      throw error;
    }
  }

  async getChatById(userId: string, chatId: string): Promise<IInfoChat> {
    const chat = await this.chatModel.findById(chatId);

    const users: User[] = [];

    for (let i = 0; i < chat.participants.length; i++) {
      const user = await this.userModel.findById(chat.participants[i]);
      users.push(user);
    }

    const interlocutors = users.filter(
      (item) => item && item._id.toString() !== userId,
    );

    return {
      _id: chat._id,
      logo: chat.isGroup ? chat.fileUrl : interlocutors[0].image,
      title: chat.isGroup ? chat.groupName : interlocutors[0].nik,
      participants: chat.isGroup ? users : interlocutors,
    };
  }

  async changeChatById(
    chatId: string,
    chatInfo: Partial<IChangeInfoChat>,
    file?: string
  ): Promise<void> {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new ConflictException('Чат не найден');
    }
    const updateData: Partial<IInfoChat> = {};
    updateData.title = chatInfo.title || chat.groupName;
    updateData.logo = file || chat.fileUrl;
    const users = chatInfo.participantIds ? chatInfo.participantIds.map(id => new Types.ObjectId(id)) : chat.participants;
    await this.chatModel.updateOne(
      { _id: chatId },
      {
        $set: {
          groupName: updateData.title,
          fileUrl: updateData.logo,
          participants: users
        }
      },
      { runValidators: true }
    );
    const updatedChat = await this.chatModel.findById(chatId).lean();
    if (!updatedChat) {
      throw new ConflictException('Не удалось обновить чат');
    }
  }


  async getChatMessages(
    chatId: string,
    userId: string,
    skip: number = 0,
    limit: number = 50,
  ): Promise<Message[]> {
    const chat = await this.chatModel
      .findById(chatId)
      .select('messages')
      .lean()
      .exec();

    if (!chat) throw new NotFoundException('Чат не найден');

    await this.messageModel
      .updateMany(
        {
          _id: { $in: chat.messages },
          readBy: { $nin: [new Types.ObjectId(userId)] },
        },
        { $addToSet: { readBy: new Types.ObjectId(userId) } },
      )
      .exec();

    return this.messageModel
      .find({ _id: { $in: chat.messages } })
      .sort({ createdAt: 1 })
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

    return lastReadMessage ? 1 : 0;
  }

  async getUnreadChatsCount(userId: string): Promise<number> {
    const result = await this.messageModel
      .aggregate([
        {
          $match: {
            receiverId: userId,
            isRead: false,
          },
        },
        {
          $group: {
            _id: '$chatId',
          },
        },
        {
          $count: 'unreadChats',
        },
      ])
      .exec();

    return result[0]?.unreadChats || 0;
  }

  async deleteChat(chatId: string, userId: string): Promise<void> {
    const chat = await this.chatModel.findOne({
      _id: new Types.ObjectId(chatId),
      participants: new Types.ObjectId(userId),
    });

    if (!chat) {
      throw new NotFoundException(
        'Чат не найден или у вас нет прав на удаление',
      );
    }

    await this.messageModel.deleteMany({
      _id: { $in: chat.messages },
    });

    await this.chatModel.deleteOne({ _id: chat._id });
  }
}
