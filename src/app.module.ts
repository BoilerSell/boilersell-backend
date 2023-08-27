import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ListingModule } from './listing/listing.module';
import { MessagesModule } from './messages/messages.module';
import { AccountModule } from './account/account.module';
import { UploadModule } from './upload/upload.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    AuthModule,
    ListingModule,
    AccountModule, 
    MessagesModule, UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
