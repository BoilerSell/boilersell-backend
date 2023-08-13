import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatroomSchema } from './schemas/chatroom.schema';
import { MessageSchema } from './schemas/message.schema';
import { AccountSchema } from 'src/account/schema/account.schema';
import { MessagesController } from './messages.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Account', schema: AccountSchema }]),
    MongooseModule.forFeature([{ name: 'Chatroom', schema: ChatroomSchema }]),
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
  ],
  providers: [MessagesGateway, MessagesService],
  controllers: [MessagesController]
})
export class MessagesModule {}
