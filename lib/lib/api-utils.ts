import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';

export function successResponse<T>(data: T, message?: string, status: number = 200) {
    return NextResponse.json(
        {
            success: true,
            data,
            message,
        },
        { status }
    );
}

export function errorResponse(error: string, status: number = 400) {
    return NextResponse.json(
        {
            success: false,
            error,
        },
        { status }
    );
}

export async function getSession(req: NextRequest) {
    try {
        const session = await auth();
        return session;
    } catch (error) {
        return null;
    }
}

export async function requireAuth(req: NextRequest) {
    const session = await getSession(req);

    if (!session || !session.user) {
        return {
            error: errorResponse('Unauthorized. Please login.', 401),
            session: null,
        };
    }

    return {
        error: null,
        session,
    };
}

export async function requireAdmin(req: NextRequest) {
    const session = await getSession(req);

    if (!session || !session.user) {
        return {
            error: errorResponse('Unauthorized. Please login.', 401),
            session: null,
        };
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'admin') {
        return {
            error: errorResponse('Forbidden. Admin access required.', 403),
            session: null,
        };
    }

    return {
        error: null,
        session,
    };
}

export async function withDB<T>(
    handler: () => Promise<T>
): Promise<T> {
    try {
        await connectDB();
        return await handler();
    } catch (error: any) {
        console.error('Database operation error:', error);
        throw error;
    }
}

export async function handleError(error: any) {
    console.error('API Error:', error);

    if (error.name === 'ValidationError') {
        return errorResponse(error.message, 400);
    }

    if (error.code === 11000) {
        return errorResponse('Duplicate entry. This record already exists.', 409);
    }

    return errorResponse(
        error.message || 'Internal server error',
        error.status || 500
    );
}
