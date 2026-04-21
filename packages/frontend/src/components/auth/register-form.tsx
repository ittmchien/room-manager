'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export function RegisterForm() {
  const { loading, error, signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    await signUp(email, password, name);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-200">
          🏠
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Bắt đầu ngay</h1>
          <p className="mt-0.5 text-sm text-gray-500">Tạo tài khoản miễn phí</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
        {/* Name */}
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Họ và tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="pl-10 rounded-xl border-gray-200 focus-visible:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="email"
            placeholder="Email hoặc số điện thoại"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10 rounded-xl border-gray-200 focus-visible:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="pl-10 pr-10 rounded-xl border-gray-200 focus-visible:ring-blue-500"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded accent-blue-600"
          />
          <span className="text-gray-500 leading-relaxed">
            Tôi đồng ý với{' '}
            <a href="#" className="font-medium text-blue-600 underline underline-offset-4">Điều khoản</a>
            {' '}và{' '}
            <a href="#" className="font-medium text-blue-600 underline underline-offset-4">Bảo mật</a>
          </span>
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="mt-1 w-full rounded-xl bg-blue-600 py-6 text-base font-semibold hover:bg-blue-700 active:scale-[0.98]"
          disabled={loading || !agreed}
        >
          Đăng ký
        </Button>
      </form>

      <p className="text-sm text-gray-500">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-semibold text-blue-600 underline underline-offset-4">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
