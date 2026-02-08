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
            console.log('🔑 JWT callback triggered:', {
                hasAccount: !!account,
                provider: account?.provider,
                hasUser: !!user,
                userEmail: user?.email,
                tokenEmail: token.email,
                tokenId: token.id
            });

            // Handle Google OAuth in JWT callback (runs on first sign-in)
            if (account?.provider === 'google' && user?.email) {
                try {
                    console.log('🔐 Google OAuth - Creating/finding user for:', user.email);
                    await connectDB();

                    // Check if user exists
                    let existingUser = await User.findOne({ email: user.email.toLowerCase() });

                    if (!existingUser) {
                        // Create new user
                        console.log('🆕 Creating new Google user:', user.email);
                        existingUser = await User.create({
                            name: user.name || 'Google User',
                            email: user.email.toLowerCase(),
                            password: '', // Empty for OAuth
                            role: 'user',
                            status: 'active',
                            emailVerified: true, // Auto-verify OAuth users
                        });
                        console.log('✅ Created Google user:', existingUser.email);
                    } else {
                        console.log('✅ Found existing Google user:', existingUser.email);
                    }

                    // ⚠️ CRITICAL: Ensure _id exists before converting to string
                    if (!existingUser._id) {
                        console.error('❌ CRITICAL: existingUser._id is missing!', existingUser);
                        throw new Error('User ID is missing');
                    }

                    token.id = existingUser._id.toString();
                    token.role = existingUser.role;
                    token.email = existingUser.email;

                    console.log('✅ Google OAuth token set:', { id: token.id, role: token.role, email: token.email });
                } catch (error) {
                    console.error('❌ JWT Google error:', error);
                }
            } else if (user) {
                // Regular credentials login (runs on first sign-in)
                console.log('🔐 Credentials login for:', user.email);
                token.id = user.id;
                token.role = (user as any).role || 'user';
                token.email = user.email;
                console.log('✅ Credentials token set:', { id: token.id, role: token.role });
            }

            // 🔧 FIX FOR EXISTING USERS: If token.id is missing but we have an email,
            // fetch the user from DB and set the token.id (auto-repair old sessions)
            if (!token.id && token.email) {
                try {
                    await connectDB();
                    const existingUser = await User.findOne({ email: (token.email as string).toLowerCase() });

                    if (existingUser && existingUser._id) {
                        token.id = existingUser._id.toString();
                        token.role = existingUser.role;
                        console.log('🔧 Auto-repaired session for:', token.email);
                    } else {
                        console.error('❌ Could not find user for token repair:', token.email);
                    }
                } catch (error) {
                    console.error('❌ Error repairing token:', error);
                }
            }

            // ⚠️ CRITICAL: Final validation - ensure token.id is set
            if (!token.id) {
                console.error('❌ CRITICAL: token.id is missing after JWT callback!', {
                    provider: account?.provider,
                    email: token.email
                });
            }

            // Fetch email verification status and session version
            if (token.id || token.email) {
                try {
                    await connectDB();
                    const dbUser = await User.findById(token.id || await User.findOne({ email: (token.email as string).toLowerCase() }).then(u => u?._id));

                    if (dbUser) {
                        token.emailVerified = dbUser.emailVerified;
                        token.sessionVersion = dbUser.sessionVersion;
                    }
                } catch (error) {
                    console.error('❌ Error fetching verification status:', error);
                }
            }

            return token;
        },
        async session({ session, token }) {
            console.log('📋 Session callback:', {
                hasSession: !!session,
                hasUser: !!session?.user,
                tokenId: token.id,
                tokenEmail: token.email,
                tokenRole: token.role
            });

            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).emailVerified = token.emailVerified;
                (session.user as any).sessionVersion = token.sessionVersion;

                console.log('✅ Session user updated:', {
                    email: session.user.email,
                    id: (session.user as any).id,
                    role: (session.user as any).role,
                    emailVerified: (session.user as any).emailVerified
                });

                // ⚠️ CRITICAL: Validate that ID exists (especially for Google OAuth)
                if (!token.id) {
                    console.error('❌ CRITICAL: token.id is missing in session callback!', {
                        email: session.user.email,
                        tokenEmail: token.email
                    });
                }
            } else {
                console.error('❌ CRITICAL: session.user is missing in session callback!');
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