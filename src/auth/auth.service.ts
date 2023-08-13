import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Account } from '../account/schema/account.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Account.name)
    private accountModel: Model<Account>,
    private jwtService: JwtService
    ) {}

    async signUp(signUpDto: SignUpDto): Promise<{ token: string}> {
      const {username, email, password} = signUpDto

      const hashedPassword = await bcrypt.hash(password, 10)

      try {
        const user = await this.userModel.create({
          email,
          password: hashedPassword
        })
    
        await this.accountModel.create({
          user: user._id.toString(),
          username: username,
          profilePicture: '',
          bio:'',
          favoriteListings:[],
          friendsList: []
        });
    
        const token = this.jwtService.sign({id: user._id})
        return {token}
      } catch (error) {
        if (error.code === 11000) {
          throw new ConflictException('Username already exists');
        }
        throw error;
      }
    }

    async login(loginDto: LoginDto): Promise<{ token:string }> {
      const {email, password} = loginDto
      const user = await this.userModel.findOne({ email })

      if (!user) {
        throw new UnauthorizedException('Invalid Email or Password')
      }
      const isPasswordMatched = await bcrypt.compare(password, user.password)

      if (!isPasswordMatched) {
        throw new UnauthorizedException('Invalid Email or Password')
      }
      const token = this.jwtService.sign({id: user._id})
      return {token}

    }

    async getUserById(userId: string): Promise<User | null> {
      return await this.userModel.findById(userId).exec();
    }

}
