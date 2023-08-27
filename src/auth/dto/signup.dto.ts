import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @IsNotEmpty()
  @Matches(/@purdue\.edu$/, { message: 'Please use a valid Purdue email' })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  readonly password: string;
}