import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Message } from 'src/message/schemas/message.schema';

export type ChatDocument = Chat & Document;
@Schema({ timestamps: true })
export class Chat {

  @Prop({
    type: [{
      type: Types.ObjectId,
      ref: 'User'
    }],
    required: true
  })
  participants: Types.ObjectId[];

  @Prop({ default: false })
  isGroup: boolean;

  @Prop({ required: false })
  groupName?: string;

  @Prop({ type: [Message], default: [] })
  messages: Types.ObjectId[];

  @Prop({ type: Message, required: false })
  lastMessage?: Types.ObjectId;

  @Prop()
  fileUrl: string;
  
  unreadCount?: number;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

ChatSchema.index({ participants: 1 });
ChatSchema.index({ lastMessage: -1 });