import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ListingService } from './listing.service';
import { Listing } from './schemas/listing.schema';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

import {Query as ExpressQuery} from 'express-serve-static-core'
import { AuthGuard } from '@nestjs/passport';

@Controller('listing')
export class ListingController {
  constructor(private listingService: ListingService) {}

  @Get()
  async getAllListings(@Query() query: ExpressQuery): Promise<Listing[]> {
    return this.listingService.findAll(query)
  }


  @Post('new')
  @UseGuards(AuthGuard())
  async createListing(@Body() listing:CreateListingDto, @Req() req ): Promise<Listing> {
    return this.listingService.create(listing, req.user)
  }

  @Get(':id')
  async getListing(@Param('id') id: string): Promise<Listing> {
    return this.listingService.findById(id)
  }

  @Put(':id')
  async updateListing(@Param('id') id: string, @Body() listing: UpdateListingDto): Promise<Listing> {
    return this.listingService.updateById(id, listing)
  }

  @Delete(':id')
  async deleteListing(@Param('id') id: string): Promise<Listing> {
    return this.listingService.deleteByID(id)
  }
}
