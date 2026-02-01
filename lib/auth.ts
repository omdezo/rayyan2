import NextAuth, { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export const authConfig: NextAuthConfig = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
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
        async signIn({ user, account, profile }) {
            // Handle Google OAuth sign in
            if (account?.provider === 'google') {
                try {
                    await connectDB();

                    // Check if user exists
                    let existingUser = await User.findOne({ email: user.email?.toLowerCase() });

                    if (!existingUser) {
                        // Create new user for Google sign-in
                        existingUser = await User.create({
                            name: user.name || 'Google User',
                            email: user.email?.toLowerCase(),
                            password: '', // No password for OAuth users
                            role: 'user',
                            status: 'active',
                        });
                        console.log('✅ Created new Google user:', existingUser.email);
                    } else {
                        console.log('✅ Existing user logged in with Google:', existingUser.email);
                    }

                    // Store user ID for later use in JWT callback
                    user.id = existingUser._id.toString();
                    (user as any).role = existingUser.role;

                    return true;
                } catch (error) {
                    console.error('❌ Google sign-in error:', error);
                    return false;
                }
            }

            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role || 'user';
                console.log('🔑 JWT callback - Setting token:', { id: token.id, role: token.role });
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                console.log('📋 Session callback - Setting session:', {
                    email: session.user.email,
                    role: token.role
                });
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
    trustHost: true, // IMPORTANT: Trust the host header for Vercel
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);