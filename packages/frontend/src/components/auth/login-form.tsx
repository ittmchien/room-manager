'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export function LoginForm() {
  const { loading, error, signInWithGoogle, signInWithOtp, verifyOtp } =
    useAuth();
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSendOtp = async () => {
    const success = await signInWithOtp(phone);
    if (success) setOtpSent(true);
  };

  const handleVerifyOtp = async () => {
    await verifyOtp(phone, otp);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white">
          🏠
        </div>
        <h1 className="text-2xl font-bold">Room Manager</h1>
        <p className="text-muted-foreground">Chào mừng trở lại</p>
      </div>

      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={signInWithGoogle}
        disabled={loading}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Đăng nhập bằng Google
      </Button>

      <div className="flex w-full items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">HOẶC</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {!otpSent ? (
        <div className="flex w-full flex-col gap-3">
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSendOtp}
            disabled={loading || !phone}
          >
            Gửi OTP
          </Button>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-3">
          <div className="space-y-2">
            <Label htmlFor="otp">Nhập mã OTP</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleVerifyOtp}
            disabled={loading || otp.length < 6}
          >
            Xác nhận
          </Button>
          <button
            className="text-sm text-muted-foreground underline"
            onClick={() => setOtpSent(false)}
          >
            Đổi số điện thoại
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <Link
        href="/login?method=email"
        className="text-sm text-blue-600 hover:underline"
      >
        Đăng nhập bằng Email/Mật khẩu
      </Link>

      <p className="text-sm text-muted-foreground">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-medium text-blue-600 underline">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
