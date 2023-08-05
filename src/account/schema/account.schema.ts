import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { Listing } from 'src/listing/schemas/listing.schema';

@Schema({
  timestamps: true
})
export class Account extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | User

  @Prop({ unique: true })
  username: string;

  @Prop()
  profileImage: string;

  @Prop()
  bio: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Listing' }] })
  listings: (Types.ObjectId | Listing)[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Listing' }] })
  favoriteListings: (Types.ObjectId | Listing)[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Account' }] })
  friendsList: (Types.ObjectId | Account)[];

}

export const AccountSchema = SchemaFactory.createForClass(Account);
