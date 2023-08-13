import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chatroom } from './schemas/chatroom.schema';
import { Message } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel('Chatroom') private chatroomModel: Model<Chatroom>,
    @InjectModel('Message') private messageModel: Model<Message>,
  ) {}

  async getOrCreateChatroom(user1: string, user2: string): Promise<Chatroom> {
    let chatroomId = await this.chatroomModel.findOne({
      $or: [
        { user1: user1, user2: user2 },
        { user1: user2, user2: user1 },
      ],
    });
    if (!chatroomId) {
      chatroomId = await new this.chatroomModel({ user1, user2 }).save();
    }
    return chatroomId;
  }

  async getChatHistory(chatroomId: string): Promise<Message[]> {
    try {
      return this.messageModel.find({ chatroomId: chatroomId }).sort({ timestamp: 1 });
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw new Error('Failed to fetch chat history');
    }
  }
  
  async createMessage(dto: CreateMessageDto): Promise<Message> {
    const message = new this.messageModel(dto);
    return message.save();
  }

  async getChatroomsForUser(userId: string): Promise<Chatroom[]> {
    return this.chatroomModel.find({
        $or: [
            { user1: userId },
            { user2: userId },
        ],
    });
}
}
