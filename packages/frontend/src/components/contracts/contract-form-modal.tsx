'use client';

import { useState, useMemo } from 'react';
import { Popup, Button, Input, Selector } from 'antd-mobile';
import { useCreateContract } from '@/hooks/use-contracts';
import { useRooms } from '@/hooks/use-rooms';
import { useTenants } from '@/hooks/use-tenants';

interface Props {
  propertyId: string;
  trigger: React.ReactNode;
}

const DEPOSIT_OPTIONS = [
  { label: 'Chưa cọc', value: 'PENDING' },
  { label: 'Đã cọc', value: 'PAID' },
];

export function ContractFormModal({ propertyId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositStatus, setDepositStatus] = useState<string[]>(['PENDING']);
  const [terms, setTerms] = useState('');

  const { data: rooms } = useRooms(propertyId);
  const { data: tenants } = useTenants(roomId);

  const roomOptions = useMemo(
    () => (rooms ?? []).map((r) => ({ label: r.name, value: r.id })),
    [rooms],
  );

  const tenantOptions = useMemo(
    () => (tenants ?? []).map((t) => ({ label: t.name, value: t.id })),
    [tenants],
  );

  const createContract = useCreateContract();

  const reset = () => {
    setRoomId('');
    setTenantId('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setDepositAmount('');
    setDepositStatus(['PENDING']);
    setTerms('');
  };

  const handleRoomChange = (v: string[]) => {
    setRoomId(v[0] ?? '');
    setTenantId(''); // reset tenant when room changes
  };

  const handleSubmit = () => {
    if (!roomId || !tenantId || !startDate) return;
    createContract.mutate({
      roomId,
      tenantId,
      startDate,
      endDate: endDate || undefined,
      depositAmount: depositAmount ? Number(depositAmount) : 0,
      depositStatus: depositStatus[0] as 'PENDING' | 'PAID',
      terms: terms || undefined,
    }, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <Popup
        visible={open}
        onMaskClick={() => { setOpen(false); reset(); }}
        position="bottom"
        bodyStyle={{ borderRadius: '16px 16px 0 0' }}
      >
        <div className="max-h-[85vh] overflow-y-auto p-4 pb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Thêm hợp đồng</h3>
            <Button
              fill="none"
              size="small"
              onClick={() => { setOpen(false); reset(); }}
              className="!text-gray-400"
            >
              Đóng
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs text-gray-400">Phòng *</p>
              <Selector
                options={roomOptions}
                value={[roomId]}
                onChange={handleRoomChange}
                className="[--border-radius:10px] [--checked-color:#2563EB]"
              />
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-400">Người thuê *</p>
              {tenantOptions.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  {roomId ? 'Phòng này chưa có người thuê' : 'Chọn phòng trước'}
                </p>
              ) : (
                <Selector
                  options={tenantOptions}
                  value={[tenantId]}
                  onChange={(v) => setTenantId(v[0] ?? '')}
                  className="[--border-radius:10px] [--checked-color:#2563EB]"
                />
              )}
            </div>

            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Ngày bắt đầu *</p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-transparent py-2.5 text-[15px] outline-none"
              />
            </div>

            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Ngày kết thúc</p>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-transparent py-2.5 text-[15px] outline-none"
              />
            </div>

            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Tiền cọc (VNĐ)</p>
              <Input
                type="number"
                placeholder="0"
                value={depositAmount}
                onChange={setDepositAmount}
                className="[--font-size:15px]"
              />
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-400">Trạng thái cọc</p>
              <Selector
                options={DEPOSIT_OPTIONS}
                value={depositStatus}
                onChange={setDepositStatus}
                className="[--border-radius:10px] [--checked-color:#2563EB]"
              />
            </div>

            <div className="rounded-xl bg-gray-50 px-3">
              <p className="pt-2.5 text-xs text-gray-400">Điều khoản (tuỳ chọn)</p>
              <Input
                placeholder="Ghi chú điều khoản..."
                value={terms}
                onChange={setTerms}
                className="[--font-size:15px]"
              />
            </div>
          </div>

          {createContract.error && (
            <p className="mt-3 text-sm text-red-500">
              {(createContract.error as Error).message}
            </p>
          )}

          <Button
            block
            color="primary"
            size="large"
            className="mt-5 !rounded-xl"
            loading={createContract.isPending}
            disabled={!roomId || !tenantId || !startDate}
            onClick={handleSubmit}
          >
            Thêm hợp đồng
          </Button>
        </div>
      </Popup>
    </>
  );
}
