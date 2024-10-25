import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginUserDto, RegisterUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { envs } from 'src/config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthMicroservice');

  constructor(
    private readonly jwtService: JwtService
  ){
    super();
  }

  onModuleInit() {
    this.$connect;
    this.logger.log('MongoDB connected');
  }

  async signJwt(payload:JwtPayload){
    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string) {
    try {
      const {sub, iat, exp, ...user} = this.jwtService.verify(token, {
        secret: envs.jwt.secret
      });

      return {
        user: user,
        token: await this.signJwt(user),
      }
    } catch (error) {
      console.log(error);
      throw new RpcException({
        status: 401,
        message: 'Invalid token'
      })
    }
  }

  async registerUser(registerDto: RegisterUserDto) {
    const { email, name, password } = registerDto;
    try {
      const user = await this.user.findUnique({
        where: {
          email: email,
        },
      });

      if (user) {
        throw new RpcException({
          status: 400,
          message: 'User already exists',
        });
      }

      const newUser = await this.user.create({
        data: {
          email: email,
          password: bcrypt.hashSync(password, 10),
          name: name,
        },
      });

      const {password:__, ...rest} = newUser;
      return {
        user: rest,
        token: await this.signJwt(rest),
      };
    } catch (error) {
      console.log(error);
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async loginUser(loginDto: LoginUserDto) {
    const {email, password} = loginDto;

    try {
      const user = await this.user.findUnique({
        where: {email}
      });

      if(!user) {
        throw new RpcException({
          status:400,
          message: 'User/password not valid',
        });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);

      const { password: __, ...rest } = user;

      return {
        user: rest,
        token: await this.signJwt(rest),
      }
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }
}
