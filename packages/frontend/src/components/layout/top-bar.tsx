'use client';

import { useState } from 'react';
import { Button, Popup, List, NavBar } from 'antd-mobile';
import { Bell, ChevronDown, Check } from 'lucide-react';
import { useProperties } from '@/hooks/use-properties';
import { useProperty } from '@/contexts/property-context';

export function TopBar() {
  const { data: properties } = useProperties();
  const { propertyId, setPropertyId } = useProperty();
  const [selectorOpen, setSelectorOpen] = useState(false);

  const currentProperty = properties?.find((p) => p.id === propertyId);
  const propertyName = currentProperty?.name ?? (properties?.[0]?.name ?? '...');

  return (
    <>
      <NavBar
        back={null}
        right={
          <button className="relative p-1">
            <Bell className="h-5 w-5 text-gray-500" />
            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
        }
        className="bg-white border-b border-gray-100"
        style={{ '--height': '56px' } as React.CSSProperties}
      >
        <button
          onClick={() => properties && properties.length > 1 && setSelectorOpen(true)}
          className="flex flex-col items-center leading-tight"
        >
          <span className="text-[10px] font-medium text-gray-400">Chi nhánh hiện tại</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-gray-900 max-w-[160px] truncate">
              {propertyName}
            </span>
            {properties && properties.length > 1 && (
              <ChevronDown className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
            )}
          </div>
        </button>
      </NavBar>

      {/* Property selector popup */}
      <Popup
        visible={selectorOpen}
        onMaskClick={() => setSelectorOpen(false)}
        position="bottom"
        bodyStyle={{ borderRadius: '16px 16px 0 0' }}
      >
        <div className="px-4 pb-8 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Chọn chi nhánh</h3>
            <Button fill="none" size="small" onClick={() => setSelectorOpen(false)} className="!text-gray-400">Đóng</Button>
          </div>
          <List>
            {properties?.map((property) => (
              <List.Item
                key={property.id}
                onClick={() => {
                  setPropertyId(property.id);
                  setSelectorOpen(false);
                }}
                extra={
                  propertyId === property.id ? (
                    <Check className="h-4 w-4 text-blue-600" />
                  ) : null
                }
                description={`${property._count.rooms} phòng${property.address ? ' · ' + property.address : ''}`}
              >
                <span className={propertyId === property.id ? 'font-semibold text-blue-600' : ''}>
                  {property.name}
                </span>
              </List.Item>
            ))}
          </List>
        </div>
      </Popup>
    </>
  );
}
