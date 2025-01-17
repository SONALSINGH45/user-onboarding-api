// src/users/controllers/auth.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Login user using OTP' })
    @ApiResponse({
        status: 200,
        description: 'JWT token generated and user logged in.',
    })
    @ApiResponse({ status: 400, description: 'Invalid OTP or expired OTP' })
    @ApiBody({
        description: 'Login details for OTP authentication',
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
    async login(@Body() body) {
        const { phone_no, otp } = body;
        return this.authService.login(phone_no, otp);
    }
}
