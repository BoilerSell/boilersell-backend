import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { Account, AccountSchema } from '../account/schema/account.schema';
import { TempUserSchema } from './schemas/tempUser.schema';

@Module({
  imports: [PassportModule.register({defaultStrategy: 'jwt'}),
  JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
      return {
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string | number>('JWT_EXPIRES'),
        },

      }
    }
  }),
  MongooseModule.forFeature([{name: 'User', schema: UserSchema}, { name: 'Account', schema: AccountSchema }, { name: 'TempUser', schema: TempUserSchema },
],)],
  
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule]
})
export class AuthModule {}
