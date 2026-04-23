'use client';

import { ErrorBlock } from 'antd-mobile';
import { Button } from 'antd-mobile';

export default function GlobalError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface-container-lowest">
      <ErrorBlock status="default" title="Đã xảy ra lỗi" description="Vui lòng thử lại." />
      <Button color="primary" size="small" onClick={reset}>
        Thử lại
      </Button>
    </div>
  );
}
