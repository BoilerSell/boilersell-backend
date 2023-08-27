// Create TempUser schema (temp-user.schema.ts)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class TempUser extends Document {
  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  username: string;

  @Prop()
  verificationToken: string;
}

export const TempUserSchema = SchemaFactory.createForClass(TempUser);
