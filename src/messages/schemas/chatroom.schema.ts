import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Chatroom extends Document {

  @Prop()
  user1: string

  @Prop()
  user2: string
}

export const ChatroomSchema = SchemaFactory.createForClass(Chatroom);
