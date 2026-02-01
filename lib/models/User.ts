import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '@/lib/types/models';

const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: false, // Optional for OAuth users (Google, etc.)
        minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'admin'],
            message: '{VALUE} is not a valid role',
        },
        default: 'user',
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'inactive', 'banned'],
            message: '{VALUE} is not a valid status',
        },
        default: 'active',
    },
    joinDate: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving (only if password is provided)
UserSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return; // Skip hashing if password not modified or empty (OAuth users)
    }
    // Make sure you import bcrypt if you haven't
    const bcrypt = require('bcryptjs'); // or import bcrypt from 'bcryptjs' at the top

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};


const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
