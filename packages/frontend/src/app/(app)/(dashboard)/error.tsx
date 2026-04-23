'use client';

import { ErrorBlock, Button } from 'antd-mobile';

export default function DashboardError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
      <ErrorBlock status="default" title="Đã xảy ra lỗi" description="Vui lòng thử lại." />
      <Button color="primary" size="small" onClick={reset}>
        Thử lại
      </Button>
    </div>
  );
}
