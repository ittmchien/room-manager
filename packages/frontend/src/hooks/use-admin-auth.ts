'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { createBrowserClient } from '@/lib/supabase/client';
import type { AuthUser } from '@room-manager/shared';

export function useAdminAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    apiFetch<AuthUser>('/auth/me')
      .then((u) => {
        if (u.role !== 'SUPER_ADMIN' && u.role !== 'ADMIN') {
          router.replace('/admin-login');
        } else {
          setUser(u);
        }
      })
      .catch(() => router.replace('/admin-login'))
      .finally(() => setLoading(false));
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin-login');
  };

  return { user, loading, signOut };
}
