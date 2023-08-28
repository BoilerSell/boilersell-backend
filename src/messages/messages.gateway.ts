import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Server, Socket } from 'socket.io'


@WebSocketGateway({
  cors: {
    origin: [process.env.CLIENT],
    credentials: true
  }
})
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}
  

  @SubscribeMessage('createMessage')
  async create(@MessageBody() createMessageDto: CreateMessageDto): Promise<void> {
    const newMessage = await this.messagesService.createMessage(createMessageDto)
    this.server.to(createMessageDto.chatroomId).emit('newMessage', newMessage)
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@MessageBody() data: { chatroomId: string, userId: string }, @ConnectedSocket() client: Socket): Promise<void> {
    client.join(data.chatroomId);
    if (data.userId) {
    const readMessageIds = await this.messagesService.markUnreadMessagesAsRead(data.chatroomId, data.userId);
    // Emit the IDs of the messages that were just marked as read.
    client.emit('messagesRead', { messageIds: readMessageIds, readBy: data.userId });
    client.to(data.chatroomId).emit('messagesRead', { messageIds: readMessageIds, readBy: data.userId });
    }
  }
  
  @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@MessageBody() data: { chatroomId: string }, @ConnectedSocket() client: Socket): void {
    client.leave(data.chatroomId);
  }

  @SubscribeMessage('typing')
  async typing(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<void> {
    this.server.to(data.chatroomId).emit('typing', { userId: data.userId, isTyping: data.isTyping });
  }

  @SubscribeMessage('getChatHistory')
  async handleChatHistoryRequest(@MessageBody() data: { chatroomId: string }, @ConnectedSocket() client: Socket): Promise<void> {
    const chatHistory = await this.messagesService.getChatHistory(data.chatroomId);
    client.emit('chatHistory', chatHistory);
}

  @SubscribeMessage('markAsRead')
  async markAsRead(@MessageBody() data: { messageId: string, userId: string, chatroomId: string}, @ConnectedSocket() client: Socket): Promise<void> {
    await this.messagesService.markMessageAsRead(data.messageId, data.userId);
    this.server.to(data.chatroomId).emit('messageRead', { messageId: data.messageId, readBy: data.userId });
  }

  @SubscribeMessage('getLastMessagesForUser')
  async getLastMessagesForUser(@MessageBody() userId: string, @ConnectedSocket() client: Socket): Promise<void> {
    const lastMessages = await this.messagesService.getLastMessagesForUser(userId);
    client.emit('lastMessagesForUser', lastMessages);
  }
  
}