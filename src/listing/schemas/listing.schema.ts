import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


export enum Category {
  MARKETPLACE = 'marketplace',
  TICKETS = 'tickets',
  CARS = 'cars',
  HOUSING = 'housing',
  BUY_REQUEST = 'buy-request'
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

  @Prop({ default: false })
  isSold: boolean;
  
}

export const ListingSchema = SchemaFactory.createForClass(Listing)