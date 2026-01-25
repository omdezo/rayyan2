import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAdmin, withDB, handleError } from '@/lib/api-utils';
import User from '@/lib/models/User';

// GET /api/users - Fetch all users (admin only)
export async function GET(req: NextRequest) {
    try {
        const { error: authError } = await requireAdmin(req);
        if (authError) return authError;

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const role = searchParams.get('role');
        const search = searchParams.get('search');

        return await withDB(async () => {
            // Build filter query
            const filter: any = {};
            if (status) filter.status = status;
            if (role) filter.role = role;
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ];
            }

            // Fetch users excluding password
            const users = await User.find(filter)
                .select('-password')
                .sort({ joinDate: -1 })
                .lean();

            return successResponse(users);
        });
    } catch (error) {
        return handleError(error);
    }
}

// POST /api/users - Create admin user (admin only)
export async function POST(req: NextRequest) {
    try {
        const { error: authError } = await requireAdmin(req);
        if (authError) return authError;

        const body = await req.json();
        const { name, email, password } = body;

        // Validation
        if (!name || !email || !password) {
            return errorResponse('Missing required fields: name, email, password', 400);
        }

        if (password.length < 6) {
            return errorResponse('Password must be at least 6 characters', 400);
        }

        return await withDB(async () => {
            // Check if user already exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return errorResponse('User with this email already exists', 409);
            }

            // Create admin user
            const user = await User.create({
                name,
                email: email.toLowerCase(),
                password,
                role: 'admin',
                status: 'active',
            });

            // Return without password
            const userResponse = await User.findById(user._id).select('-password').lean();
            return successResponse(userResponse, 'Admin user created successfully', 201);
        });
    } catch (error) {
        return handleError(error);
    }
}
