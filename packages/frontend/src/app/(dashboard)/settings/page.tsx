'use client';

import { Skeleton } from 'antd-mobile';
import { useProperty } from '@/contexts/property-context';
import { useUtilityConfigs } from '@/hooks/use-utility-configs';
import { useServiceFees } from '@/hooks/use-service-fees';
import { UtilityConfigForm } from '@/components/settings/utility-config-form';
import { ServiceFeeList } from '@/components/settings/service-fee-list';

export default function SettingsPage() {
  const { propertyId } = useProperty();

  const { data: utilityConfigs, isLoading: loadingConfigs } = useUtilityConfigs(propertyId);
  const { data: serviceFees, isLoading: loadingFees } = useServiceFees(propertyId);

  const electricConfig = utilityConfigs?.find((c) => c.type === 'ELECTRIC');
  const waterConfig = utilityConfigs?.find((c) => c.type === 'WATER');

  if (!propertyId) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-4xl">🏘️</p>
        <p className="mt-3 font-medium">Chưa có khu trọ</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Cài đặt</h1>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm shadow-blue-100/30">
        <div className="border-b border-gray-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-700">Giá điện nước</h2>
          <p className="text-xs text-gray-400 mt-0.5">Áp dụng khi tính hóa đơn hàng tháng</p>
        </div>
        <div className="p-4">
          {loadingConfigs ? (
            <Skeleton.Paragraph lineCount={2} animated />
          ) : (
            <div className="space-y-4">
              <UtilityConfigForm propertyId={propertyId} type="ELECTRIC" config={electricConfig} label="Điện (VND/kWh)" />
              <UtilityConfigForm propertyId={propertyId} type="WATER" config={waterConfig} label="Nước (VND/m³)" />
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm shadow-blue-100/30">
        <div className="border-b border-gray-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-700">Phí dịch vụ</h2>
          <p className="text-xs text-gray-400 mt-0.5">Phí cố định tính thêm vào hóa đơn</p>
        </div>
        <div className="p-4">
          {loadingFees ? (
            <Skeleton.Paragraph lineCount={2} animated />
          ) : (
            <ServiceFeeList propertyId={propertyId} fees={serviceFees ?? []} />
          )}
        </div>
      </div>
    </div>
  );
}
