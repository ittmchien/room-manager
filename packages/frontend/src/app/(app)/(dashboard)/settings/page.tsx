'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Dialog, Input } from 'antd-mobile';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import { useProperty } from '@/contexts/property-context';
import { useUtilityConfigs } from '@/hooks/use-utility-configs';
import { useServiceFees } from '@/hooks/use-service-fees';
import { useAuth } from '@/hooks/use-auth';
import { createBrowserClient } from '@/lib/supabase/client';
import { UtilityConfigForm, UtilityConfigFormHandle } from '@/components/settings/utility-config-form';
import { ServiceFeeList } from '@/components/settings/service-fee-list';
import { AppPopup } from '@/components/ui/app-popup';

function AccountSection() {
  const { signOut, changePassword, loading, error } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [pwOpen, setPwOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const handleChangePassword = async () => {
    const ok = await changePassword(newPassword);
    if (ok) {
      setPwOpen(false);
      setNewPassword('');
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-gray-50 pb-2 mb-3">
        <h2 className="text-sm font-semibold text-gray-700">Tài khoản</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {email && (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm font-medium text-gray-800">{email}</span>
          </div>
        )}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-gray-700">Mật khẩu</span>
          <div className="flex items-center gap-3">
            <span className="text-gray-300 tracking-widest text-base">••••••••</span>
            <Button color="primary" fill="outline" onClick={() => setPwOpen(true)}>
              Thay đổi
            </Button>
          </div>
        </div>
      </div>

      <AppPopup
        title="Đổi mật khẩu"
        visible={pwOpen}
        onClose={() => { setPwOpen(false); setNewPassword(''); }}
        onSubmit={handleChangePassword}
        submitLabel="Đổi mật khẩu"
        submitLoading={loading}
        submitDisabled={newPassword.length < 6}
        error={error}
      >
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Mật khẩu mới</label>
          <Input
            placeholder="Tối thiểu 6 ký tự"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            className="rounded-2xl border border-gray-200 px-3 py-2"
          />
        </div>
      </AppPopup>
    </Card>
  );
}

export default function SettingsPage() {
  const { propertyId } = useProperty();
  const { signOut } = useAuth();

  const electricRef = useRef<UtilityConfigFormHandle>(null);
  const waterRef = useRef<UtilityConfigFormHandle>(null);

  const { data: utilityConfigs, isPending: loadingConfigs } = useUtilityConfigs(propertyId);
  const { data: serviceFees, isPending: loadingFees } = useServiceFees(propertyId);

  const electricConfig = utilityConfigs?.find((c) => c.type === 'ELECTRIC');
  const waterConfig = utilityConfigs?.find((c) => c.type === 'WATER');

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Cài đặt</h1>

      {!propertyId ? (
        <Card className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <Building2 className="h-7 w-7 text-blue-400" />
          </div>
          <p className="mt-4 font-medium text-gray-700">Chưa có khu trọ</p>
        </Card>
      ) : (
        <>
          <Card bodyClassName="space-y-4">
            <div className="border-b border-gray-50 pb-1">
              <h2 className="text-sm font-semibold text-gray-700">Giá điện nước</h2>
              <p className="text-xs text-gray-400 mt-0.5">Áp dụng khi tính hóa đơn hàng tháng</p>
            </div>
            <UtilityConfigForm
              key={electricConfig?.id ?? 'electric'}
              ref={electricRef}
              propertyId={propertyId}
              type="ELECTRIC"
              config={electricConfig}
              label="Điện"
              unit="kWh"
              loading={loadingConfigs}
            />
            <div className="border-t border-gray-100 pt-1">
              <UtilityConfigForm
                key={waterConfig?.id ?? 'water'}
                ref={waterRef}
                propertyId={propertyId}
                type="WATER"
                config={waterConfig}
                label="Nước"
                unit="m³"
                loading={loadingConfigs}
              />
            </div>
            <Button
              block
              color="primary"
              fill="solid"
              disabled={loadingConfigs}
              onClick={() => {
                electricRef.current?.save();
                waterRef.current?.save();
              }}
            >
              Lưu cấu hình điện nước
            </Button>
          </Card>

          <Card bodyClassName="space-y-4">
            <div className="border-b border-gray-50 pb-1">
              <h2 className="text-sm font-semibold text-gray-700">Phí dịch vụ</h2>
              <p className="text-xs text-gray-400 mt-0.5">Phí cố định tính thêm vào hóa đơn</p>
            </div>
            <ServiceFeeList propertyId={propertyId} fees={serviceFees ?? []} />
          </Card>
        </>
      )}

      <AccountSection />

      <Button
        block
        color="danger"
        fill="solid"
        onClick={async () => {
          const confirmed = await Dialog.confirm({
            content: 'Bạn có chắc muốn đăng xuất?',
            confirmText: 'Đăng xuất',
            cancelText: 'Huỷ',
          });
          if (confirmed) signOut();
        }}
      >
        Đăng xuất
      </Button>
    </div>
  );
}
