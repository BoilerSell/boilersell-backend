import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';


export enum Category {
  MARKETPLACE = 'Marketplace',
  TICKETS = 'Tickets',
  RIDES = 'Rides',
  SUBLEASE = 'Sublease'
}


@Schema({
  timestamps: true
})
export class Listing {

  @Prop()
  title: string;

  @Prop()
  price: number;

  @Prop()
  description: string;

  @Prop()
  category: Category;

  @Prop([String])
  images: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User'})
  user: User;
  
}

export const ListingSchema = SchemaFactory.createForClass(Listing)