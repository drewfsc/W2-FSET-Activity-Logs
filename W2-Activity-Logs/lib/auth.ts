import { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import type { Adapter } from 'next-auth/adapters';
import clientPromise from '@/lib/mongodb-client';
import authDbConnect from '@/lib/authDb';
import { getAuthUserModel } from '@/models/AuthUser';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as Adapter,
  providers: [
    // Email Magic Link Provider
    EmailProvider({
      server: process.env.EMAIL_SERVER || {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),

    // SMS OTP Provider (using Credentials provider with Twilio)
    CredentialsProvider({
      id: 'sms-otp',
      name: 'SMS OTP',
      credentials: {
        phoneNumber: { label: 'Phone Number', type: 'tel' },
        code: { label: 'Verification Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber || !credentials?.code) {
          throw new Error('Phone number and code are required');
        }

        try {
          // Format phone number to E.164 format
          let formattedPhone = credentials.phoneNumber.replace(/\D/g, ''); // Remove all non-digits

          // If it doesn't start with country code, assume US (+1)
          if (formattedPhone.length === 10) {
            formattedPhone = `+1${formattedPhone}`;
          } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
            formattedPhone = `+${formattedPhone}`;
          } else if (!formattedPhone.startsWith('+')) {
            formattedPhone = `+${formattedPhone}`;
          } else {
            formattedPhone = `+${formattedPhone}`;
          }

          // Verify the OTP code using Twilio Verify
          const twilio = require('twilio');
          const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
          );

          const verificationCheck = await client.verify.v2
            .services(process.env.TWILIO_SERVICE_SID)
            .verificationChecks.create({
              to: formattedPhone,
              code: credentials.code,
            });

          if (verificationCheck.status !== 'approved') {
            throw new Error('Invalid or expired code');
          }

          // Connect to AUTH database
          const authConnection = await authDbConnect();
          const AuthUser = getAuthUserModel(authConnection);
          console.log(`[AUTH] 📊 Using collection: ${AuthUser.collection.name}`);

          // Build fuzzy phone search - try to find existing user with various phone formats
          const cleanPhone = formattedPhone.replace(/\D/g, '');
          let user = await AuthUser.findOne({
            $or: [
              { phone: formattedPhone }, // Exact match with country code (+16083998607)
              { phone: cleanPhone }, // Without any formatting (16083998607)
              { phone: cleanPhone.replace(/^1/, '') }, // Without leading 1 (6083998607)
              { phone: `+${cleanPhone}` }, // With + prefix
              { phone: `1${cleanPhone.replace(/^1/, '')}` } // With 1 prefix
            ]
          });

          if (!user) {
            // Create new user for first-time SMS login in AUTH database
            user = await AuthUser.create({
              phone: formattedPhone,
              email: `${formattedPhone}@sms.placeholder`, // Placeholder
              name: formattedPhone,
              level: 'client',
              programs: ['W-2'],
              emailVerified: new Date(),
              timestamp: new Date(),
            });
            console.log(`[AUTH] ✅ Created new user for phone ${formattedPhone}`);
          } else {
            console.log(`[AUTH] ✅ Found existing user with phone ${user.phone} (searched for ${formattedPhone})`);
          }

          // Update last login
          const loginTime = new Date();
          user.lastLogin = loginTime;
          await user.save();
          console.log(`[AUTH] ✅ SMS Login - Updated lastLogin for ${user.email} in FSC database at ${loginTime.toISOString()}`);

          return {
            id: String(user._id),
            email: user.email,
            name: user.name,
            phoneNumber: user.phone,
            role: user.level || 'client',
          };
        } catch (error) {
          console.error('SMS OTP verification error:', error);
          throw new Error('Failed to verify code');
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // For email magic link, ensure user exists in AUTH database
      if (account?.provider === 'email' && user.email) {
        const authConnection = await authDbConnect();
        const AuthUser = getAuthUserModel(authConnection);
        console.log(`[AUTH] 📊 Using collection: ${AuthUser.collection.name}`);

        let authUser = await AuthUser.findOne({ email: user.email.toLowerCase() });

        if (!authUser) {
          // Create user record in AUTH database
          authUser = await AuthUser.create({
            email: user.email.toLowerCase(),
            name: user.name || user.email.split('@')[0],
            level: 'client',
            programs: ['W-2'],
            emailVerified: new Date(),
            timestamp: new Date(),
          });
        }

        // Update last login
        const loginTime = new Date();
        authUser.lastLogin = loginTime;
        await authUser.save();
        console.log(`[AUTH] ✅ Email Login - Updated lastLogin for ${authUser.email} in FSC database at ${loginTime.toISOString()}`);
      }

      return true;
    },

    async jwt({ token, user, account, trigger }) {
      // Always refresh user data from database to check registration status
      if (token.id) {
        const authConnection = await authDbConnect();
        const AuthUser = getAuthUserModel(authConnection);

        const authUser = await AuthUser.findById(token.id);

        if (authUser) {
          token.role = authUser.level || 'client';
          token.phoneNumber = authUser.phone;
          // No longer need registration since we collect name at login
          token.needsRegistration = false;
        }
      }

      if (user) {
        // Initial login - set up token from AUTH database
        const authConnection = await authDbConnect();
        const AuthUser = getAuthUserModel(authConnection);
        console.log(`[AUTH] 📊 Using collection: ${AuthUser.collection.name}`);

        // Build fuzzy phone search criteria
        const phoneSearchCriteria = [];
        if (user.phoneNumber) {
          const cleanPhone = user.phoneNumber.replace(/\D/g, '');
          phoneSearchCriteria.push(
            { phone: user.phoneNumber }, // Exact match with country code
            { phone: cleanPhone }, // Without country code
            { phone: `+1${cleanPhone}` }, // With +1
            { phone: `1${cleanPhone}` }, // With 1
            { phone: cleanPhone.replace(/^1/, '') } // Remove leading 1
          );
        }

        const authUser = await AuthUser.findOne({
          $or: [
            { email: user.email },
            ...phoneSearchCriteria
          ]
        });

        if (authUser) {
          token.id = String(authUser._id);
          token.role = authUser.level || 'client';
          token.phoneNumber = authUser.phone;
          // No longer need registration since we collect name at login
          token.needsRegistration = false;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.phoneNumber = token.phoneNumber as string;
        session.user.needsRegistration = token.needsRegistration as boolean;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // If the url is a relative path, prepend baseUrl
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // If url is the baseUrl or login page, redirect to dashboard
      // Note: Registration check happens on the dashboard page itself
      if (url === baseUrl || url === `${baseUrl}/login`) return `${baseUrl}/dashboard`;
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },

  pages: {
    signIn: '/login',
    verifyRequest: '/verify-request',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
