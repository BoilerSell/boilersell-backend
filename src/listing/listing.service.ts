import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Listing } from './schemas/listing.schema';
import mongoose from 'mongoose';

import {Query} from 'express-serve-static-core'
import { User } from 'src/auth/schemas/user.schema';


@Injectable()
export class ListingService {
  constructor(
    @InjectModel(Listing.name)
    private listingModel: mongoose.Model<Listing>
  ) {}

  async findAll(query: Query): Promise<Listing[]> {
    const search = {};

    // Handle the search condition
    if (query.search) {
        search['$or'] = [
            {
                title: {
                    $regex: query.search,
                    $options: 'i'
                }
            },
            {
                description: {
                    $regex: `\\b${query.search}\\b`
                }
            }
        ];
    }

    // Handle the category condition
    if (query.category) {
        search['category'] = query.category;
    }

    // Handle the filters condition
    if (query.filters) {
        // Ensure filters is an array, even if a single filter is provided
        const filters = Array.isArray(query.filters) ? query.filters : [query.filters];
        search['filters'] = { $all: filters };
    }

    const listings = await this.listingModel.find(search).sort({ createdAt: -1 }).exec();
    return listings;
}


  async create(listing: Listing, user: User): Promise<Listing> {

    const data = Object.assign(listing, {user:user._id.toString()})

    const res = await this.listingModel.create(data)
    return res
  }

  async findById(id: string): Promise<Listing> {

    const isValidId = mongoose.isValidObjectId(id)

    if(!isValidId) {
      throw new BadRequestException('Please enter correct id')
    }

    const listing = await this.listingModel.findById(id)


    if(!listing) {
      throw new NotFoundException('Listing not found')
    }
    return listing
  }

  async updateById(id: string, listing: Listing): Promise<Listing> {
    return await this.listingModel.findByIdAndUpdate(id, listing, {
      new:true,
      runValidators: true
    }) 
  }

  async deleteByID(id:string): Promise<Listing> {
    return await this.listingModel.findByIdAndDelete(id)
  }


}
