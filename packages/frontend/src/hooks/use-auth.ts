'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { queryClient } from '@/lib/query-client';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const signInWithOtp = async (phone: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) setError(error.message);
    setLoading(false);
    return !error;
  };

  const verifyOtp = async (phone: string, token: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    router.push('/dashboard');
    return true;
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    router.push('/dashboard');
    return true;
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return false;
    }
    // Auto sign in immediately after registration
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return false;
    }
    router.push('/onboarding');
    return true;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    router.push('/login');
  };

  const changePassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setError(error.message);
    setLoading(false);
    return !error;
  };

  return { loading, error, signInWithGoogle, signInWithOtp, verifyOtp, signInWithEmail, signUp, signOut, changePassword };
}
