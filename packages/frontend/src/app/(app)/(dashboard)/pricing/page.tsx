'use client';

import { useRouter } from 'next/navigation';
import { Card } from 'antd-mobile';
import { Button } from '@/components/ui/button';
import { Crown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Miễn phí',
    price: '0đ',
    period: '/tháng',
    color: 'bg-gray-50 border-gray-200',
    badge: null,
    features: [
      '1 khu trọ',
      'Tối đa 10 phòng',
      'Quản lý hóa đơn',
      'Ghi chỉ số điện nước',
    ],
    disabled: true,
    buttonLabel: 'Gói hiện tại',
  },
  {
    name: 'Pro',
    price: '199.000đ',
    period: '/tháng',
    color: 'bg-blue-50 border-blue-300',
    badge: 'Phổ biến',
    features: [
      'Không giới hạn khu trọ',
      'Không giới hạn phòng',
      'Hợp đồng thuê',
      'Quản lý người thuê',
      'Thu/Chi & báo cáo',
      'Thông báo tự động',
    ],
    disabled: false,
    buttonLabel: 'Nâng cấp Pro',
  },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-50 px-0 py-3">
        <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
          ←
        </button>
        <h1 className="text-lg font-bold text-gray-900">Nâng cấp tài khoản</h1>
      </div>

      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
          <Crown className="h-7 w-7 text-amber-500" />
        </div>
        <p className="text-sm text-gray-500">Chọn gói phù hợp với nhu cầu của bạn</p>
      </div>

      <div className="space-y-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(plan.color, 'border-[1.5px]')}
            style={{ '--border-radius': '16px' } as React.CSSProperties}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                    {plan.badge && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-sm text-gray-400">{plan.period}</span>
                  </div>
                </div>
              </div>

              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                block
                color={plan.disabled ? 'default' : 'primary'}
                fill={plan.disabled ? 'outline' : 'solid'}
                disabled={plan.disabled}
                className="!font-semibold"
                onClick={() => {
                  if (!plan.disabled) {
                    // TODO: integrate payment gateway
                  }
                }}
              >
                {plan.buttonLabel}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 pb-4">
        Thanh toán an toàn · Hủy bất kỳ lúc nào
      </p>
    </div>
  );
}
