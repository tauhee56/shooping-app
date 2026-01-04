import React, { createContext, useState, useContext } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([
    {
      id: '1',
      name: 'Lavender Soap',
      store: 'Soap Queen',
      price: 12.99,
      rating: 9.5,
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108',
    },
  ]);

  const toggleFavorite = (item) => {
    setFavorites((prevFavorites) => {
      const exists = prevFavorites.find((fav) => fav.id === item.id);
      if (exists) {
        // Remove from favorites
        return prevFavorites.filter((fav) => fav.id !== item.id);
      } else {
        // Add to favorites
        return [...prevFavorites, item];
      }
    });
  };

  const isFavorite = (itemId) => {
    return favorites.some((fav) => fav.id === itemId);
  };

  const removeFavorite = (itemId) => {
    setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.id !== itemId));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
