import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';
import { env } from 'process';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    JwtModule.register({
      global:true,
      secret: envs.jwt.secret,
      signOptions: {
        expiresIn: envs.jwt.expires,
        issuer: envs.jwt.issuer
      }
    })
  ]
})
export class AuthModule {}
