"use client";

import { useCreateContract } from "@/hooks/use-contracts";
import { useRooms } from "@/hooks/use-rooms";
import { useTenants } from "@/hooks/use-tenants";
import { AppPopup } from "@/components/ui/app-popup";
import { FormInput, FormDateInput } from "@/components/ui/form-field";
import { SelectorField } from "@/components/ui/selector-field";
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
    setTenantId("");
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
        <SelectorField label="Phòng *" options={roomOptions} value={[roomId]} onChange={handleRoomChange} />
        <div>
          <p className="mb-2 text-xs text-gray-400">Người thuê *</p>
          {tenantOptions.length === 0 ? (
            <p className="text-xs text-gray-400 italic">
              {roomId ? "Phòng này chưa có người thuê" : "Chọn phòng trước"}
            </p>
          ) : (
            <SelectorField label="" options={tenantOptions} value={[tenantId]} onChange={(v) => setTenantId(v[0] ?? "")} />
          )}
        </div>
        <FormDateInput label="Ngày bắt đầu *" value={startDate} onChange={setStartDate} />
        <FormDateInput label="Ngày kết thúc" value={endDate} onChange={setEndDate} />
        <FormInput label="Tiền cọc (VNĐ)" type="number" placeholder="0" value={depositAmount} onChange={setDepositAmount} />
        <SelectorField label="Trạng thái cọc" options={DEPOSIT_OPTIONS} value={depositStatus} onChange={setDepositStatus} />
        <FormInput label="Điều khoản (tuỳ chọn)" placeholder="Ghi chú điều khoản..." value={terms} onChange={setTerms} />
      </div>
    </AppPopup>
  );
}
