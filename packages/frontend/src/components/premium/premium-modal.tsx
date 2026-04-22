'use client';

import { Popup, Button } from 'antd-mobile';
import { useRouter } from 'next/navigation';
import { Crown } from 'lucide-react';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function PremiumModal({ visible, onClose }: Props) {
  const router = useRouter();

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{ borderRadius: '16px 16px 0 0' }}
    >
      <div className="flex flex-col items-center gap-4 px-6 pb-10 pt-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
          <Crown className="h-7 w-7 text-amber-500" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900">Tính năng cao cấp</h3>
          <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
            Chức năng này chỉ dành cho tài khoản Pro.<br />
            Nâng cấp để mở khóa toàn bộ tính năng quản lý trọ.
          </p>
        </div>

        <div className="mt-1 flex w-full flex-col gap-2">
          <Button
            block
            color="primary"
            size="large"
            onClick={() => {
              onClose();
              router.push('/pricing');
            }}
            className="!rounded-xl !font-semibold"
          >
            Xem các gói nâng cấp
          </Button>
          <Button
            block
            fill="none"
            size="large"
            onClick={onClose}
            className="!text-gray-400"
          >
            Bỏ qua
          </Button>
        </div>
      </div>
    </Popup>
  );
}
