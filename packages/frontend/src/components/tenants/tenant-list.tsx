'use client';

import { useState } from 'react';
import { List, Button, Dialog, Tag } from 'antd-mobile';
import { UserRound } from 'lucide-react';
import { Tenant, useCheckoutTenant } from '@/hooks/use-tenants';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export function TenantList({ tenants, roomId }: { tenants: Tenant[]; roomId: string }) {
  const checkout = useCheckoutTenant(roomId);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const active = tenants.filter((t) => t.status === 'ACTIVE');
  const movedOut = tenants.filter((t) => t.status === 'MOVED_OUT');

  const handleCheckout = async (tenantId: string, name: string) => {
    const confirmed = await Dialog.confirm({
      content: `Xác nhận trả phòng cho ${name}?`,
      confirmText: 'Trả phòng',
      cancelText: 'Huỷ',
    });
    if (!confirmed) return;
    setPendingId(tenantId);
    checkout.mutate(tenantId, { onSettled: () => setPendingId(null) });
  };

  if (active.length === 0 && movedOut.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-gray-400">Chưa có người thuê</div>
    );
  }

  return (
    <div className="space-y-2">
      {active.length > 0 && (
        <List style={{ '--border-top': 'none', '--border-bottom': 'none', '--border-inner': 'none' }}>
          {active.map((tenant) => (
            <List.Item
              key={tenant.id}
              prefix={
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <UserRound className="h-5 w-5 text-blue-600" />
                </div>
              }
              description={
                <span className="text-xs text-gray-400">
                  {tenant.phone && `${tenant.phone} · `}Vào {formatDate(tenant.moveInDate)}
                </span>
              }
              extra={
                <Button
                  size="mini"
                  color="danger"
                  fill="outline"
                  loading={pendingId === tenant.id}
                  onClick={() => handleCheckout(tenant.id, tenant.name)}
                >
                  Trả phòng
                </Button>
              }
              style={{ '--padding-left': '0', '--padding-right': '0' }}
            >
              <span className="font-semibold text-gray-900">{tenant.name}</span>
            </List.Item>
          ))}
        </List>
      )}

      {movedOut.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm text-gray-400 py-1">
            {movedOut.length} người đã trả phòng
          </summary>
          <List className="mt-2" style={{ '--border-top': 'none', '--border-bottom': 'none', '--border-inner': 'none' }}>
            {movedOut.map((tenant) => (
              <List.Item
                key={tenant.id}
                prefix={
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                    <UserRound className="h-4 w-4 text-gray-400" />
                  </div>
                }
                description={
                  <span className="text-xs text-gray-400">
                    {formatDate(tenant.moveInDate)} → {tenant.moveOutDate ? formatDate(tenant.moveOutDate) : '?'}
                  </span>
                }
                extra={<Tag color="default">Đã trả</Tag>}
                style={{ '--padding-left': '0', '--padding-right': '0' }}
              >
                <span className="text-sm text-gray-500">{tenant.name}</span>
              </List.Item>
            ))}
          </List>
        </details>
      )}
    </div>
  );
}
