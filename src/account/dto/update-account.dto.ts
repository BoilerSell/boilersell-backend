import { IsString, IsOptional, IsEmpty } from 'class-validator';
import { User } from 'src/auth/schemas/user.schema';
import { Listing } from 'src/listing/schemas/listing.schema';
import { Account } from '../schema/account.schema';

export class UpdateAccountDto {
  
  @IsOptional()
  @IsString()
  readonly username: string

  @IsOptional()
  @IsString()
  readonly bio: string

  @IsOptional()
  @IsString()
  profilePicture: string

  @IsEmpty({message: 'No editing userId manually'})
  user: User

  @IsEmpty({message: 'No editing favoriteList manually'})
  favoriteListings: Listing[]

  @IsEmpty({message: 'No editing friendsList manually'})
  friendsList: Account[]
}