// src/users/controllers/otp.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from '../services/otp.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('otp')
@Controller('otp')
export class OtpController {
    constructor(private readonly otpService: OtpService) { }

    @Post('verify')
    @ApiOperation({ summary: 'Verify OTP for a user' })
    @ApiResponse({
        status: 200,
        description: 'OTP verified successfully.',
    })
    @ApiResponse({ status: 400, description: 'Invalid OTP or expired OTP' })
    @ApiBody({
        description: 'OTP verification details',
        type: Object,
        examples: {
            'application/json': {
                value: {
                    phone_no: '+919876543210',
                    otp: '123456',
                },
            },
        },
    })
    async verifyOtp(@Body() body) {
        const { phone_no, otp } = body;
        return this.otpService.verifyOtp(phone_no, otp);
    }
}
