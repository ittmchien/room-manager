'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Checkbox, Input } from 'antd-mobile';
import { useAuth } from '@/hooks/use-auth';

export function RegisterForm() {
  const { loading, error, signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async () => {
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

      <div className="flex w-full flex-col gap-3">
        {/* Name */}
        <div className="rounded-xl bg-gray-50 px-3">
          <p className="pt-2.5 text-xs text-gray-400">Họ và tên</p>
          <Input
            placeholder="Nguyễn Văn A"
            value={name}
            onChange={setName}
            className="[--font-size:15px]"
          />
        </div>

        {/* Email */}
        <div className="rounded-xl bg-gray-50 px-3">
          <p className="pt-2.5 text-xs text-gray-400">Email</p>
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={setEmail}
            className="[--font-size:15px]"
          />
        </div>

        {/* Password */}
        <div className="rounded-xl bg-gray-50 px-3">
          <p className="pt-2.5 text-xs text-gray-400">Mật khẩu</p>
          <div className="flex items-center">
            <div className="flex-1">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={setPassword}
                className="[--font-size:15px]"
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

        {/* Terms */}
        <Checkbox
          checked={agreed}
          onChange={setAgreed}
          className="[--icon-size:16px] [--font-size:14px] [--gap:10px]"
        >
          <span className="text-gray-500 leading-relaxed">
            Tôi đồng ý với{' '}
            <a href="#" className="font-medium text-blue-600 underline underline-offset-4">Điều khoản</a>
            {' '}và{' '}
            <a href="#" className="font-medium text-blue-600 underline underline-offset-4">Bảo mật</a>
          </span>
        </Checkbox>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">{error}</p>
        )}

        <Button
          block
          color="primary"
          size="large"
          loading={loading}
          disabled={!agreed || !email || !password || !name}
          onClick={handleSubmit}
          className="!rounded-xl !text-base !font-semibold"
        >
          Đăng ký
        </Button>
      </div>

      <p className="text-sm text-gray-500">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-semibold text-blue-600 underline underline-offset-4">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
