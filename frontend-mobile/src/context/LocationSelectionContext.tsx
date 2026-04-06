import React, { createContext, useContext, useMemo, useRef, ReactNode } from 'react';
import { NormalizedLocation } from '../types/location';

interface StoredSelection {
  location: NormalizedLocation;
  nonce: string;
}

interface LocationSelectionContextType {
  setPendingSelection: (key: string, location: NormalizedLocation) => void;
  consumePendingSelection: (key: string) => StoredSelection | null;
}

const LocationSelectionContext = createContext<LocationSelectionContextType | undefined>(undefined);

export function LocationSelectionProvider({ children }: { children: ReactNode }) {
  const selectionsRef = useRef<Record<string, StoredSelection>>({});

  const value = useMemo<LocationSelectionContextType>(() => ({
    setPendingSelection: (key, location) => {
      selectionsRef.current[key] = {
        location,
        nonce: location.lastUpdatedAt || new Date().toISOString(),
      };
    },
    consumePendingSelection: (key) => {
      const selection = selectionsRef.current[key];
      if (!selection) return null;
      delete selectionsRef.current[key];
      return selection;
    },
  }), []);

  return (
    <LocationSelectionContext.Provider value={value}>
      {children}
    </LocationSelectionContext.Provider>
  );
}

export function useLocationSelection() {
  const context = useContext(LocationSelectionContext);
  if (!context) {
    throw new Error('useLocationSelection must be used within a LocationSelectionProvider');
  }
  return context;
}
