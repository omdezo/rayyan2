import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withDB, handleError } from '@/lib/api-utils';
import User from '@/lib/models/User';

// POST /api/auth/register - Register new user
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        // Validation
        if (!name || !email || !password) {
            return errorResponse('Missing required fields: name, email, password', 400);
        }

        if (password.length < 6) {
            return errorResponse('Password must be at least 6 characters', 400);
        }

        // Email format validation
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return errorResponse('Invalid email format', 400);
        }

        return await withDB(async () => {
            // Check if user already exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return errorResponse('User with this email already exists', 409);
            }

            // Create new user (password will be hashed by the pre-save hook)
            const user = await User.create({
                name,
                email: email.toLowerCase(),
                password,
                role: 'user',
                status: 'active',
            });

            // Return success without password
            return successResponse(
                {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
                'Account created successfully. Please login.',
                201
            );
        });
    } catch (error) {
        return handleError(error);
    }
}
