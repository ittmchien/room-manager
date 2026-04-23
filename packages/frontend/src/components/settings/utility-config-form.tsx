'use client';

import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Input, Toast, Skeleton } from 'antd-mobile';
import { UtilityConfig, TierConfig, useUpsertUtilityConfig } from '@/hooks/use-utility-configs';
import { Plus, Trash2 } from 'lucide-react';
import { SelectorField } from '@/components/ui/selector-field';

const SkeletonParagraph = Skeleton.Paragraph;

const ELECTRIC_OPTIONS = [
  { label: 'Theo số', value: 'FIXED' },
  { label: 'Bậc thang', value: 'TIERED' },
];

const WATER_OPTIONS = [
  { label: 'Theo số', value: 'FIXED' },
  { label: 'Theo người', value: 'PER_PERSON' },
  { label: 'Cố định/phòng', value: 'FIXED_PER_ROOM' },
];

const DEFAULT_TIERS: TierConfig[] = [
  { fromKwh: 0, toKwh: 50, pricePerKwh: 1806 },
  { fromKwh: 51, toKwh: 100, pricePerKwh: 1866 },
  { fromKwh: 101, toKwh: 200, pricePerKwh: 2167 },
  { fromKwh: 201, toKwh: 300, pricePerKwh: 2729 },
  { fromKwh: 301, toKwh: 400, pricePerKwh: 3050 },
  { fromKwh: 401, toKwh: null, pricePerKwh: 3151 },
];

interface Props {
  propertyId: string;
  type: 'ELECTRIC' | 'WATER';
  config?: UtilityConfig;
  label: string;
  unit: string;
  loading?: boolean;
}

export interface UtilityConfigFormHandle {
  save: () => void;
}

export const UtilityConfigForm = forwardRef<UtilityConfigFormHandle, Props>(
  function UtilityConfigFormInner({ propertyId, type, config, label, unit, loading }, ref) {
    const options = type === 'ELECTRIC' ? ELECTRIC_OPTIONS : WATER_OPTIONS;
    const [calcType, setCalcType] = useState(config?.calcType ?? 'FIXED');
    const [unitPrice, setUnitPrice] = useState(config?.unitPrice?.toString() ?? '');
    const [perPersonPrice, setPerPersonPrice] = useState(config?.perPersonPrice?.toString() ?? '');
    const [fixedRoomPrice, setFixedRoomPrice] = useState(config?.fixedRoomPrice?.toString() ?? '');
    const [tiers, setTiers] = useState<TierConfig[]>(
      config?.tiers?.length ? config.tiers : DEFAULT_TIERS,
    );

    const upsert = useUpsertUtilityConfig(propertyId);

    const handleSave = useCallback(() => {
      upsert.mutate(
        {
          type,
          data: {
            calcType,
            unitPrice: calcType === 'FIXED' ? parseInt(unitPrice) || 0 : undefined,
            perPersonPrice: calcType === 'PER_PERSON' ? parseInt(perPersonPrice) || 0 : undefined,
            fixedRoomPrice: calcType === 'FIXED_PER_ROOM' ? parseInt(fixedRoomPrice) || 0 : undefined,
            tiers: calcType === 'TIERED' ? tiers : undefined,
          },
        },
        {
          onSuccess: () => Toast.show({ icon: 'success', content: `Đã lưu ${label}` }),
          onError: () => Toast.show({ icon: 'fail', content: `Lỗi khi lưu ${label}` }),
        },
      );
    }, [type, calcType, unitPrice, perPersonPrice, fixedRoomPrice, tiers, label, upsert]);

    useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave]);

    const updateTierPrice = (index: number, price: string) => {
      setTiers((prev) =>
        prev.map((t, i) => (i === index ? { ...t, pricePerKwh: parseInt(price) || 0 } : t)),
      );
    };

    const updateTierTo = (index: number, value: string) => {
      const to = value === '' ? null : parseInt(value) || 0;
      setTiers((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], toKwh: to };
        if (index + 1 < next.length && to !== null) {
          next[index + 1] = { ...next[index + 1], fromKwh: to + 1 };
        }
        return next;
      });
    };

    const addTier = () => {
      setTiers((prev) => {
        const last = prev[prev.length - 1];
        const lastEnd = last.toKwh ?? last.fromKwh + 99;
        const updated = [...prev];
        updated[prev.length - 1] = { ...last, toKwh: lastEnd };
        return [...updated, { fromKwh: lastEnd + 1, toKwh: null, pricePerKwh: 0 }];
      });
    };

    const removeTier = (index: number) => {
      if (tiers.length <= 1) return;
      setTiers((prev) => {
        const next = prev.filter((_, i) => i !== index);
        next[next.length - 1] = { ...next[next.length - 1], toKwh: null };
        return next;
      });
    };

    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">{label}</p>

        <SelectorField
          label=""
          options={options}
          value={[calcType]}
          onChange={(v) => { if (v.length > 0) setCalcType(v[0]); }}
        />

        {calcType === 'FIXED' && (
          loading ? (
            <div className="rounded-2xl bg-gray-50 px-3 py-3">
              <SkeletonParagraph lineCount={1} animated />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-2xl bg-gray-50 px-3 py-1.5">
                <Input
                  type="number"
                  min={0}
                  placeholder="Đơn giá"
                  value={unitPrice}
                  onChange={setUnitPrice}
                  style={{ '--font-size': '16px' } as React.CSSProperties}
                />
              </div>
              <span className="shrink-0 text-xs text-gray-400">VND/{unit}</span>
            </div>
          )
        )}

        {calcType === 'PER_PERSON' && (
          loading ? (
            <div className="rounded-2xl bg-gray-50 px-3 py-3">
              <SkeletonParagraph lineCount={1} animated />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-2xl bg-gray-50 px-3 py-1.5">
                <Input
                  type="number"
                  min={0}
                  placeholder="Giá/người"
                  value={perPersonPrice}
                  onChange={setPerPersonPrice}
                  style={{ '--font-size': '16px' } as React.CSSProperties}
                />
              </div>
              <span className="shrink-0 text-xs text-gray-400">VND/người</span>
            </div>
          )
        )}

        {calcType === 'FIXED_PER_ROOM' && (
          loading ? (
            <div className="rounded-2xl bg-gray-50 px-3 py-3">
              <SkeletonParagraph lineCount={1} animated />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-2xl bg-gray-50 px-3 py-1.5">
                <Input
                  type="number"
                  min={0}
                  placeholder="Giá/phòng"
                  value={fixedRoomPrice}
                  onChange={setFixedRoomPrice}
                  style={{ '--font-size': '16px' } as React.CSSProperties}
                />
              </div>
              <span className="shrink-0 text-xs text-gray-400">VND/phòng</span>
            </div>
          )
        )}

        {calcType === 'TIERED' && (
          <div className="space-y-1.5">
            <div className="grid grid-cols-[1.5rem_1fr_3.5rem_1.5rem] gap-2 px-1 text-[11px] text-gray-400">
              <span>#</span>
              <span>Giá (đ/kWh)</span>
              <span>Đến kWh</span>
              <span />
            </div>
            {tiers.map((tier, i) => (
              <div key={i} className="grid grid-cols-[1.5rem_1fr_3.5rem_1.5rem] gap-2 items-center">
                <span className="text-center text-xs text-gray-400">{i + 1}</span>
                <div className="rounded-2xl bg-gray-50 px-3 py-1.5">
                  <Input
                    type="number"
                    min={0}
                    placeholder="đ/kWh"
                    value={tier.pricePerKwh ? tier.pricePerKwh.toString() : ''}
                    onChange={(v) => updateTierPrice(i, v)}
                    style={{ '--font-size': '15px' } as React.CSSProperties}
                  />
                </div>
                {i < tiers.length - 1 ? (
                  <div className="rounded-2xl bg-gray-50 px-2 py-1.5">
                    <Input
                      type="number"
                      min={0}
                      value={tier.toKwh?.toString() ?? ''}
                      onChange={(v) => updateTierTo(i, v)}
                      style={{ '--font-size': '14px' } as React.CSSProperties}
                    />
                  </div>
                ) : (
                  <span className="text-center text-sm text-gray-300">∞</span>
                )}
                <button
                  onClick={() => removeTier(i)}
                  disabled={tiers.length <= 1}
                  className="p-0.5 text-red-300 disabled:opacity-30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={addTier}
              className="flex items-center gap-1 pl-1 pt-1 text-xs text-blue-500"
            >
              <Plus className="h-3 w-3" />
              Thêm bậc
            </button>
          </div>
        )}
      </div>
    );
  },
);
