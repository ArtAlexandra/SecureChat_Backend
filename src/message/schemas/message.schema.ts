import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Message {
  @Prop({ require })
  senderId: string;

  @Prop({ require })
  receiverId: string;

  @Prop()
  content: string;

  @Prop()
  fileUrl: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({default: false})
  isRead: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ receiverId: 1, isRead: 1 });
MessageSchema.index({ _id: 1, receiverId: 1, isRead: 1 });