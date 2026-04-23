'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Input } from 'antd-mobile';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { createBrowserClient } from '@/lib/supabase/client';

export function LoginForm() {
  const { loading, error, signInWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/dashboard');
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const handleSubmit = async () => {
    await signInWithEmail(email, password);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-200">
          🏠
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Room Manager</h1>
          <p className="mt-0.5 text-sm text-gray-500">Chào mừng trở lại</p>
        </div>
      </div>

      {/* Google button */}
      <Button
        block
        fill="outline"
        onClick={signInWithGoogle}
        disabled={loading}
        className="!border-gray-200 !text-gray-700 !font-medium"
      >
        <span className="flex items-center justify-center gap-3">
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Đăng nhập bằng Google
        </span>
      </Button>

      {/* Divider */}
      <div className="flex w-full items-center gap-3">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs font-medium text-gray-400">HOẶC</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      {/* Email/password form */}
      <div className="flex w-full flex-col gap-3">
        <div className="rounded-xl bg-gray-50 px-3">
          <p className="pt-2.5 text-xs text-gray-400">Email</p>
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={setEmail}
            style={{ '--font-size': '15px' } as React.CSSProperties}
          />
        </div>

        <div className="rounded-xl bg-gray-50 px-3">
          <p className="pt-2.5 text-xs text-gray-400">Mật khẩu</p>
          <div className="flex items-center">
            <div className="flex-1">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
                style={{ '--font-size': '15px' } as React.CSSProperties}
              />
            </div>
            <Button
              fill="none"
              onClick={() => setShowPassword(!showPassword)}
              className="!text-gray-400 !p-0 !min-w-0"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">{error}</p>
        )}

        <Button
          block
          color="primary"
          loading={loading}
          disabled={!email || !password}
          onClick={handleSubmit}
          className="!text-base !font-semibold"
        >
          Đăng nhập
        </Button>
      </div>

      <p className="text-sm text-gray-500">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-semibold text-blue-600 underline underline-offset-4">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
