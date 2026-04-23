'use client';

import { useState } from 'react';
import { Button, Input } from 'antd-mobile';
import { useAuth } from '@/hooks/use-auth';

/**
 * Phone OTP login — requires Supabase Phone provider + SMS provider (Twilio, etc.)
 * Disabled by default (costs money). To enable: import and render inside LoginForm.
 */
export function PhoneLoginForm() {
  const { loading, error, signInWithOtp, verifyOtp } = useAuth();
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

  if (!otpSent) {
    return (
      <div className="flex w-full flex-col gap-3">
        <div className="rounded-xl bg-gray-50 px-3">
          <p className="pt-2.5 text-xs text-gray-400">Số điện thoại</p>
          <Input
            type="tel"
            placeholder="+84 xxx xxx xxx"
            value={phone}
            onChange={setPhone}
            style={{ '--font-size': '15px' } as React.CSSProperties}
          />
        </div>
        <Button
          block
          color="primary"
          size="large"
          loading={loading}
          disabled={!phone}
          onClick={handleSendOtp}
          className="!text-base !font-semibold"
        >
          Gửi mã OTP
        </Button>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="rounded-xl bg-gray-50 px-3">
        <p className="pt-2.5 text-xs text-gray-400">Mã OTP</p>
        <Input
          type="text"
          placeholder="000000"
          value={otp}
          onChange={setOtp}
          maxLength={6}
          className="tracking-[0.4em] font-bold"
          style={{ '--font-size': '24px' } as React.CSSProperties}
        />
      </div>
      <Button
        block
        color="primary"
        size="large"
        loading={loading}
        disabled={otp.length < 6}
        onClick={handleVerifyOtp}
        className="!text-base !font-semibold"
      >
        Xác nhận
      </Button>
      <Button
        fill="none"
        size="small"
        onClick={() => setOtpSent(false)}
        className="!text-gray-500 underline underline-offset-1"
      >
        Đổi số điện thoại
      </Button>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
