// src/users/users.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './controllers/user.controller';
import { OtpController } from './controllers/otp.controller';
import { AuthController } from './controllers/auth.controller';
import { UserService } from './services/user.service';
import { OtpService } from './services/otp.service';
import { UserSchema } from './schemas/user.schema';
import { AuthService } from './services/auth.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
    controllers: [UserController, OtpController, AuthController],
    providers: [UserService, OtpService, AuthService],
})
export class UsersModule { }
