'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [propertyName, setPropertyName] = useState('');
  const [address, setAddress] = useState('');
  const [roomName, setRoomName] = useState('');
  const [rentPrice, setRentPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateProperty = async () => {
    setLoading(true);
    try {
      await apiFetch('/properties', {
        method: 'POST',
        body: JSON.stringify({ name: propertyName, address }),
      });
      setStep(2);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      await apiFetch('/rooms', {
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
      {step === 1 && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
            🏘️
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Xin chào!</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Hãy bắt đầu bằng việc thiết lập khu trọ đầu tiên của bạn.
            </p>
          </div>

          <div className="w-full rounded-xl border bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600">
                BƯỚC 1 / 2
              </span>
              <div className="flex gap-1">
                <div className="h-2 w-8 rounded-full bg-blue-600" />
                <div className="h-2 w-8 rounded-full bg-gray-200" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tên khu trọ/nhà trọ</Label>
                <Input
                  placeholder="VD: Nhà trọ An Bình"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Địa chỉ</Label>
                <Input
                  placeholder="Nhập địa chỉ đầy đủ"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleCreateProperty}
            disabled={loading || !propertyName}
          >
            Tiếp tục →
          </Button>
          <button
            className="text-sm text-muted-foreground"
            onClick={skip}
          >
            Bỏ qua
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Thêm căn phòng đầu tiên</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Hãy bắt đầu bằng việc tạo phòng đầu tiên cho khu trọ của bạn.
            </p>
          </div>

          <div className="w-full rounded-xl border bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600">
                BƯỚC 2 / 2
              </span>
              <div className="flex gap-1">
                <div className="h-2 w-8 rounded-full bg-blue-600" />
                <div className="h-2 w-8 rounded-full bg-blue-600" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>TÊN/SỐ PHÒNG</Label>
                <Input
                  placeholder="VD: Phòng 101, Tầng 1..."
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>GIÁ THUÊ HÀNG THÁNG</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="0"
                    value={rentPrice}
                    onChange={(e) => setRentPrice(e.target.value)}
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    VNĐ
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Giá cơ bản chưa bao gồm điện nước và dịch vụ khác.
                </p>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleCreateRoom}
            disabled={loading}
          >
            Hoàn tất →
          </Button>
          <button
            className="text-sm text-muted-foreground"
            onClick={skip}
          >
            Bỏ qua
          </button>
        </>
      )}
    </div>
  );
}
