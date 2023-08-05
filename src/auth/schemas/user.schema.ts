import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose'
import { Document, Types } from 'mongoose';


@Schema({
  timestamps: true
})

export class User extends Document{

  @Prop({ unique: [true, 'Duplicate email entered']})
  email: string

  @Prop()
  password: string
  
}

export const UserSchema = SchemaFactory.createForClass(User)