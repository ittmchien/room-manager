"use client";

import { useCreateContract } from "@/hooks/use-contracts";
import { useRooms } from "@/hooks/use-rooms";
import { useTenants } from "@/hooks/use-tenants";
import { Input, Selector } from "antd-mobile";
import { AppPopup } from "@/components/ui/app-popup";
import { useMemo, useState } from "react";

interface Props {
  propertyId: string;
  trigger: React.ReactNode;
}

const DEPOSIT_OPTIONS = [
  { label: "Chưa cọc", value: "PENDING" },
  { label: "Đã cọc", value: "PAID" },
];

export function ContractFormModal({ propertyId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositStatus, setDepositStatus] = useState<string[]>(["PENDING"]);
  const [terms, setTerms] = useState("");

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
    setRoomId("");
    setTenantId("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setDepositAmount("");
    setDepositStatus(["PENDING"]);
    setTerms("");
  };

  const handleRoomChange = (v: string[]) => {
    setRoomId(v[0] ?? "");
    setTenantId(""); // reset tenant when room changes
  };

  const handleSubmit = () => {
    if (!roomId || !tenantId || !startDate) return;
    createContract.mutate(
      {
        roomId,
        tenantId,
        startDate,
        endDate: endDate || undefined,
        depositAmount: depositAmount ? Number(depositAmount) : 0,
        depositStatus: depositStatus[0] as "PENDING" | "PAID",
        terms: terms || undefined,
      },
      {
        onSuccess: () => {
          reset();
          setOpen(false);
        },
      },
    );
  };

  return (
    <AppPopup
      title="Thêm hợp đồng"
      visible={open}
      trigger={trigger}
      onOpen={() => setOpen(true)}
      onClose={() => { setOpen(false); reset(); }}
      onSubmit={handleSubmit}
      submitLabel="Thêm hợp đồng"
      submitLoading={createContract.isPending}
      submitDisabled={!roomId || !tenantId || !startDate}
      error={createContract.error ? (createContract.error as Error).message : null}
      scrollable
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs text-on-surface-variant">Phòng *</p>
          <Selector options={roomOptions} value={[roomId]} onChange={handleRoomChange} style={{ '--border-radius': '10px', '--checked-color': '#2563EB' } as React.CSSProperties} />
        </div>
        <div>
          <p className="mb-2 text-xs text-on-surface-variant">Người thuê *</p>
          {tenantOptions.length === 0 ? (
            <p className="text-xs text-on-surface-variant italic">
              {roomId ? "Phòng này chưa có người thuê" : "Chọn phòng trước"}
            </p>
          ) : (
            <Selector options={tenantOptions} value={[tenantId]} onChange={(v) => setTenantId(v[0] ?? "")} style={{ '--border-radius': '10px', '--checked-color': '#2563EB' } as React.CSSProperties} />
          )}
        </div>
        <div className="rounded-xl bg-surface-container-low px-3">
          <p className="pt-2.5 text-xs text-on-surface-variant">Ngày bắt đầu *</p>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-transparent py-2.5 text-[15px] outline-none" />
        </div>
        <div className="rounded-xl bg-surface-container-low px-3">
          <p className="pt-2.5 text-xs text-on-surface-variant">Ngày kết thúc</p>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-transparent py-2.5 text-[15px] outline-none" />
        </div>
        <div className="rounded-xl bg-surface-container-low px-3">
          <p className="pt-2.5 text-xs text-on-surface-variant">Tiền cọc (VNĐ)</p>
          <Input type="number" placeholder="0" value={depositAmount} onChange={setDepositAmount} style={{ '--font-size': '15px' } as React.CSSProperties} />
        </div>
        <div>
          <p className="mb-2 text-xs text-on-surface-variant">Trạng thái cọc</p>
          <Selector options={DEPOSIT_OPTIONS} value={depositStatus} onChange={setDepositStatus} style={{ '--border-radius': '10px', '--checked-color': '#2563EB' } as React.CSSProperties} />
        </div>
        <div className="rounded-xl bg-surface-container-low px-3">
          <p className="pt-2.5 text-xs text-on-surface-variant">Điều khoản (tuỳ chọn)</p>
          <Input placeholder="Ghi chú điều khoản..." value={terms} onChange={setTerms} style={{ '--font-size': '15px' } as React.CSSProperties} />
        </div>
      </div>
    </AppPopup>
  );
}
