'use client';

import { useState } from 'react';
import { Button, Input } from 'antd-mobile';
import { useCreateTenant } from '@/hooks/use-tenants';
import { AppPopup } from '@/components/ui/app-popup';
import { useUploadFile } from '@/hooks/use-upload';
import { ImagePlus, X } from 'lucide-react';
import Image from 'next/image';

interface TenantFormModalProps {
  roomId: string;
  trigger: React.ReactNode;
}

export function TenantFormModal({ roomId, trigger }: TenantFormModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState('');
  const [idCardImageUrl, setIdCardImageUrl] = useState<string | null>(null);
  const [moveInDate, setMoveInDate] = useState(new Date().toISOString().split('T')[0]);
  const createTenant = useCreateTenant(roomId);
  const { upload, isUploading, uploadError, resetError } = useUploadFile();

  const reset = () => {
    setName(''); setPhone(''); setIdCard('');
    setIdCardImageUrl(null);
    setMoveInDate(new Date().toISOString().split('T')[0]);
    resetError();
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    setOpen(next);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 10 * 1024 * 1024) return;
    const url = await upload(file);
    if (url) setIdCardImageUrl(url);
    else e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!name || !moveInDate) return;
    try {
      await createTenant.mutateAsync({
        name,
        phone: phone || undefined,
        idCard: idCard || undefined,
        idCardImage: idCardImageUrl || undefined,
        moveInDate,
      });
      reset();
      setOpen(false);
    } catch {}
  };

  return (
    <AppPopup
      title="Thêm người thuê"
      visible={open}
      trigger={trigger}
      onOpen={() => handleOpenChange(true)}
      onClose={() => handleOpenChange(false)}
      onSubmit={handleSubmit}
      submitLabel="Thêm người thuê"
      submitLoading={createTenant.isPending || isUploading}
      submitDisabled={!name}
      error={createTenant.error ? (createTenant.error as Error).message : null}
      scrollable
    >
      <div className="space-y-4">
        <div className="rounded-xl bg-gray-50 px-3">
          <p className="pt-2.5 text-xs text-gray-400">Họ và tên *</p>
          <Input placeholder="Nguyễn Văn A" value={name} onChange={setName} style={{ '--font-size': '15px' } as React.CSSProperties} />
        </div>
        <div className="rounded-xl bg-gray-50 px-3">
          <p className="pt-2.5 text-xs text-gray-400">Số điện thoại</p>
          <Input type="tel" placeholder="0901234567" value={phone} onChange={setPhone} style={{ '--font-size': '15px' } as React.CSSProperties} />
        </div>
        <div className="rounded-xl bg-gray-50 px-3">
          <p className="pt-2.5 text-xs text-gray-400">Số CCCD (tuỳ chọn)</p>
          <Input placeholder="001234567890" value={idCard} onChange={setIdCard} style={{ '--font-size': '15px' } as React.CSSProperties} />
        </div>
        <div>
          <p className="mb-2 text-xs text-gray-400">Ảnh CCCD (tuỳ chọn)</p>
          {idCardImageUrl ? (
            <div className="relative">
              <Image src={idCardImageUrl} alt="CCCD" width={320} height={180} className="w-full rounded-xl object-cover" />
              <Button type="button" fill="none" onClick={() => setIdCardImageUrl(null)}
                className="absolute right-2 top-2 !bg-black/50 !rounded-full !p-1 !text-white !min-w-0 !h-auto">
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-4 text-gray-400 hover:border-blue-300">
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs font-medium">{isUploading ? 'Đang tải...' : 'Chọn ảnh'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={isUploading} />
            </label>
          )}
          {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
        </div>
        <div className="rounded-xl bg-gray-50 px-3">
          <p className="pt-2.5 text-xs text-gray-400">Ngày vào *</p>
          <input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} className="w-full bg-transparent py-2.5 text-[15px] outline-none" />
        </div>
      </div>
    </AppPopup>
  );
}
