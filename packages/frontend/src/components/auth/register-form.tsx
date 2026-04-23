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
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl text-on-primary shadow-lg">
          🏠
        </div>
        <div className="text-center">
          <h1 className="font-headline text-[2.25rem] font-bold text-primary tracking-tight">Bắt đầu ngay</h1>
          <p className="mt-0.5 font-body text-[0.875rem] text-on-surface-variant">Tạo tài khoản miễn phí</p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        <div className="bg-surface-container-low rounded-xl px-4 py-3">
          <p className="font-label text-[0.6875rem] font-semibold text-on-surface-variant uppercase tracking-wider">Họ và tên</p>
          <Input placeholder="Nguyễn Văn A" value={name} onChange={setName} style={{ '--font-size': '15px' } as React.CSSProperties} />
        </div>

        <div className="bg-surface-container-low rounded-xl px-4 py-3">
          <p className="font-label text-[0.6875rem] font-semibold text-on-surface-variant uppercase tracking-wider">Email</p>
          <Input type="email" placeholder="your@email.com" value={email} onChange={setEmail} style={{ '--font-size': '15px' } as React.CSSProperties} />
        </div>

        <div className="bg-surface-container-low rounded-xl px-4 py-3">
          <p className="font-label text-[0.6875rem] font-semibold text-on-surface-variant uppercase tracking-wider">Mật khẩu</p>
          <div className="flex items-center">
            <div className="flex-1">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={setPassword}
                style={{ '--font-size': '15px' } as React.CSSProperties}
              />
            </div>
            <Button
              fill="none"
              onClick={() => setShowPassword(!showPassword)}
              className="!text-on-surface-variant !p-0 !min-w-0"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Checkbox
          checked={agreed}
          onChange={setAgreed}
          style={{ '--icon-size': '16px', '--font-size': '14px', '--gap': '10px' } as React.CSSProperties}
        >
          <span className="font-label text-[0.6875rem] text-on-surface-variant leading-relaxed">
            Tôi đồng ý với{' '}
            <a href="#" className="font-medium text-primary underline underline-offset-4">Điều khoản</a>
            {' '}và{' '}
            <a href="#" className="font-medium text-primary underline underline-offset-4">Bảo mật</a>
          </span>
        </Checkbox>

        {error && (
          <p className="rounded-lg bg-error-container px-3 py-2 text-center text-sm text-on-error-container">{error}</p>
        )}

        <Button
          block
          color="primary"
          loading={loading}
          disabled={!agreed || !email || !password || !name}
          onClick={handleSubmit}
          className="!bg-gradient-to-r !from-primary !to-primary-container !text-on-primary !font-headline !font-semibold !text-[1.125rem] !py-4 !rounded-xl !border-none shadow-[0_8px_20px_rgba(0,74,198,0.2)]"
        >
          Đăng ký
        </Button>
      </div>

      <p className="font-label text-[0.6875rem] text-on-surface-variant">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-headline font-semibold text-primary underline underline-offset-4">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
