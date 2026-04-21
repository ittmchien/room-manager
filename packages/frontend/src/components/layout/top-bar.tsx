'use client';

import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TopBarProps {
  propertyName: string;
}

export function TopBar({ propertyName }: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-3 md:hidden">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-blue-600 text-sm text-white">
          {propertyName[0]?.toUpperCase() || 'R'}
        </AvatarFallback>
      </Avatar>

      <button className="flex items-center gap-1 text-sm font-semibold">
        {propertyName}
        <span className="text-muted-foreground">▾</span>
      </button>

      <button className="relative">
        <Bell className="h-5 w-5 text-gray-600" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
          3
        </span>
      </button>
    </header>
  );
}
