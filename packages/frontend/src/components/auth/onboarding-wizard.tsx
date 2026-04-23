'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from 'antd-mobile';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [propertyName, setPropertyName] = useState('');
  const [address, setAddress] = useState('');
  const [roomName, setRoomName] = useState('');
  const [rentPrice, setRentPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  const handleCreateProperty = async () => {
    setLoading(true);
    try {
      const property = await apiFetch<{ id: string }>('/properties', {
        method: 'POST',
        body: JSON.stringify({ name: propertyName, address }),
      });
      setPropertyId(property.id);
      setStep(2);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreateRoom = async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      await apiFetch(`/properties/${propertyId}/rooms`, {
        method: 'POST',
        body: JSON.stringify({
          name: roomName,
          rentPrice: parseInt(rentPrice) || 0,
        }),
      });
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const skip = () => {
    if (step === 1) setStep(2);
    else router.push('/dashboard');
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Step dots */}
      <div className="flex items-center gap-2">
        <div className={cn('h-2 rounded-full transition-all', step >= 1 ? 'w-8 bg-primary' : 'w-2 bg-surface-variant')} />
        <div className={cn('h-2 rounded-full transition-all', step >= 2 ? 'w-8 bg-primary' : 'w-2 bg-surface-variant')} />
      </div>

      {step === 1 && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-3xl">
            🏘️
          </div>
          <div className="text-center">
            <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Xin chào!</h1>
            <p className="mt-1 text-sm text-on-surface-variant">Thiết lập khu trọ đầu tiên của bạn</p>
          </div>

          <div className="w-full space-y-3">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-ambient-sm border-ghost">
              <p className="font-headline text-[0.6875rem] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Tên khu trọ / nhà trọ</p>
              <Input
                placeholder="VD: Nhà trọ Số 5"
                value={propertyName}
                onChange={setPropertyName}
                style={{ '--font-size': '15px' } as React.CSSProperties}
              />
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-ambient-sm border-ghost">
              <p className="font-headline text-[0.6875rem] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Địa chỉ đầy đủ</p>
              <Input
                placeholder="VD: 123 Nguyễn Văn A, Q.1, TP.HCM"
                value={address}
                onChange={setAddress}
                style={{ '--font-size': '15px' } as React.CSSProperties}
              />
            </div>
          </div>

          <Button
            block
            color="primary"
            size="large"
            loading={loading}
            disabled={!propertyName}
            onClick={handleCreateProperty}
            className="!bg-gradient-to-r !from-primary !to-primary-container !text-on-primary !rounded-xl !py-4 !font-headline !font-bold !text-lg !shadow-[0_8px_24px_rgba(0,74,198,0.25)]"
          >
            Tiếp tục →
          </Button>
          <Button
            fill="none"
            size="small"
            onClick={skip}
            className="!text-primary !font-medium !text-sm"
          >
            Bỏ qua
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-3xl">
            🏠
          </div>
          <div className="text-center">
            <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Thêm phòng đầu tiên</h1>
            <p className="mt-1 text-sm text-on-surface-variant">Tạo phòng đầu tiên cho khu trọ của bạn</p>
          </div>

          <div className="w-full space-y-3">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-ambient-sm border-ghost">
              <p className="font-headline text-[0.6875rem] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Tên / số phòng</p>
              <Input
                placeholder="VD: Phòng 101"
                value={roomName}
                onChange={setRoomName}
                style={{ '--font-size': '15px' } as React.CSSProperties}
              />
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-ambient-sm border-ghost">
              <p className="font-headline text-[0.6875rem] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Giá thuê hàng tháng (VNĐ)</p>
              <Input
                type="number"
                placeholder="VD: 3000000"
                value={rentPrice}
                onChange={setRentPrice}
                style={{ '--font-size': '15px' } as React.CSSProperties}
              />
            </div>
            <p className="text-xs text-on-surface-variant pl-1">Giá cơ bản chưa bao gồm điện nước và dịch vụ khác.</p>
          </div>

          <Button
            block
            color="primary"
            size="large"
            loading={loading}
            onClick={handleCreateRoom}
            className="!bg-gradient-to-r !from-primary !to-primary-container !text-on-primary !rounded-xl !py-4 !font-headline !font-bold !text-lg !shadow-[0_8px_24px_rgba(0,74,198,0.25)]"
          >
            Hoàn tất →
          </Button>
          <Button
            fill="none"
            size="small"
            onClick={skip}
            className="!text-primary !font-body hover:!bg-primary/5 !rounded-lg"
          >
            Bỏ qua bước này
          </Button>
        </>
      )}
    </div>
  );
}
