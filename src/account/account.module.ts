import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSchema } from './schema/account.schema';

@Module({
  imports: [ MongooseModule.forFeature([{ name: 'Account', schema: AccountSchema }]),  MongooseModule.forFeature([{ name: 'User', schema: AccountSchema }])],
  providers: [AccountService],
  controllers: [AccountController]
})
export class AccountModule {}
