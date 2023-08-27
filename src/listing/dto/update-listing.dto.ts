import { IsArray, IsBoolean, IsEmpty, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'
import { Category } from '../schemas/listing.schema'

export class UpdateListingDto {

  @IsOptional()
  @IsString()
  readonly title: string

  @IsOptional()
  @IsString()
  readonly description: string

  @IsOptional()
  @IsNumber()
  readonly price: number

  @IsOptional()
  @IsEnum(Category, {message: 'Please enter the correct category'})
  readonly category: Category

  @IsOptional()
  @IsString({ each: true })
  readonly filters: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly images: string[];

  @IsEmpty({message: "You cannot pass user id"})
  readonly user: string

  @IsOptional()
  @IsBoolean()
  readonly isSold: boolean;
}