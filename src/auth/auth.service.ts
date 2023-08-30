import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Account } from '../account/schema/account.schema';
import * as nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import { toHtml } from './EmailVerification';
import { TempUser } from './schemas/tempUser.schema';


@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(TempUser.name)
    private tempUserModel: Model<TempUser>,
    @InjectModel(Account.name)
    private accountModel: Model<Account>,
    private jwtService: JwtService
    ) {}

    async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
      const {username, email, password} = signUpDto
      const hashedPassword = await bcrypt.hash(password, 10)
      const verificationToken = randomBytes(32).toString('hex')
    
      // Check if username or email already exists
      const existingUser = await this.userModel.findOne({ email })
      const existingAccount = await this.accountModel.findOne({ username })
      
      if (existingUser) {
        throw new ConflictException('Email already exists')
      }
      if (existingAccount) {
        throw new ConflictException('Username already exists')
      }
    
      // If no existing user or account, proceed to create new records
      try {
        await this.tempUserModel.create({
          username,
          email,
          password: hashedPassword,
          verificationToken,
        });
        await this.sendVerificationEmail(email, verificationToken)        
    
        return { token: "Verification email sent, please check your inbox." };

      } catch (error) {
        if (error.code === 11000) {
          throw new ConflictException('Username already exists');
        }
        throw error;
      }
    }

    async login(loginDto: LoginDto): Promise<{ token:string }> {
      const {email, password} = loginDto;
      const user = await this.userModel.findOne({ email });
    
      if (!user) {
        throw new UnauthorizedException('Invalid Email or Password');
      }
  
    
      const isPasswordMatched = await bcrypt.compare(password, user.password);
    
      if (!isPasswordMatched) {
        throw new UnauthorizedException('Invalid Email or Password');
      }
    
      const token = this.jwtService.sign({id: user._id});
      return {token};
    }
    

    async sendVerificationEmail(email: string, token: string) {
      let transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        }
      })
  
      let info = await transporter.sendMail({
        from: '"BoilerSell" <boilersell.purdue@gmail.com>',
        to: email,
        subject: 'Please verify your email',
        html: toHtml(process.env.CLIENT_URL + `/verify-email?token=${token}`, 'Verify Email', 
        'Verify your email in order to get access to BoilerSell. We do this to keep the marketplace Purdue exclusive', 'Verify', 'Thank you for using BoilerSell') ,
      })
      }

    async getUserById(userId: string): Promise<User | null> {
      return await this.userModel.findById(userId).exec();
    }

    async verifyEmail(token: string): Promise<string> {
      let tempUser, user, account;
    
      // Check for a missing token
      if (!token) {
        throw new UnauthorizedException('Token is missing');
      }      

       try {
        tempUser = await this.tempUserModel.findOne({ verificationToken: token });
        console.log("TempUser found:", tempUser);
      } catch (error) {
        throw new UnauthorizedException('Error in retrieving temp user');
      }
    
      const { email, password, username } = tempUser;
    
      // Move user from TempUser to User collection
      try {
        user = await this.userModel.create({ email, password });
      } catch (error) {
        if (error.code === 11000) {
          throw new ConflictException('Email already exists');
        }
        throw new UnauthorizedException('Error in creating user');
      }
    
      // Check if the user was created successfully
      if (!user) {
        throw new UnauthorizedException('User could not be created');
      }
    
      // Move user to Account collection
      try {
        account = await this.accountModel.create({
          user: user._id.toString(),
          username,
          profilePicture: '',
          bio: '',
          favoriteListings: [],
          friendsList: [],
        });
      } catch (error) {
        if (error.code === 11000) {
          throw new ConflictException('Username already exists');
        }
        // If the account wasn't created, attempt to remove the user as well
        await this.userModel.deleteOne({ _id: user._id });
        throw new UnauthorizedException('Error in creating account');
      }
    
      // Check if the account was created successfully
      if (!account) {
        // If the account wasn't created, attempt to remove the user as well
        await this.userModel.deleteOne({ _id: user._id });
        throw new UnauthorizedException('Account could not be created');
      }
    
      // Delete TempUser record
      try {
        await this.tempUserModel.deleteOne({ verificationToken: token });
      } catch (error) {
        throw new UnauthorizedException('Error in deleting temp user');
      }
    
      return 'Email verified successfully, your account is now active';
    }
    
  

    async forgotPassword(email: string): Promise<string> {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new UnauthorizedException('No account with that email address exists.');
      }
    
      const resetPasswordToken = randomBytes(20).toString('hex');
      const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    
      user.resetPasswordToken = resetPasswordToken;
      user.resetPasswordExpires = resetPasswordExpires;
      await user.save();
    
      await this.sendResetPasswordEmail(email, resetPasswordToken);
      
      return 'Reset password email sent';
    }

    async sendResetPasswordEmail(email: string, token: string) {
      let transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        }
      })
  
      let info = await transporter.sendMail({
        from: '"BoilerSell" <boilersell.purdue@gmail.com>',
        to: email,
        subject: 'Email Verification for BoilerSell',
        html: toHtml(process.env.CLIENT_URL + `/reset-password?token=${token}`, 'Reset Password', 
        'Reset your password to something that you can remember well.', 'Reset', 'Thank you for using BoilerSell'),
      })
    }

    async resetPassword(token: string, newPassword: string): Promise<string> {
      const user = await this.userModel.findOne({ 
        resetPasswordToken: token, 
        resetPasswordExpires: { $gt: new Date() }
      });
    
      if (!user) {
        throw new UnauthorizedException('Password reset token is invalid or has expired.');
      }
    
      user.password = await bcrypt.hash(newPassword, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      return 'Password has been reset';
    }

    

}
