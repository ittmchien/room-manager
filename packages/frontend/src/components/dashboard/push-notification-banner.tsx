'use client';

import { Bell } from 'lucide-react';
import { usePushSubscription } from '@/hooks/use-push-subscription';

export function PushNotificationBanner() {
  const { permission, isSubscribed, isLoading, isSupported, error, subscribe } = usePushSubscription();

  // Only render on client after support is confirmed
  if (!isSupported || isSubscribed || permission === 'denied' || permission === 'granted') return null;

  return (
    <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <Bell className="h-4 w-4 text-blue-600" />
        <div>
          <p className="text-sm font-medium text-blue-800">
            Bật thông báo để nhắc tiền thuê
          </p>
          {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
        </div>
      </div>
      <button
        onClick={subscribe}
        disabled={isLoading}
        className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
      >
        {isLoading ? 'Đang bật...' : 'Bật'}
      </button>
    </div>
  );
}
