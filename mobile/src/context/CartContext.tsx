import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartAPI } from '../utils/api';
import { getErrorMessage } from '../utils/errorMapper';
import { AuthContext } from './AuthContext';

type CartTotals = {
  subtotal: number;
  total: number;
};

type CartState = {
  items: any[];
  totals: CartTotals | null;
  loading: boolean;
  error: string | null;
};

type CartContextValue = CartState & {
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQty: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  checkout: (deliveryAddress: any, paymentMethod?: any) => Promise<any>;
  clearCartState: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, initializing } = useContext(AuthContext);

  const [state, setState] = useState<CartState>({
    items: [],
    totals: null,
    loading: false,
    error: null,
  });

  const clearCartState = useCallback(() => {
    setState({ items: [], totals: null, loading: false, error: null });
  }, []);

  const refreshCart = useCallback(async () => {
    if (!token) {
      clearCartState();
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await cartAPI.getCart();
      setState({
        items: Array.isArray(res.data?.items) ? res.data.items : [],
        totals: res.data?.totals || null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error, 'Failed to load cart'),
      }));
    }
  }, [token, clearCartState]);

  const addToCart = useCallback(
    async (productId: string, quantity: number) => {
      if (!token) throw new Error('Not authenticated');
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await cartAPI.addItem(productId, quantity);
        setState({
          items: Array.isArray(res.data?.items) ? res.data.items : [],
          totals: res.data?.totals || null,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: getErrorMessage(error, 'Failed to add to cart'),
        }));
        throw error;
      }
    },
    [token]
  );

  const updateQty = useCallback(
    async (productId: string, quantity: number) => {
      if (!token) throw new Error('Not authenticated');
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await cartAPI.updateItem(productId, quantity);
        setState({
          items: Array.isArray(res.data?.items) ? res.data.items : [],
          totals: res.data?.totals || null,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: getErrorMessage(error, 'Failed to update cart'),
        }));
        throw error;
      }
    },
    [token]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      if (!token) throw new Error('Not authenticated');
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await cartAPI.removeItem(productId);
        setState({
          items: Array.isArray(res.data?.items) ? res.data.items : [],
          totals: res.data?.totals || null,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: getErrorMessage(error, 'Failed to remove item'),
        }));
        throw error;
      }
    },
    [token]
  );

  const checkout = useCallback(
    async (deliveryAddress: any, paymentMethod?: any) => {
      if (!token) throw new Error('Not authenticated');
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const res = await cartAPI.checkout(deliveryAddress, paymentMethod);
        await refreshCart();
        setState((prev) => ({ ...prev, loading: false }));
        return res.data;
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: getErrorMessage(error, 'Failed to checkout'),
        }));
        throw error;
      }
    },
    [token, refreshCart]
  );

  useEffect(() => {
    if (initializing) return;
    if (!token) {
      clearCartState();
      return;
    }
    refreshCart();
  }, [token, initializing, refreshCart, clearCartState]);

  const value = useMemo<CartContextValue>(
    () => ({
      ...state,
      refreshCart,
      addToCart,
      updateQty,
      removeFromCart,
      checkout,
      clearCartState,
    }),
    [state, refreshCart, addToCart, updateQty, removeFromCart, checkout, clearCartState]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
