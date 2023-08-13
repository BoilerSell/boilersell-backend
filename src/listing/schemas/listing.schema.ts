import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';


export enum Category {
  MARKETPLACE = 'Marketplace',
  TICKETS = 'Tickets',
  CAR = 'Car',
  HOUSING = 'HOUSING',
  BUY_REQUEST = 'Buy Request'
}


@Schema({
  timestamps: true
})
export class Listing {

  @Prop()
  title: string

  @Prop()
  price: number

  @Prop()
  description: string

  @Prop()
  category: Category

  @Prop()
  filters: string[]

  @Prop([String])
  images: string[]

  @Prop()
  user: string
  
}

export const ListingSchema = SchemaFactory.createForClass(Listing)