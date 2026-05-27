import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { token } = useAuth();    // only active when user is logged in
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlistIds = useCallback(async () => {
    if (!token) {
      setWishlistIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/wishlist');
      // res.data is an array of Product objects – extract IDs
      const ids = new Set(res.data.map(p => p.id));
      setWishlistIds(ids);
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch wishlist whenever token changes (login/logout)
  useEffect(() => {
    fetchWishlistIds();
  }, [fetchWishlistIds]);

  const addToWishlist = async (productId) => {
    if (!token) return;
    try {
      await axios.post(`http://localhost:8080/api/wishlist/${productId}`);
      setWishlistIds(prev => new Set(prev).add(productId));
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!token) return;
    try {
      await axios.delete(`http://localhost:8080/api/wishlist/${productId}`);
      setWishlistIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWishlist = (productId) => {
    if (wishlistIds.has(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const isInWishlist = (productId) => wishlistIds.has(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);