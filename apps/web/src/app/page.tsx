import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/authOptions';

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Always show splash screen first, then redirect based on session
  redirect('/splash');
}

