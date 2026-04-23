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
    <div className="flex flex-col items-center">
      {/* Logo */}
      <div className="mb-10 text-center">
        <span
          className="material-symbols-outlined text-primary text-5xl mb-4 block"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          door_front
        </span>
        <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
          Room Manager
        </h1>
        <p className="font-body text-sm text-on-surface-variant mt-2">
          Quản lý không gian của bạn
        </p>
      </div>

      {/* Auth buttons */}
      <div className="w-full space-y-4">
        <Button
          block
          onClick={signInWithGoogle}
          disabled={loading}
          className="!bg-gradient-to-r !from-primary !to-primary-container !text-on-primary !font-body !font-medium !text-sm !py-3.5 !rounded-xl !border-none hover:!opacity-90 transition-opacity"
        >
          <span className="flex items-center justify-center gap-3">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
            Đăng nhập bằng Google
          </span>
        </Button>

        <Button
          block
          fill="none"
          className="!bg-surface-container-high !text-on-surface !font-body !font-medium !text-sm !py-3.5 !rounded-xl hover:!bg-surface-variant transition-colors"
        >
          <span className="flex items-center justify-center gap-3">
            <span className="material-symbols-outlined">call</span>
            Đăng nhập bằng SĐT
          </span>
        </Button>
      </div>

      {/* Divider */}
      <div className="mt-8 flex items-center w-full">
        <div className="flex-grow h-px bg-outline-variant opacity-30" />
        <span className="px-4 font-body text-xs text-on-surface-variant uppercase tracking-widest">
          Hoặc
        </span>
        <div className="flex-grow h-px bg-outline-variant opacity-30" />
      </div>

      {/* Email/password form */}
      <div className="mt-8 w-full flex flex-col gap-3">
        <div className="rounded-xl bg-surface-container-low px-3">
          <p className="pt-2.5 text-xs text-on-surface-variant font-label">Email</p>
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={setEmail}
            style={{ '--font-size': '15px' } as React.CSSProperties}
          />
        </div>

        <div className="rounded-xl bg-surface-container-low px-3">
          <p className="pt-2.5 text-xs text-on-surface-variant font-label">Mật khẩu</p>
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
              className="!text-outline !p-0 !min-w-0"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-error-container px-3 py-2 text-center text-sm text-on-error-container">
            {error}
          </p>
        )}

        <Button
          block
          loading={loading}
          disabled={!email || !password}
          onClick={handleSubmit}
          className="!bg-gradient-to-r !from-primary !to-primary-container !text-on-primary !text-base !font-semibold !font-headline !rounded-xl !py-3.5 !border-none"
        >
          Đăng nhập
        </Button>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="font-label text-[0.6875rem] text-on-surface-variant">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-headline font-semibold text-primary hover:text-primary-container transition-colors">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
