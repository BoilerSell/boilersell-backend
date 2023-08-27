import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chatroom } from './schemas/chatroom.schema';
import { Message } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel('Chatroom') private chatroomModel: Model<Chatroom>,
    @InjectModel('Message') private messageModel: Model<Message>,
    private readonly uploadService: UploadService
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

    
      if (dto.image && !dto.image.startsWith('http://') && !dto.image.startsWith('https://')) {
        console.log('hihihi')

        const base64Data = dto.image.replace(/^data:image\/\w+;base64,/, "");
      
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(base64Data, 'base64')
    
        // Generate a unique filename, you can use any logic for this
        const filename = `${Date.now()}.jpg`
    
        const s3Url = await this.uploadService.upload(filename, imageBuffer)

        dto.image = s3Url
    }

    const message = new this.messageModel(dto);
    return message.save();
  }

  async getChatroomsForUser(userId: string): Promise<Chatroom[]> {
    const chatrooms = await this.chatroomModel.find({
      $or: [
        { user1: userId },
        { user2: userId },
      ],
    });
  
    const chatroomsWithLatestMessage = await Promise.all(chatrooms.map(async (chatroom) => {
      const latestMessage = await this.messageModel.findOne({
        chatroomId: chatroom._id,
      }).sort({ timestamp: -1 });
      return {
        chatroom,
        latestMessage,
      };
    }));
  
    chatroomsWithLatestMessage.sort((a: any, b: any) => {
      if (!a.latestMessage || !b.latestMessage) return 0;
      return b.latestMessage.timestamp - a.latestMessage.timestamp;
    });
  
    return chatroomsWithLatestMessage.map(({ chatroom }) => chatroom);
  }
  

  async getChatroomById(chatroomId: string): Promise<Chatroom> {
    try {
        return this.chatroomModel.findById(chatroomId);
    } catch (error) {
        console.error('Error fetching chatroom by ID:', error);
        throw new Error('Failed to fetch chatroom');
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.messageModel.findById(messageId);
    if (message && !message.readBy.includes(userId) && message.sender !== userId) {
      message.readBy.push(userId);
      await message.save();
    }
  }
  

  async markUnreadMessagesAsRead(chatroomId: string, userId: string): Promise<string[]> {
    if (userId) {
    const messages = await this.messageModel.find({
      chatroomId: chatroomId, 
      readBy: { $nin: [userId] },
      sender: { $ne: userId } 
    });
  
    const messageIds = messages.map(msg => msg._id);
    
    await this.messageModel.updateMany(
      { _id: { $in: messageIds } },
      { $push: { readBy: userId } }
    );
  
    return messageIds.map(id => id.toString());
    }
  }

  async getLastMessagesForUser(userId: string): Promise<Message[]> {
    const chatrooms = await this.getChatroomsForUser(userId);
    let lastMessages = [];
  
    for (let chatroom of chatrooms) {
      const lastMessage = await this.messageModel.findOne({
        chatroomId: chatroom._id,
      }).sort({ timestamp: -1 });
  
      if (lastMessage) {
        lastMessages.push(lastMessage);
      }
    }
  
    return lastMessages;
  }
  
  
  

}
