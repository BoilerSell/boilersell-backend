import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ListingSchema } from './schemas/listing.schema';
import { AuthModule } from 'src/auth/auth.module';
import { AccountSchema } from 'src/account/schema/account.schema';
import { UploadService } from 'src/upload/upload.service';

@Module({
  imports: [AuthModule,
            MongooseModule.forFeature([{name: 'Listing', schema: ListingSchema}]),
            MongooseModule.forFeature([{name: 'Account', schema: AccountSchema}])
          ],
  providers: [ListingService, UploadService],
  controllers: [ListingController]
})
export class ListingModule {}
