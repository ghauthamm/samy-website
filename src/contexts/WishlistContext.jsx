import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState(() => {
        const savedWishlist = localStorage.getItem('samyTrendsWishlist');
        return savedWishlist ? JSON.parse(savedWishlist) : [];
    });

    useEffect(() => {
        localStorage.setItem('samyTrendsWishlist', JSON.stringify(wishlistItems));
    }, [wishlistItems]);

    const addToWishlist = (product) => {
        setWishlistItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                // Already in wishlist, don't add again
                return prevItems;
            }
            return [...prevItems, product];
        });
    };

    const removeFromWishlist = (productId) => {
        setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const toggleWishlist = (product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.id === productId);
    };

    const clearWishlist = () => {
        setWishlistItems([]);
    };

    const getWishlistCount = () => {
        return wishlistItems.length;
    };

    const value = {
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        getWishlistCount
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
