"use client";

import { ServiceFee, useDeleteServiceFee } from "@/hooks/use-service-fees";
import { PlusOutlined } from "@ant-design/icons";
import { Dialog, List, Space } from "antd-mobile";
import { Button } from "@/components/ui/button";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ServiceFeeFormModal } from "./service-fee-form-modal";

const ListItem = List.Item;

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
        <List className="no-border">
          {fees.map((fee) => (
            <ListItem
              key={fee.id}
              description={`${CALC_LABEL[fee.calcType]} · ${fee.unitPrice.toLocaleString("vi-VN")}đ`}
              extra={
                <Button
                  fill="none"
                  onClick={() => handleDelete(fee.id, fee.name)}
                  disabled={deletingId === fee.id}
                  className="!text-red-400 !p-2 !min-w-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            >
              {fee.name}
            </ListItem>
          ))}
        </List>
      )}

      <ServiceFeeFormModal
        propertyId={propertyId}
        trigger={
          <Button
            block
            color="primary"
            fill="solid"
            className="mt-2"
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
