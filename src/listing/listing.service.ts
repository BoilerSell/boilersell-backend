import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Listing } from './schemas/listing.schema';
import mongoose from 'mongoose';

import {Query} from 'express-serve-static-core'
import { User } from 'src/auth/schemas/user.schema';
import { Account } from 'src/account/schema/account.schema';
import { UploadService } from 'src/upload/upload.service';


@Injectable()
export class ListingService {
  constructor(
    @InjectModel(Listing.name) private listingModel: mongoose.Model<Listing>,
    @InjectModel(Account.name) private accountModel: mongoose.Model<Account>,
    private readonly uploadService: UploadService
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
        search['category'] = query.category
    }

    // Handle the filters condition
    if (query.filters) {
        // Ensure filters is an array, even if a single filter is provided
        const filters = Array.isArray(query.filters) ? query.filters : [query.filters]
        search['filters'] = { $all: filters }
    }
    const listings = await this.listingModel.find(search).sort({ isSold: 1, createdAt: -1 }).exec()
    return listings;
  }

  async findAllByUser(userId: string): Promise<Listing[]> {
    const account = await this.accountModel.findOne({ user: userId })
    
    if (!account) {
      throw new NotFoundException('Account not found')
    }

    const listings = await this.listingModel.find({
      '_id': { $in: account.listings }
    }).sort({ createdAt: -1 })

    if (listings.length === 0) {
      throw new NotFoundException('No listings found for this user')
    }

    return listings
  }

  async findAllFavoritesByUser(userId: string): Promise<Listing[]> {
    const account = await this.accountModel.findOne({ user: userId });
    
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const favoriteListings = await this.listingModel.find({
      '_id': { $in: account.favoriteListings }
    }).sort({ createdAt: -1 });

    if (favoriteListings.length === 0) {
      throw new NotFoundException('No favorite listings found for this user');
    }

    return favoriteListings;
  }

  async create(listing: Listing, user: User): Promise<Listing> {
    if (listing.images) {
      const images = listing.images || []
      const s3Images: string[] = []

      // Upload each image to S3 and get the URL.
      for (const base64Image of images) {
        // Extract base64 data without MIME
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "")
        
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(base64Data, 'base64')

        // Generate a unique filename, you can use any logic for this
        const filename = `${Date.now()}.jpg`

        const s3Url = await this.uploadService.upload(filename, imageBuffer)
        s3Images.push(s3Url)
      }

      // Replace local images with S3 URLs.
      listing.images = s3Images;
  }

    const data = Object.assign(listing, { user: user._id.toString() })
    const res = await this.listingModel.create(data)

    await this.accountModel.updateOne(
      { user: user._id },
      { $push: { listings: res._id.toString() } }
    )
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
    const existingListing = await this.listingModel.findById(id);
    if (!existingListing) {
      throw new NotFoundException('Listing not found');
    }
  
    const images = listing.images || [];
    const s3Images: string[] = [];
  
    // Upload each image to S3 and get the URL.
    for (const base64Image of images) {

      if (base64Image.startsWith('http://') || base64Image.startsWith('https://')) {
      s3Images.push(base64Image)
      continue
      }

      // Extract base64 data without MIME
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
      
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(base64Data, 'base64');
  
      // Generate a unique filename, you can use any logic for this
      const filename = `${Date.now()}.jpg`;
  
      const s3Url = await this.uploadService.upload(filename, imageBuffer);
      s3Images.push(s3Url);
    }
  
    // Replace local images with S3 URLs.
    listing.images = s3Images;
  
    return await this.listingModel.findByIdAndUpdate(id, listing, {
      new: true,
      runValidators: true,
    });
  }
  

  async deleteByID(id:string): Promise<Listing> {
    const deletedListing = await this.listingModel.findByIdAndDelete(id);
    
    if (!deletedListing) {
      throw new NotFoundException('Listing not found');
    }
  
    await this.accountModel.updateOne(
      { listings: id },
      { $pull: { listings: id } }
    );
  
    return deletedListing;
  }


}
