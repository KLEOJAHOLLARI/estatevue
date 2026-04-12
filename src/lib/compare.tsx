import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface CompareProperty {
  id: string;
  title: string;
  price: number;
  city: string;
  state: string | null;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number | null;
  images: string[] | null;
  address: string | null;
}

interface CompareContextType {
  selected: CompareProperty[];
  toggle: (property: CompareProperty) => void;
  remove: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<CompareProperty[]>([]);

  const toggle = useCallback((property: CompareProperty) => {
    setSelected((prev) => {
      const exists = prev.find((p) => p.id === property.id);
      if (exists) return prev.filter((p) => p.id !== property.id);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, property];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => setSelected([]), []);

  const isSelected = useCallback((id: string) => selected.some((p) => p.id === id), [selected]);

  return (
    <CompareContext.Provider value={{ selected, toggle, remove, clear, isSelected }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
