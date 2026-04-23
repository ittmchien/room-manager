'use client';

import { useRouter } from 'next/navigation';
import { Dialog, Button } from 'antd-mobile';
import { Crown } from 'lucide-react';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function PremiumModal({ visible, onClose }: Props) {
  const router = useRouter();

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      closeOnMaskClick
      content={
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
            <Crown className="h-7 w-7 text-amber-500" />
          </div>
          <div>
            <p className="mb-1 font-semibold text-gray-900">Tính năng trả phí</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Tính năng này cần mua thêm gói bổ sung.<br />
              Xem các gói để kích hoạt cho tài khoản của bạn.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 mt-1">
            <Button
              block
              color="primary"
              size="large"
              onClick={() => { onClose(); router.push('/pricing'); }}
              className="!font-semibold"
            >
              Xem gói bổ sung
            </Button>
            <Button block fill="none" size="large" onClick={onClose} className="!text-gray-400">
              Bỏ qua
            </Button>
          </div>
        </div>
      }
    />
  );
}
