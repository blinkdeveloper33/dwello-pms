import { NextAuthOptions } from 'next-auth';
import { prisma } from '@loomi/shared';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  // Using JWT strategy with CredentialsProvider, no adapter needed
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing credentials');
            return null;
          }

          console.log('🔍 Looking for user:', credentials.email);
          
          // For MVP, we'll use a simple check
          // In production, you'd hash passwords properly
          let user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          // If demo user doesn't exist, create it automatically
          if (!user && credentials.email === 'demo@dwello.com') {
            console.log('📝 Creating demo user...');
            
            // Get starter plan
            const starterPlan = await prisma.plan.findFirst({
              where: { name: 'starter' },
            });

            if (!starterPlan) {
              console.log('❌ Starter plan not found');
              return null;
            }

            // Create demo org if it doesn't exist
            let demoOrg = await prisma.org.findFirst({
              where: { slug: 'demo-property-management' },
            });

            if (!demoOrg) {
              demoOrg = await prisma.org.create({
                data: {
                  name: 'Demo Property Management',
                  slug: 'demo-property-management',
                  planId: starterPlan.id,
                },
              });
            }

            // Create demo user
            user = await prisma.user.create({
              data: {
                email: 'demo@dwello.com',
                name: 'Demo User',
                emailVerified: new Date(),
              },
            });

            // Create admin role if it doesn't exist
            let adminRole = await prisma.role.findFirst({
              where: { 
                orgId: demoOrg.id,
                name: 'Admin',
              },
            });

            if (!adminRole) {
              const permissions = await prisma.permission.findMany();
              adminRole = await prisma.role.create({
                data: {
                  orgId: demoOrg.id,
                  name: 'Admin',
                  description: 'Full access to all features',
                  isSystem: true,
                  permissions: {
                    create: permissions.map((p: { id: string }) => ({
                      permissionId: p.id,
                    })),
                  },
                },
              });
            }

            // Create membership if it doesn't exist
            const existingMembership = await prisma.membership.findFirst({
              where: {
                userId: user.id,
                orgId: demoOrg.id,
              },
            });

            if (!existingMembership) {
              await prisma.membership.create({
                data: {
                  orgId: demoOrg.id,
                  userId: user.id,
                  roleId: adminRole.id,
                },
              });
            }
          }

          console.log('👤 User found:', user ? user.email : 'NOT FOUND');

          if (!user) {
            console.log('❌ User not found in database');
            return null;
          }

          // TODO: Implement proper password hashing/verification
          // For now, allow any user to sign in (MVP)
          console.log('✅ Authorizing user:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
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
        // Fetch user's memberships to include org context
        const memberships = await prisma.membership.findMany({
          where: { userId: user.id },
          include: {
            org: true,
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });
        token.memberships = memberships;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.memberships = token.memberships as any;
      }
      return session;
    },
  },
};

