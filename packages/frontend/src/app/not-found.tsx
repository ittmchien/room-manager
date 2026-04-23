"use client";

import { ErrorBlock } from "antd-mobile";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-white">
      <ErrorBlock
        status="empty"
        title="Không tìm thấy trang"
        description="Trang bạn truy cập không tồn tại."
      />
    </div>
  );
}
