import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from "../api/auth/[...nextauth]/authOptions"';
import { apiRequest } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId') || request.headers.get('x-org-id');
    
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const contactId = searchParams.get('contactId');
    const invoiceId = searchParams.get('invoiceId');
    const status = searchParams.get('status');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    const queryParams = new URLSearchParams();
    if (contactId) queryParams.set('contactId', contactId);
    if (invoiceId) queryParams.set('invoiceId', invoiceId);
    if (status) queryParams.set('status', status);
    if (page) queryParams.set('page', page);
    if (limit) queryParams.set('limit', limit);

    const response = await apiRequest<any>(
      `/payments?${queryParams.toString()}`,
      {
        method: 'GET',
        body: JSON.stringify({ orgId }),
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orgId, ...paymentData } = body;

    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const response = await apiRequest<any>('/payments', {
      method: 'POST',
      body: JSON.stringify({ orgId, ...paymentData }),
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

