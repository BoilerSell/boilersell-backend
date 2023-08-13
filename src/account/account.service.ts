import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Account } from './schema/account.schema';
import mongoose, { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateAccountDto } from './dto/update-account.dto';
import { User } from 'src/auth/schemas/user.schema';
import { Listing } from 'src/listing/schemas/listing.schema';

@Injectable()
export class AccountService {
  
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
    @InjectModel(Listing.name) private readonly listingModel: Model<Listing>,
    

    ) {}
    
    async findByUser(id: string): Promise<Account> {
      const isValidId = mongoose.isValidObjectId(id)

      if(!isValidId) {
        throw new BadRequestException('Please enter correct account id')
      }
      const account = await this.accountModel.findOne({ user: id });
  
      if(!account) {
        throw new NotFoundException('Account not found')
      }
      return account
    }

    async updateByUser(id: string, account: UpdateAccountDto): Promise<Account> {
      const isValidId = mongoose.isValidObjectId(id)
    
      if(!isValidId) {
        throw new BadRequestException('Please enter correct account id')
      }
    
      const existingAccount = await this.accountModel.findOne({ user: id });
    
      if(!existingAccount) {
        throw new NotFoundException('Account not found')
      }
    
      Object.assign(existingAccount, account);
    
      return await existingAccount.save();
    }

    async deleteByUser(id: string): Promise<Account> {
      const isValidId = mongoose.isValidObjectId(id)
    
      if(!isValidId) {
        throw new BadRequestException('Please enter correct account id')
      }
    
      const existingAccount = await this.accountModel.findOne({ user: id });
    
      if(!existingAccount) {
        throw new NotFoundException('Account not found')
      }

      await this.listingModel.deleteMany({ user: id }).exec();

      await this.userModel.findByIdAndRemove(id).exec();
      return await this.accountModel.findByIdAndDelete(existingAccount._id);
    }



    async toggleFavoriteListing(userId: string, listingId: string): Promise<Account> {
      const isValidUserId = mongoose.isValidObjectId(userId);
      const isValidListingId = mongoose.isValidObjectId(listingId);
    
      if (!isValidUserId || !isValidListingId) {
        throw new BadRequestException('Please enter correct ids');
      }
    
      const account = await this.accountModel.findOne({ user: userId });
      if (!account) {
        throw new NotFoundException('Account not found');
      }
    
      const listingIndex = account.favoriteListings.indexOf(listingId);
    
      if (listingIndex > -1) {
        // Listing is already in favorites, so remove it
        account.favoriteListings.splice(listingIndex, 1);
      } else {
        // Listing isn't in favorites, so add it
        account.favoriteListings.push(listingId);
      }
    
      return await account.save();
    }

   
    
    
    


}
