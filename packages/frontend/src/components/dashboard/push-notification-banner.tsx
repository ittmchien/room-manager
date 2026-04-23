'use client';

import { useState, useEffect } from 'react';
import { NoticeBar } from 'antd-mobile';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { apiFetch } from '@/lib/api';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const arr = Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  return arr.buffer as ArrayBuffer;
}

export function PushNotificationBanner() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'denied'>('idle');

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (localStorage.getItem('push-banner-dismissed') === '1') { setState('done'); return; }
    if (Notification.permission === 'granted') setState('done');
    if (Notification.permission === 'denied') setState('denied');
  }, []);

  if (state === 'done' || state === 'denied') return null;

  const handleSubscribe = async () => {
    setState('loading');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setState('denied'); return; }

      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) { setState('idle'); return; }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const { endpoint, keys } = subscription.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      await apiFetch('/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({ endpoint, p256dhKey: keys.p256dh, authKey: keys.auth }),
      });

      setState('done');
    } catch {
      setState('idle');
    }
  };

  return (
    <NoticeBar
      icon={<Bell className="h-4 w-4" />}
      content="Bật thông báo để nhận nhắc nhở thanh toán"
      color="info"
      extra={
        <Button
          size="mini"
          color="primary"
          loading={state === 'loading'}
          onClick={handleSubscribe}
        >
          Bật
        </Button>
      }
    />
  );
}
