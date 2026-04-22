"use client";

import { ServiceFee, useDeleteServiceFee } from "@/hooks/use-service-fees";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Dialog, List, Space } from "antd-mobile";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ServiceFeeFormModal } from "./service-fee-form-modal";

const CALC_LABEL: Record<string, string> = {
  FIXED_PER_ROOM: "Cố định/phòng",
  PER_PERSON: "Theo người",
  PER_QUANTITY: "Theo số lượng",
};

interface Props {
  propertyId: string;
  fees: ServiceFee[];
}

export function ServiceFeeList({ propertyId, fees }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteFee = useDeleteServiceFee(propertyId);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await Dialog.confirm({
      content: `Xoá phí "${name}"?`,
      confirmText: "Xoá",
      cancelText: "Huỷ",
    });
    if (!confirmed) return;
    setDeletingId(id);
    deleteFee.mutate(id, { onSettled: () => setDeletingId(null) });
  };

  return (
    <div className="space-y-1">
      {fees.length > 0 && (
        <List style={{ "--border-top": "none", "--border-bottom": "none" }}>
          {fees.map((fee) => (
            <List.Item
              key={fee.id}
              description={`${CALC_LABEL[fee.calcType]} · ${fee.unitPrice.toLocaleString("vi-VN")}đ`}
              extra={
                <Button
                  fill="none"
                  onClick={() => handleDelete(fee.id, fee.name)}
                  disabled={deletingId === fee.id}
                  className="!text-red-400 !p-1 !min-w-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            >
              {fee.name}
            </List.Item>
          ))}
        </List>
      )}

      <ServiceFeeFormModal
        propertyId={propertyId}
        trigger={
          <Button
            block
            size="small"
            fill="outline"
            className="rounded-xl! mt-2"
          >
            <Space>
              <PlusOutlined className="h-4 w-4" />
              Thêm phí dịch vụ
            </Space>
          </Button>
        }
      />
    </div>
  );
}
