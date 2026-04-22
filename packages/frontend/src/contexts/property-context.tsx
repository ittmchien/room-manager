'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProperties } from '@/hooks/use-properties';

interface PropertyContextValue {
  propertyId: string;
  setPropertyId: (id: string) => void;
}

const PropertyContext = createContext<PropertyContextValue>({
  propertyId: '',
  setPropertyId: () => {},
});

export function PropertyProvider({ children }: { children: ReactNode }) {
  const { data: properties } = useProperties();
  const [propertyId, setPropertyId] = useState('');

  // Auto-select first property on load if none selected
  useEffect(() => {
    if (!propertyId && properties && properties.length > 0) {
      setPropertyId(properties[0].id);
    }
  }, [properties, propertyId]);

  return (
    <PropertyContext.Provider value={{ propertyId, setPropertyId }}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  return useContext(PropertyContext);
}
