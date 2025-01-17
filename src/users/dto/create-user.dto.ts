// src/users/dto/create-user.dto.ts

import * as Joi from 'joi';

export const createUserSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone_no: Joi.string().pattern(/^\d{10}$/).required(),
    date_of_birth: Joi.date().required(),
});
