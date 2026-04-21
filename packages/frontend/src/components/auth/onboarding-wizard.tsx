'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api';
import { MapPin, Home, Banknote } from 'lucide-react';

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
            <p className="mt-1 text-sm text-gray-500">
              Thiết lập khu trọ đầu tiên của bạn
            </p>
          </div>

          <div className="w-full space-y-3">
            <div className="relative">
              <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tên khu trọ / nhà trọ"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                className="pl-10 rounded-xl border-gray-200 focus-visible:ring-blue-500"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Địa chỉ đầy đủ"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pl-10 rounded-xl border-gray-200 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <Button
            className="w-full rounded-xl bg-blue-600 py-6 text-base font-semibold hover:bg-blue-700 active:scale-[0.98]"
            onClick={handleCreateProperty}
            disabled={loading || !propertyName}
          >
            Tiếp tục →
          </Button>
          <button className="text-sm text-gray-400 hover:text-gray-600" onClick={skip}>
            Bỏ qua
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
            🏠
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Thêm phòng đầu tiên</h1>
            <p className="mt-1 text-sm text-gray-500">
              Tạo phòng đầu tiên cho khu trọ của bạn
            </p>
          </div>

          <div className="w-full space-y-3">
            <div className="relative">
              <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tên / số phòng (VD: Phòng 101)"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="pl-10 rounded-xl border-gray-200 focus-visible:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                placeholder="Giá thuê hàng tháng (VNĐ)"
                value={rentPrice}
                onChange={(e) => setRentPrice(e.target.value)}
                className="pl-10 rounded-xl border-gray-200 focus-visible:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-400 pl-1">
              Giá cơ bản chưa bao gồm điện nước và dịch vụ khác.
            </p>
          </div>

          <Button
            className="w-full rounded-xl bg-blue-600 py-6 text-base font-semibold hover:bg-blue-700 active:scale-[0.98]"
            onClick={handleCreateRoom}
            disabled={loading}
          >
            Hoàn tất →
          </Button>
          <button className="text-sm text-gray-400 hover:text-gray-600" onClick={skip}>
            Bỏ qua
          </button>
        </>
      )}
    </div>
  );
}
