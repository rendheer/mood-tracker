import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This is a test user for development only
        // In a production app, you would validate against a database
        if (credentials?.email === 'test@example.com' && credentials?.password === 'password') {
          return {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            image: null,
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      // Add user ID to the session
      if (token?.sub) {
        session.user = {
          ...session.user,
          id: token.sub,
        } as any; // We're extending the session type in next-auth.d.ts
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-please-change-in-production', // In production, use a proper secret in .env.local
  session: {
    strategy: 'jwt',
  },
  // Enable debug logs in development
  debug: process.env.NODE_ENV === 'development',
};
