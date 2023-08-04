import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ListingSchema } from './schemas/listing.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule,
            MongooseModule.forFeature([{name: 'Listing', schema: ListingSchema}])],
  providers: [ListingService],
  controllers: [ListingController]
})
export class ListingModule {}
