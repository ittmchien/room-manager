'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Checkbox, Input } from 'antd-mobile';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { FormField } from '@/components/ui/form-field';
import { ErrorAlert } from '@/components/ui/error-alert';

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
        <FormField label="Họ và tên">
          <Input placeholder="Nguyễn Văn A" value={name} onChange={setName} style={{ '--font-size': '15px' } as React.CSSProperties} />
        </FormField>

        <FormField label="Email">
          <Input type="email" placeholder="your@email.com" value={email} onChange={setEmail} style={{ '--font-size': '15px' } as React.CSSProperties} />
        </FormField>

        <FormField label="Mật khẩu">
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
              className="!text-gray-400 !p-0 !min-w-0"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </FormField>

        <Checkbox
          checked={agreed}
          onChange={setAgreed}
          style={{ '--icon-size': '16px', '--font-size': '14px', '--gap': '10px' } as React.CSSProperties}
        >
          <span className="text-gray-500 leading-relaxed">
            Tôi đồng ý với{' '}
            <a href="#" className="font-medium text-blue-600 underline underline-offset-4">Điều khoản</a>
            {' '}và{' '}
            <a href="#" className="font-medium text-blue-600 underline underline-offset-4">Bảo mật</a>
          </span>
        </Checkbox>

        {error && <ErrorAlert message={error} />}

        <Button
          block
          color="primary"
          loading={loading}
          disabled={!agreed || !email || !password || !name}
          onClick={handleSubmit}
          className="!text-base !font-semibold"
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
