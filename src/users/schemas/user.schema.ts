// src/users/schemas/user.schema.ts

import { Schema, Document } from 'mongoose';

export interface User extends Document {
    first_name: string;
    last_name: string;
    email: string;
    phone_no: string;
    date_of_birth: Date;
    otp: string;
    otp_expiry: Date;
    is_verified: boolean;
}

export const UserSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    phone_no: { type: String, required: true, unique: true },
    date_of_birth: { type: Date, required: true },
    otp: { type: String },
    otp_expiry: { type: Date },
    is_verified: { type: Boolean, default: false },
});
