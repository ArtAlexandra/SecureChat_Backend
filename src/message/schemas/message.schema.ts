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
}

export const MessageSchema = SchemaFactory.createForClass(Message);
