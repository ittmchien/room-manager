"use client";

import type { PopupProps } from "antd-mobile";
import { Button, Popup } from "antd-mobile";
import { cn } from "@/lib/utils";

interface AppPopupProps extends Omit<
  PopupProps,
  "position" | "bodyStyle" | "onMaskClick"
> {
  title: string;
  children: React.ReactNode;
  /** Called on mask click or close button click */
  onClose: () => void;
  /** If provided, wraps in a clickable div that calls onOpen */
  trigger?: React.ReactNode;
  onOpen?: () => void;
  /** If provided, shows submit button at bottom */
  onSubmit?: () => void;
  submitLabel?: string;
  submitLoading?: boolean;
  submitDisabled?: boolean;
  /** Error message shown above submit button */
  error?: string | null;
  /** Adds max-h-[85vh] overflow-y-auto to content wrapper */
  scrollable?: boolean;
}

export function AppPopup({
  title,
  children,
  onClose,
  trigger,
  onOpen,
  onSubmit,
  submitLabel = "Lưu",
  submitLoading,
  submitDisabled,
  error,
  scrollable,
  ...popupProps
}: AppPopupProps) {
  return (
    <>
      {trigger && <div onClick={onOpen}>{trigger}</div>}
      <Popup
        {...popupProps}
        position="bottom"
        bodyClassName="rounded-t-2xl"
        onMaskClick={onClose}
      >
        <div
          className={cn("p-4 pb-8 space-y-4", scrollable && "max-h-[85vh] overflow-y-auto")}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">{title}</h3>
            <Button
              fill="none"
              size="small"
              onClick={onClose}
              className="text-gray-400!"
            >
              Đóng
            </Button>
          </div>

          {children}

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          {onSubmit && (
            <Button
              block
              color="primary"
              className="mt-5 rounded-xl!"
              loading={submitLoading}
              disabled={submitDisabled}
              onClick={onSubmit}
            >
              {submitLabel}
            </Button>
          )}
        </div>
      </Popup>
    </>
  );
}
