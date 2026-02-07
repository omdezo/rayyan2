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
            // Allow Google OAuth sign in (user creation handled in JWT callback)
            console.log('🔐 Sign-in attempt:', {
                provider: account?.provider,
                email: user?.email
            });
            return true;
        },
        async jwt({ token, user, account }) {
            // Handle Google OAuth in JWT callback
            if (account?.provider === 'google' && user?.email) {
                try {
                    await connectDB();

                    // Check if user exists
                    let existingUser = await User.findOne({ email: user.email.toLowerCase() });

                    if (!existingUser) {
                        // Create new user
                        existingUser = await User.create({
                            name: user.name || 'Google User',
                            email: user.email.toLowerCase(),
                            password: '', // Empty for OAuth
                            role: 'user',
                            status: 'active',
                        });
                        console.log('✅ Created Google user in JWT:', existingUser.email);
                    }

                    // ⚠️ CRITICAL: Ensure _id exists before converting to string
                    if (!existingUser._id) {
                        console.error('❌ CRITICAL: existingUser._id is missing!', existingUser);
                        throw new Error('User ID is missing');
                    }

                    token.id = existingUser._id.toString();
                    token.role = existingUser.role;

                    console.log('✅ JWT Google - Token set:', {
                        id: token.id,
                        role: token.role,
                        email: existingUser.email
                    });
                } catch (error) {
                    console.error('❌ JWT Google error:', error);
                    // Don't set token.id if there's an error - this will prevent login
                }
            } else if (user) {
                // Regular credentials login
                token.id = user.id;
                token.role = (user as any).role || 'user';
                console.log('✅ JWT Credentials - Token set:', { id: token.id, role: token.role });
            }

            // ⚠️ CRITICAL: Final validation - ensure token.id is set
            if (!token.id) {
                console.error('❌ CRITICAL: token.id is missing after JWT callback!', {
                    provider: account?.provider,
                    email: user?.email,
                    token
                });
            } else {
                console.log('🔑 JWT callback - Final token:', { id: token.id, role: token.role });
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                console.log('📋 Session callback - Setting session:', {
                    email: session.user.email,
                    id: token.id, // ⚠️ CRITICAL: Log the ID to debug Google OAuth
                    role: token.role
                });

                // ⚠️ CRITICAL: Validate that ID exists (especially for Google OAuth)
                if (!token.id) {
                    console.error('❌ CRITICAL: token.id is missing in session callback!', { email: session.user.email });
                }
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