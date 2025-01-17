import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { User } from '../schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(@InjectModel('User') private userModel: Model<User>) { }

    async login(phone_no: string, otp?: string) {
        // Check if phone number is provided
        if (!phone_no) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Phone number is required.',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        // Find the user by phone number
        const user: any = await this.userModel.findOne({ phone_no });

        if (!user) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'User not found for the provided phone number.',
                },
                HttpStatus.NOT_FOUND,
            );
        }

        // Skip OTP check if the user is already verified
        if (user.is_verified) {
            const token = this.generateJwtToken(user._id);
            return {
                message: 'User is already verified'
            };
        }

        // Ensure OTP is provided for unverified users
        if (!otp) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'OTP is required for unverified users.',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        // Check if OTP is present in the database
        if (!user.otp) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'OTP not found. Please request a new OTP.',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        // Check if OTP matches
        if (user.otp !== otp) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Invalid OTP provided.',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        // Check if OTP has expired
        if (new Date() > user.otp_expiry) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'OTP has expired. Please request a new OTP.',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        // Mark user as verified and delete OTP details
        user.is_verified = true;
        user.otp = undefined;
        user.otp_expiry = undefined;
        await user.save();

        // Generate JWT token
        const token = this.generateJwtToken(user._id);

        return {
            message: 'User logged in successfully after OTP verification.',
            token,
        };
    }

    private generateJwtToken(userId: string): string {
        return jwt.sign({ userId }, process.env.SECRET_KEY, {
            expiresIn: '1h',
        });
    }
}
