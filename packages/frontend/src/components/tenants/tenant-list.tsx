'use client';

import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { Tenant, useCheckoutTenant } from '@/hooks/use-tenants';
import { Button } from '@/components/ui/button';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export function TenantList({ tenants, roomId }: { tenants: Tenant[]; roomId: string }) {
  const checkout = useCheckoutTenant(roomId);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const active = tenants.filter((t) => t.status === 'ACTIVE');
  const movedOut = tenants.filter((t) => t.status === 'MOVED_OUT');

  const handleCheckout = (tenantId: string) => {
    setPendingId(tenantId);
    checkout.mutate(tenantId, { onSettled: () => setPendingId(null) });
  };

  return (
    <div className="space-y-3">
      {active.length === 0 && movedOut.length === 0 && (
        <div className="py-4 text-center text-sm text-gray-500">
          Chưa có người thuê
        </div>
      )}

      {active.map((tenant) => (
        <div
          key={tenant.id}
          className="flex items-start justify-between rounded-xl bg-white p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
              <UserRound className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">{tenant.name}</p>
              {tenant.phone && (
                <p className="text-sm text-gray-500">{tenant.phone}</p>
              )}
              <p className="text-xs text-gray-400">
                Vào {formatDate(tenant.moveInDate)}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => handleCheckout(tenant.id)}
            disabled={pendingId === tenant.id}
          >
            {pendingId === tenant.id ? 'Đang xử lý...' : 'Trả phòng'}
          </Button>
        </div>
      ))}

      {movedOut.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-400">
            {movedOut.length} người đã trả phòng
          </summary>
          <div className="mt-2 space-y-2">
            {movedOut.map((tenant) => (
              <div
                key={tenant.id}
                className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                  <UserRound className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{tenant.name}</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(tenant.moveInDate)} → {tenant.moveOutDate ? formatDate(tenant.moveOutDate) : '?'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
