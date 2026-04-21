'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateTenant } from '@/hooks/use-tenants';
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
  const [moveInDate, setMoveInDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const createTenant = useCreateTenant(roomId);
  const { upload, isUploading, uploadError } = useUploadFile();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await upload(file);
    if (url) setIdCardImageUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !moveInDate) return;

    try {
      await createTenant.mutateAsync({
        name,
        phone: phone || undefined,
        idCard: idCard || undefined,
        idCardImage: idCardImageUrl || undefined,
        moveInDate,
      });
      setName('');
      setPhone('');
      setIdCard('');
      setIdCardImageUrl(null);
      setMoveInDate(new Date().toISOString().split('T')[0]);
      setOpen(false);
    } catch {
      // Error displayed via createTenant.error
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Thêm người thuê</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="space-y-2">
            <Label>Họ và tên</Label>
            <Input
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Số điện thoại</Label>
            <Input
              type="tel"
              placeholder="0901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Số CCCD (tuỳ chọn)</Label>
            <Input
              placeholder="001234567890"
              value={idCard}
              onChange={(e) => setIdCard(e.target.value)}
            />
          </div>

          {/* CCCD image upload */}
          <div className="space-y-2">
            <Label>Ảnh CCCD (tuỳ chọn)</Label>
            {idCardImageUrl ? (
              <div className="relative">
                <Image
                  src={idCardImageUrl}
                  alt="CCCD"
                  width={320}
                  height={180}
                  className="w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => setIdCardImageUrl(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-4 text-gray-400 transition hover:border-blue-300 hover:text-blue-500">
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs font-medium">
                  {isUploading ? 'Đang tải...' : 'Chọn ảnh'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isUploading}
                />
              </label>
            )}
            {uploadError && (
              <p className="text-xs text-red-500">{uploadError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Ngày vào</Label>
            <Input
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              required
            />
          </div>
          {createTenant.error && (
            <p className="text-sm text-red-500">
              {(createTenant.error as Error).message}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={createTenant.isPending || isUploading}
          >
            {createTenant.isPending ? 'Đang thêm...' : 'Thêm người thuê'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
