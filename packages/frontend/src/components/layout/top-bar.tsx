'use client';

import { useState } from 'react';
import { Bell, ChevronDown, Check, Plus } from 'lucide-react';
import { Popup, Button, Input } from 'antd-mobile';
import { useProperties, useCreateProperty } from '@/hooks/use-properties';
import { useProperty } from '@/contexts/property-context';
import { useSubscription } from '@/hooks/use-subscription';
import { PremiumModal } from '@/components/premium/premium-modal';
import { AppPopup } from '@/components/ui/app-popup';
import { cn } from '@/lib/utils';

export function TopBar() {
  const { data: properties } = useProperties();
  const { propertyId, setPropertyId } = useProperty();
  const { canMultiProperty } = useSubscription();
  const createProperty = useCreateProperty();

  const [selectorOpen, setSelectorOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const currentProperty = properties?.find((p) => p.id === propertyId);
  const propertyName = currentProperty?.name ?? properties?.[0]?.name ?? '...';

  const handleAddProperty = () => {
    setSelectorOpen(false);
    if (canMultiProperty) {
      setAddOpen(true);
    } else {
      setPremiumOpen(true);
    }
  };

  const handleSubmitProperty = () => {
    if (!newName.trim()) return;
    createProperty.mutate(
      { name: newName.trim(), address: newAddress.trim() || undefined },
      {
        onSuccess: (property) => {
          setPropertyId(property.id);
          setAddOpen(false);
          setNewName('');
          setNewAddress('');
        },
      }
    );
  };

  return (
    <>
      {/* TopBar */}
      <div className="flex h-14 items-center justify-between bg-surface-container-lowest border-b border-outline-variant/15 px-4">
        {/* Branch selector trigger */}
        <button
          onClick={() => setSelectorOpen(true)}
          className="flex flex-col items-start leading-tight min-w-0"
        >
          <span className="font-label text-xs font-medium text-on-surface-variant">Chi nhánh hiện tại</span>
          <div className="flex items-center gap-1">
            <span className="font-headline text-sm font-bold text-on-surface max-w-[220px] truncate">
              {propertyName}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-primary shrink-0" />
          </div>
        </button>

        {/* TODO: implement in-app notification inbox before re-enabling */}
        {/* <button className="relative p-1">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button> */}
      </div>

      {/* Branch selector popup */}
      <Popup
        visible={selectorOpen}
        onMaskClick={() => setSelectorOpen(false)}
        position="bottom"
        bodyClassName="rounded-t-2xl"
      >
        <div className="px-4 pb-8 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-on-surface">Chọn chi nhánh</h3>
            <Button fill="none" size="mini" onClick={() => setSelectorOpen(false)} className="!text-on-surface-variant">
              Đóng
            </Button>
          </div>

          <div className="divide-y divide-outline-variant/15">
            {properties?.map((property) => (
              <button
                key={property.id}
                onClick={() => { setPropertyId(property.id); setSelectorOpen(false); }}
                className="flex w-full items-center justify-between py-3 text-left"
              >
                <div className="min-w-0">
                  <p className={cn('text-sm font-medium truncate', propertyId === property.id ? 'text-primary' : 'text-on-surface')}>
                    {property.name}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {property._count.rooms} phòng{property.address ? ` · ${property.address}` : ''}
                  </p>
                </div>
                {propertyId === property.id && (
                  <Check className="h-4 w-4 text-primary shrink-0 ml-3" />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleAddProperty}
            className="mt-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-outline-variant/30 px-4 py-3 text-sm font-medium text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm chi nhánh
          </button>
        </div>
      </Popup>

      {/* Add property popup */}
      <AppPopup
        title="Thêm chi nhánh"
        visible={addOpen}
        onClose={() => { setAddOpen(false); setNewName(''); setNewAddress(''); }}
        onSubmit={handleSubmitProperty}
        submitLabel="Tạo chi nhánh"
        submitLoading={createProperty.isPending}
        submitDisabled={!newName.trim()}
        error={createProperty.error ? String(createProperty.error) : null}
      >
        <div className="space-y-3">
          <div className="rounded-xl bg-surface-container-low px-3">
            <p className="pt-2.5 text-xs text-on-surface-variant">Tên khu trọ / nhà trọ</p>
            <Input placeholder="VD: Nhà trọ Số 5" value={newName} onChange={setNewName} />
          </div>
          <div className="rounded-xl bg-surface-container-low px-3">
            <p className="pt-2.5 text-xs text-on-surface-variant">Địa chỉ (tuỳ chọn)</p>
            <Input placeholder="VD: 123 Nguyễn Văn A, Q.1" value={newAddress} onChange={setNewAddress} />
          </div>
        </div>
      </AppPopup>

      {/* Premium upgrade dialog */}
      <PremiumModal visible={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </>
  );
}
