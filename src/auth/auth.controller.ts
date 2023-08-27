import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor( private authService: AuthService){}


  @Post('/signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<{token: string}> {
    return this.authService.signUp(signUpDto)
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto): Promise<{token: string}> {
    return this.authService.login(loginDto)
  }

  @Post('/verify-email')
  verifyEmail(@Body('token') token: string): Promise<string> {
    return this.authService.verifyEmail(token);
  }

  @Post('/forgot-password')
  async forgotPassword(@Body('email') email: string): Promise<string> {
    return this.authService.forgotPassword(email);
  }

  @Post('/reset-password')
  async resetPassword(
    @Body('token') token: string, 
    @Body('newPassword') newPassword: string
  ): Promise<string> {
    return this.authService.resetPassword(token, newPassword);
  }
}
