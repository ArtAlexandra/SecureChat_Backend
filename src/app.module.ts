import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { MessagesModule } from './message/messages.module';
import { ChatModule } from './chat/chat.module';
import { MailModule } from './email/email.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URL),
    UserModule,
    MessagesModule,
    ChatModule,
    MailModule,
    FileModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
