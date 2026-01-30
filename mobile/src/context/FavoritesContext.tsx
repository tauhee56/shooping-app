import React, { createContext, useEffect, useMemo, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { productAPI, storeAPI } from '../utils/api';

type FavoriteItem = {
  id: string;
  name: string;
  store: any;
  price: number;
  rating: number;
  image: string;
};

type FavoritesContextValue = {
  favorites: FavoriteItem[];
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (itemId: string) => boolean;
  removeFavorite: (itemId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useContext(AuthContext);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const favoriteIndex = useMemo(() => {
    const map = new Map<string, FavoriteItem>();
    for (const f of favorites) map.set(f.id, f);
    return map;
  }, [favorites]);

  const loadFavorites = async () => {
    if (!token) {
      setFavorites([]);
      return;
    }

    const [likedProductsRes, followedStoresRes] = await Promise.all([
      productAPI.getLikedProducts(),
      storeAPI.getFollowedStores(),
    ]);

    const likedProductsRaw = Array.isArray(likedProductsRes?.data) ? likedProductsRes.data : [];
    const followedStoresRaw = Array.isArray(followedStoresRes?.data) ? followedStoresRes.data : [];

    const likedProducts: FavoriteItem[] = likedProductsRaw
      .map((p: any) => {
        const storeName =
          p?.store && typeof p.store === 'object' ? p.store?.name : typeof p?.store === 'string' ? p.store : '';
        const img = (Array.isArray(p?.images) && p.images[0]) || p?.image || '';
        return {
          id: String(p?._id || p?.id || ''),
          name: p?.name || 'Product',
          store: storeName,
          price: typeof p?.price === 'number' ? p.price : Number(p?.price || 0),
          rating: typeof p?.rating === 'number' ? p.rating : Number(p?.rating || 0),
          image: img,
        };
      })
      .filter((x) => !!x.id);

    const followedStores: FavoriteItem[] = followedStoresRaw
      .map((s: any) => {
        const img = s?.logo || s?.banner || '';
        return {
          id: String(s?._id || s?.id || ''),
          name: s?.name || 'Store',
          store: s?.name || 'Store',
          price: 0,
          rating: typeof s?.rating === 'number' ? s.rating : Number(s?.rating || 0),
          image: img,
        };
      })
      .filter((x) => !!x.id);

    setFavorites([...likedProducts, ...followedStores]);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadFavorites();
      } catch {
        if (!cancelled) setFavorites([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const toggleFavorite = (item: FavoriteItem) => {
    // Optimistic update (UI unchanged), then sync with backend.
    const exists = favoriteIndex.has(item.id);
    setFavorites((prev) => (exists ? prev.filter((f) => f.id !== item.id) : [...prev, item]));

    if (!token) return;

    const isStore = item.price === 0;
    if (isStore) {
      storeAPI
        .followStore(item.id)
        .then((res) => {
          const isFollowing = typeof res?.data?.isFollowing === 'boolean' ? res.data.isFollowing : null;
          if (isFollowing === null) return;
          setFavorites((prev) => {
            const has = prev.some((f) => f.id === item.id);
            if (isFollowing && !has) return [...prev, item];
            if (!isFollowing && has) return prev.filter((f) => f.id !== item.id);
            return prev;
          });
        })
        .catch(() => {
          // revert optimistic
          setFavorites((prev) => {
            const has = prev.some((f) => f.id === item.id);
            if (exists && !has) return [...prev, item];
            if (!exists && has) return prev.filter((f) => f.id !== item.id);
            return prev;
          });
        });
      return;
    }

    productAPI
      .likeProduct(item.id)
      .then((res) => {
        const isLiked = typeof res?.data?.isLiked === 'boolean' ? res.data.isLiked : null;
        if (isLiked === null) return;
        setFavorites((prev) => {
          const has = prev.some((f) => f.id === item.id);
          if (isLiked && !has) return [...prev, item];
          if (!isLiked && has) return prev.filter((f) => f.id !== item.id);
          return prev;
        });
      })
      .catch(() => {
        // revert optimistic
        setFavorites((prev) => {
          const has = prev.some((f) => f.id === item.id);
          if (exists && !has) return [...prev, item];
          if (!exists && has) return prev.filter((f) => f.id !== item.id);
          return prev;
        });
      });
  };

  const isFavorite = (itemId: string) => {
    return favorites.some((fav) => fav.id === itemId);
  };

  const removeFavorite = (itemId: string) => {
    const existing = favoriteIndex.get(itemId);
    setFavorites((prev) => prev.filter((fav) => fav.id !== itemId));

    if (!token || !existing) return;

    const isStore = existing.price === 0;
    if (isStore) {
      storeAPI.followStore(itemId).catch(() => {
        setFavorites((prev) => (prev.some((f) => f.id === itemId) ? prev : [...prev, existing]));
      });
      return;
    }

    productAPI.likeProduct(itemId).catch(() => {
      setFavorites((prev) => (prev.some((f) => f.id === itemId) ? prev : [...prev, existing]));
    });
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
