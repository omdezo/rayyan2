import { NextRequest } from 'next/server';
import { successResponse, errorResponse, requireAdmin, withDB, handleError } from '@/lib/api-utils';
import User from '@/lib/models/User';

// PUT /api/users/[id] - Update user (admin only)
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // ✅ Updated Type
) {
    const { id } = await params; // ✅ Await params
    try {
        const { error: authError } = await requireAdmin(req);
        if (authError) return authError;

        const body = await req.json();
        const { name, email, role, status } = body;

        return await withDB(async () => {
            // Build update object
            const updateData: any = {};
            if (name) updateData.name = name;
            if (email) updateData.email = email.toLowerCase();
            if (role) updateData.role = role;
            if (status) updateData.status = status;

            // ✅ Use 'id' instead of 'params.id'
            const user = await User.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                return errorResponse('User not found', 404);
            }

            return successResponse(user, 'User updated successfully');
        });
    } catch (error) {
        return handleError(error);
    }
}

// DELETE /api/users/[id] - Ban user (admin only)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // ✅ Updated Type
) {
    const { id } = await params; // ✅ Await params
    try {
        const { error: authError } = await requireAdmin(req);
        if (authError) return authError;

        return await withDB(async () => {
            // Set user status to banned instead of deleting
            // ✅ Use 'id' instead of 'params.id'
            const user = await User.findByIdAndUpdate(
                id,
                { status: 'banned' },
                { new: true }
            ).select('-password');

            if (!user) {
                return errorResponse('User not found', 404);
            }

            return successResponse(user, 'User banned successfully');
        });
    } catch (error) {
        return handleError(error);
    }
}