import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class OtpService {
    constructor(@InjectModel('User') private userModel: Model<User>) { }

    async verifyOtp(phone_no: string, otp: string) {
        if (!phone_no || !otp) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'phone_no,otp All field are required',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        // Check if the user exists
        const user = await this.userModel.findOne({ phone_no });

        if (!user) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'User not found for the provided phone number.',
                },
                HttpStatus.NOT_FOUND,
            );
        }

        // Check if the OTP matches
        if (user.otp !== otp) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Invalid OTP provided.',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        // Check if the OTP has expired
        if (new Date() > user.otp_expiry) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'OTP has expired. Please request a new OTP.',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        // Update user verification status
        user.is_verified = true;
        user.otp = undefined; // Clear OTP after verification
        user.otp_expiry = undefined; // Clear OTP expiry time
        await user.save();

        return { message: 'OTP verified successfully.' };
    }
}
