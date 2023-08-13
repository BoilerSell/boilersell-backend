import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({
  timestamps: true
})
export class Account extends Document {
  @Prop()
  user: string

  @Prop({ unique: true })
  username: string;

  @Prop()
  profileImage: string;

  @Prop()
  bio: string;

  @Prop()
  listings: string[]

  @Prop()
  favoriteListings: string[]

  @Prop()
  friendsList: string[]

}

export const AccountSchema = SchemaFactory.createForClass(Account);
