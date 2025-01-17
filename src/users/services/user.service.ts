import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createUserSchema } from '../dto/create-user.dto';
import { Twilio } from 'twilio';
import * as moment from 'moment';
import { User } from '../schemas/user.schema';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class UserService {
    private readonly twilioClient: Twilio;

    constructor(@InjectModel('User') private userModel: Model<User>) {
        // Initialize Twilio client with credentials
        this.twilioClient = new Twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    async onboardUser(createUserDto) {
        if (!createUserDto.first_name || !createUserDto.last_name || !createUserDto.email || !createUserDto.phone_no || !createUserDto.date_of_birth) {
            console.log("name", createUserDto.last_name)

            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `All field are required `,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        // Validate input using Joi schema
        const { error } = createUserSchema.validate(createUserDto);
        if (error) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: error.details[0].message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        // Ensure all required fields are present in the payload
        console.log("ded", createUserDto.first_name)


        // Validate and format phone number
        const phoneNumber = parsePhoneNumberFromString(createUserDto.phone_no, 'IN'); // Use 'IN' for India, or update based on region
        if (!phoneNumber || !phoneNumber.isValid()) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Invalid phone number format. Please ensure the number follows the correct format.',
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        const formattedPhoneNo = phoneNumber.number; // Convert to E.164 format

        // Generate OTP and set expiration
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = moment().add(3, 'minutes').toDate();

        // Save user and OTP in the database
        const newUser = new this.userModel({
            ...createUserDto,
            phone_no: formattedPhoneNo,
            otp,
            otp_expiry: otpExpiry,
            isVerified: false,
        });
        try {
            await newUser.save();
        } catch (err) {
            // Handle duplicate key error (E11000)
            if (err.code === 11000) {
                const duplicateKeyField = Object.keys(err.keyValue)[0]; // Get the field name that is duplicated
                throw new HttpException(
                    {
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: `The ${duplicateKeyField} is already in use. Please use a different one.`,
                        details: err.message,
                    },
                    HttpStatus.BAD_REQUEST,
                );
            }
            // Handle other database errors
            throw new HttpException(
                {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Error saving user information to the database.',
                    details: err.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        // Send OTP via Twilio
        try {
            const fromPhone = process.env.TWILIO_PHONE_NUMBER; // Twilio phone number
            const messagingServiceSid = process.env.MESSAGE_SERVICE_ID;

            if (!messagingServiceSid) {
                throw new HttpException(
                    {
                        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                        message: 'Twilio Messaging Service SID is not configured.',
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            // Send OTP message
            await this.twilioClient.messages.create({
                body: `Your OTP is: ${otp}`,
                messagingServiceSid, // Use Messaging Service SID if available
                to: formattedPhoneNo,
            });
        } catch (err) {
            throw new HttpException(
                {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Failed to send OTP via Twilio.',
                    details: err.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        return { message: 'User created and OTP sent successfully.' };
    }
}
