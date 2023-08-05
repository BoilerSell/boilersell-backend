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

    const search = query.search ? {
      $or: [
        {
        title : {
        $regex: query.search,
        $options: 'i'
        } 
      },
      {
        description : {
        $regex: `\\b${query.search}\\b`
        }
      }
     ]
    } : {}
    const listings = await this.listingModel.find(search)
    return listings
  }

  async create(listing: Listing, user: User): Promise<Listing> {

    const data = Object.assign(listing, {user:user._id})

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
