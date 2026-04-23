"use client";

import { useIsFetching } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function InitialLoadingPortal() {
  const [loaded, setLoaded] = useState(false);
  const fetchStarted = useRef(false);
  const isFetching = useIsFetching();

  useEffect(() => {
    if (isFetching > 0) fetchStarted.current = true;
    if (fetchStarted.current && isFetching === 0 && !loaded) {
      setLoaded(true);
    }
  }, [isFetching, loaded]);

  if (loaded || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-surface-container-lowest">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-fixed border-t-primary" />
        <p className="text-sm text-on-surface-variant">Đang tải...</p>
      </div>
    </div>,
    document.body,
  );
}
