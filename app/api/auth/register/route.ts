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

        // Strong password validation
        if (password.length < 8) {
            return errorResponse('Password must be at least 8 characters', 400);
        }

        // Check for uppercase letter
        if (!/[A-Z]/.test(password)) {
            return errorResponse('Password must contain at least one uppercase letter', 400);
        }

        // Check for lowercase letter
        if (!/[a-z]/.test(password)) {
            return errorResponse('Password must contain at least one lowercase letter', 400);
        }

        // Check for number
        if (!/[0-9]/.test(password)) {
            return errorResponse('Password must contain at least one number', 400);
        }

        // Check for special character
        if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/.test(password)) {
            return errorResponse('Password must contain at least one special character (!@#$%^&*...)', 400);
        }

        // Block common weak passwords
        const weakPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123', 'admin123'];
        if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
            return errorResponse('Password is too common. Please choose a stronger password', 400);
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
            // SECURITY: Role is ALWAYS 'user' for registrations - only seeded admin exists
            const user = await User.create({
                name,
                email: email.toLowerCase(),
                password,
                role: 'user', // Hardcoded - cannot be changed via registration
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
