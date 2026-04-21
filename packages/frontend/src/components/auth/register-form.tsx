'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export function RegisterForm() {
  const { loading, error, signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    await signUp(email, password, name);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
          🏠
        </div>
        <h1 className="text-2xl font-bold">Bắt đầu quản lý ngay</h1>
        <p className="text-center text-sm text-muted-foreground">
          Room Manager - Giải pháp tối ưu cho phòng trọ của bạn.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Họ và tên</Label>
          <Input
            id="name"
            placeholder="Nhập họ và tên của bạn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email / Số điện thoại</Label>
          <Input
            id="email"
            type="email"
            placeholder="Nhập email hoặc số điện thoại"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            type="password"
            placeholder="Tạo mật khẩu an toàn"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
          />
          <span className="text-muted-foreground">
            Tôi đồng ý với{' '}
            <a href="#" className="text-blue-600 underline">
              Điều khoản dịch vụ
            </a>{' '}
            và{' '}
            <a href="#" className="text-blue-600 underline">
              Chính sách bảo mật
            </a>
            .
          </span>
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading || !agreed}>
          Đăng ký
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-medium text-blue-600 underline">
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
}
