import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { prisma } from '@loomi/shared';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, paymentMethod } = body;

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Get user's organization
    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id, deletedAt: null },
      include: { org: true },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Verify plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // TODO: Integrate with Stripe or payment processor
    // For now, we'll just update the plan
    // In production, you would:
    // 1. Create/update Stripe customer
    // 2. Create payment method
    // 3. Create/update subscription
    // 4. Update org_subscriptions table

    // Update organization plan
    await prisma.org.update({
      where: { id: membership.orgId },
      data: { planId },
    });

    // Update or create subscription record
    await prisma.orgSubscription.upsert({
      where: { orgId: membership.orgId },
      update: {
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      create: {
        orgId: membership.orgId,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully',
      plan: {
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
      },
    });
  } catch (error) {
    console.error('Error processing subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

