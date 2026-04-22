'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from 'antd-mobile';
import { apiFetch } from '@/lib/api';

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
        <div className={`h-2 w-10 rounded-full transition-all ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`h-2 w-10 rounded-full transition-all ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
      </div>

      {step === 1 && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
            🏘️
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Xin chào!</h1>
            <p className="mt-1 text-sm text-gray-500">Thiết lập khu trọ đầu tiên của bạn</p>
          </div>

          <div className="w-full space-y-3">
            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Tên khu trọ / nhà trọ</p>
              <Input
                placeholder="VD: Nhà trọ Số 5"
                value={propertyName}
                onChange={setPropertyName}
                style={{ '--font-size': '15px' } as React.CSSProperties}
              />
            </div>
            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Địa chỉ đầy đủ</p>
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
            className="!rounded-xl !text-base !font-semibold"
          >
            Tiếp tục →
          </Button>
          <Button fill="none" size="small" onClick={skip} className="!text-gray-400">Bỏ qua</Button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
            🏠
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Thêm phòng đầu tiên</h1>
            <p className="mt-1 text-sm text-gray-500">Tạo phòng đầu tiên cho khu trọ của bạn</p>
          </div>

          <div className="w-full space-y-3">
            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Tên / số phòng</p>
              <Input
                placeholder="VD: Phòng 101"
                value={roomName}
                onChange={setRoomName}
                style={{ '--font-size': '15px' } as React.CSSProperties}
              />
            </div>
            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Giá thuê hàng tháng (VNĐ)</p>
              <Input
                type="number"
                placeholder="VD: 3000000"
                value={rentPrice}
                onChange={setRentPrice}
                style={{ '--font-size': '15px' } as React.CSSProperties}
              />
            </div>
            <p className="text-xs text-gray-400 pl-1">Giá cơ bản chưa bao gồm điện nước và dịch vụ khác.</p>
          </div>

          <Button
            block
            color="primary"
            size="large"
            loading={loading}
            onClick={handleCreateRoom}
            className="!rounded-xl !text-base !font-semibold"
          >
            Hoàn tất →
          </Button>
          <Button fill="none" size="small" onClick={skip} className="!text-gray-400">Bỏ qua</Button>
        </>
      )}
    </div>
  );
}
