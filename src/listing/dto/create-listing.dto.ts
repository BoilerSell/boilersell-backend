import { IsArray, IsEmpty, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { Category } from '../schemas/listing.schema'
import { User } from 'src/auth/schemas/user.schema'

export class CreateListingDto {

  @IsNotEmpty()
  @IsString()
  readonly title: string

  @IsString()
  readonly description: string

  @IsNotEmpty()
  @IsNumber()
  readonly price: number

  @IsNotEmpty()
  @IsEnum(Category, {message: 'Please enter the correct category'})
  readonly category: Category

  @IsNotEmpty()
  @IsString({ each: true })
  readonly filters: string[]
  
  @IsArray()
  @IsString({ each: true })
  readonly images: string[];

  @IsEmpty({message: "You cannot pass user id"})
  readonly user:string
}