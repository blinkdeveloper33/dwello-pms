import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@loomi/shared';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        // TODO: Hash password properly in production
      },
    });

    // Get starter plan
    const starterPlan = await prisma.plan.findUnique({
      where: { name: 'starter' },
    });

    if (!starterPlan) {
      return NextResponse.json(
        { error: 'Starter plan not found' },
        { status: 500 }
      );
    }

    // Create organization with a default slug
    const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const org = await prisma.org.create({
      data: {
        name: name + "'s Organization",
        slug: slug,
        planId: starterPlan.id,
      },
    });

    // Create admin role
    const adminRole = await prisma.role.create({
      data: {
        orgId: org.id,
        name: 'Admin',
        description: 'Full access',
        isSystem: true,
        permissions: {
          create: (await prisma.permission.findMany()).map((p: { id: string }) => ({
            permissionId: p.id,
          })),
        },
      },
    });

    // Create membership
    await prisma.membership.create({
      data: {
        orgId: org.id,
        userId: user.id,
        roleId: adminRole.id,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}

