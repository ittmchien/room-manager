'use client';

import { Bell } from 'lucide-react';

interface TopBarProps {
  propertyName: string;
}

export function TopBar({ propertyName }: TopBarProps) {
  return (
    <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm shadow-blue-100/40 md:hidden">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm text-white">
          🏠
        </div>
        <span className="font-bold text-gray-900">Room Manager</span>
      </div>

      {/* Property selector */}
      <button className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700">
        <span className="max-w-[120px] truncate">{propertyName}</span>
        <span className="text-blue-400">▾</span>
      </button>

      {/* Notification */}
      <button className="relative p-1">
        <Bell className="h-5 w-5 text-gray-500" />
        <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
      </button>
    </header>
  );
}
