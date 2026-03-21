import { NextResponse } from 'next/server';
import { getCustomerSession, getAuthenticatedCustomer } from '@/lib/customer-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCustomerSession();
    const customer = await getAuthenticatedCustomer();
    return NextResponse.json({ session, customer, success: !!session && !!customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack });
  }
}
