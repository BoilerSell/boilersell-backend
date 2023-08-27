import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Chatroom } from './schemas/chatroom.schema';
import { Message } from './schemas/message.schema';

@Controller('chatrooms')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Post()
    async getOrCreateChatroom(@Body('user1') user1: string, @Body('user2') user2: string): Promise<Chatroom> {
        return this.messagesService.getOrCreateChatroom(user1, user2);
    }

    @Get(':chatroomId/messages')
    async getChatHistory(@Param('chatroomId') chatroomId: string): Promise<Message[]> {
        return this.messagesService.getChatHistory(chatroomId);
    }

    @Get('user/:userId')
    async getChatroomsForUser(@Param('userId') userId: string): Promise<Chatroom[]> {
      return this.messagesService.getChatroomsForUser(userId);
    }

    @Get(':chatroomId')
    async getChatroomById(@Param('chatroomId') chatroomId: string): Promise<Chatroom> {
    return this.messagesService.getChatroomById(chatroomId);
}

}