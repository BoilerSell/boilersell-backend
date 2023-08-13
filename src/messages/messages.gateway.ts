import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Server, Socket } from 'socket.io'


@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true
  }
})
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('createMessage')
  async create(@MessageBody() createMessageDto: CreateMessageDto): Promise<void> {
    const newMessage = await this.messagesService.createMessage(createMessageDto);
    this.server.to(createMessageDto.chatroomId).emit('newMessage', newMessage);
  }

  @SubscribeMessage('joinRoom')
    handleJoinRoom(@MessageBody() data: { chatroomId: string }, @ConnectedSocket() client: Socket): void {
    client.join(data.chatroomId);
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
  
}