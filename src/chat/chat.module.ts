import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatSchema } from './shemas/chat.schema';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UserSchema } from 'src/user/schemas/user.schemas';
import { MessageSchema } from 'src/message/schemas/message.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Chat', schema: ChatSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
  ],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
