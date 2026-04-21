'use client';

import { useProperties } from '@/hooks/use-properties';
import { useUtilityConfigs } from '@/hooks/use-utility-configs';
import { useServiceFees } from '@/hooks/use-service-fees';
import { UtilityConfigForm } from '@/components/settings/utility-config-form';
import { ServiceFeeList } from '@/components/settings/service-fee-list';

export default function SettingsPage() {
  const { data: properties } = useProperties();
  const propertyId = properties?.[0]?.id ?? '';

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
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Cài đặt</h1>

      <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
        <h2 className="font-semibold">Giá điện nước</h2>
        {loadingConfigs ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />)}
          </div>
        ) : (
          <div className="space-y-4">
            <UtilityConfigForm propertyId={propertyId} type="ELECTRIC" config={electricConfig} label="Điện (VND/kWh)" />
            <UtilityConfigForm propertyId={propertyId} type="WATER" config={waterConfig} label="Nước (VND/m³)" />
          </div>
        )}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
        <h2 className="font-semibold">Phí dịch vụ</h2>
        {loadingFees ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded bg-gray-100" />)}
          </div>
        ) : (
          <ServiceFeeList propertyId={propertyId} fees={serviceFees ?? []} />
        )}
      </div>
    </div>
  );
}
