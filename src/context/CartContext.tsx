import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "../data/content";

export type CartLine = {
  product: Product;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "selva-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  function addItem(product: Product, qty = 1) {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, qty: l.qty + qty } : l,
        );
      }
      return [...prev, { product, qty }];
    });
    setIsOpen(true);
  }

  function removeItem(productId: string) {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  }

  function setQty(productId: string, qty: number) {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    setLines((prev) =>
      prev.map((l) => (l.product.id === productId ? { ...l, qty } : l)),
    );
  }

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines],
  );
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty * l.product.price, 0),
    [lines],
  );

  return (
    <CartContext.Provider
      value={{
        lines,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        addItem,
        removeItem,
        setQty,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
