import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schemas';
import { Message } from 'src/message/schemas/message.schema';

export type ChatDocument = Chat & Document;
@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: [User], required: true })
  participants: Types.ObjectId[]; // Участники чата (ссылки на User)

  @Prop({ default: false })
  isGroup: boolean; // Флаг группового чата

  @Prop({ required: false })
  groupName?: string; // Название группы (если isGroup = true)

  @Prop({ type: [Message], default: [] })
  messages: Types.ObjectId[]; // Сообщения чата (ссылки на Message)

  @Prop({ type: Message, required: false })
  lastMessage?: Types.ObjectId; // Последнее сообщение (для сортировки чатов)

  // Виртуальное поле для количества непрочитанных (вычисляется в сервисе)
  unreadCount?: number;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

// Индексы для ускорения поиска
ChatSchema.index({ participants: 1 }); // Поиск чатов по участнику
ChatSchema.index({ lastMessage: -1 }); // Сортировка по последнему сообщению
