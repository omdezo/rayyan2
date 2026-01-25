import NextAuth, { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export const authConfig: NextAuthConfig = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                // ✅ Fix: Explicitly cast credentials to string to satisfy TypeScript
                const email = credentials?.email as string | undefined;
                const password = credentials?.password as string | undefined;

                console.log('🔐 Login attempt for email:', email);

                if (!email || !password) {
                    console.log('❌ Missing email or password');
                    return null;
                }

                try {
                    await connectDB();
                    console.log('✅ DB connected, looking for user...');

                    const user = await User.findOne({
                        email: email.toLowerCase(), // ✅ Now safe to use toLowerCase()
                    });

                    if (!user) {
                        console.log('❌ User not found in database for email:', email.toLowerCase());
                        return null;
                    }

                    console.log('✅ User found:', { email: user.email, role: user.role, status: user.status });

                    // Check if user is banned
                    if (user.status === 'banned') {
                        console.log('❌ User is banned');
                        throw new Error('Your account has been banned');
                    }

                    // Compare password
                    console.log('🔑 Comparing passwords...');
                    const isPasswordValid = await bcrypt.compare(
                        password,
                        user.password
                    );

                    console.log('🔑 Password valid?', isPasswordValid);

                    if (!isPasswordValid) {
                        console.log('❌ Invalid password');
                        return null;
                    }

                    console.log('✅ Login successful for:', user.email);

                    // Return user object
                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    };
                } catch (error) {
                    console.error('❌ Auth error:', error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: '/ar/login',
        error: '/ar/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);