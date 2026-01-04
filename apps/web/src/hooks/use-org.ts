'use client';

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

export function useOrg() {
  const { data: session } = useSession();
  
  const currentOrg = useMemo(() => {
    if (!session?.memberships || session.memberships.length === 0) {
      return null;
    }
    return session.memberships[0]?.org || null;
  }, [session]);

  const orgs = useMemo(() => {
    if (!session?.memberships) return [];
    return session.memberships.map((m: any) => m.org).filter(Boolean);
  }, [session]);

  return {
    currentOrg,
    orgs,
    isLoading: !session,
  };
}

