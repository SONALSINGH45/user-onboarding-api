// src/users/controllers/user.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('onboard')
    @ApiOperation({ summary: 'Onboard a new user' })
    @ApiResponse({
        status: 201,
        description: 'User onboarded successfully and OTP sent',
    })
    @ApiResponse({ status: 400, description: 'Invalid input or OTP send failure' })
    @ApiBody({
        description: 'User onboarding details',
        type: Object,
        examples: {
            'application/json': {
                value: {
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    phone_no: '9876543210',
                    date_of_birth: '1990-01-01T00:00:00.000Z',
                },
            },
        },
    })
    async onboardUser(@Body() createUserDto) {
        return this.userService.onboardUser(createUserDto);
    }
}
