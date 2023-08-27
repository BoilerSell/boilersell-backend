import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSchema } from './schema/account.schema';
import { UserSchema } from 'src/auth/schemas/user.schema';
import { ListingSchema } from 'src/listing/schemas/listing.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UploadService } from 'src/upload/upload.service';

@Module({
  imports: [ AuthModule,
  MongooseModule.forFeature([{ name: 'Account', schema: AccountSchema }]),  
  MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  MongooseModule.forFeature([{ name: 'Listing', schema: ListingSchema }]),
],
  providers: [AccountService, UploadService],
  controllers: [AccountController]
})
export class AccountModule {}
