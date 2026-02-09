import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGrid, FiList, FiFilter, FiX, FiShoppingCart, FiHeart, FiChevronDown } from 'react-icons/fi';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import './ShopPage.css';

const ShopPage = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
    const [priceRange, setPriceRange] = useState([0, 50000]);
    const [sortBy, setSortBy] = useState('popularity');
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const categories = ['All', 'Electronics', 'Clothing', 'Accessories', 'Sports', 'Home & Living', 'Beauty'];

    const demoProducts = [
        { id: '1', name: 'Wireless Earbuds Pro', category: 'Electronics', price: 2999, originalPrice: 4999, rating: 4.8, reviews: 128, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop' },
        { id: '2', name: 'Smart Watch Elite', category: 'Electronics', price: 8999, originalPrice: 12999, rating: 4.6, reviews: 89, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' },
        { id: '3', name: 'Designer Handbag', category: 'Accessories', price: 4599, originalPrice: 6999, rating: 4.9, reviews: 256, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop' },
        { id: '4', name: 'Premium Running Shoes', category: 'Sports', price: 3499, originalPrice: 4999, rating: 4.7, reviews: 178, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
        { id: '5', name: 'Formal Cotton Shirt', category: 'Clothing', price: 1299, originalPrice: 1999, rating: 4.5, reviews: 67, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop' },
        { id: '6', name: 'LED Desk Lamp', category: 'Home & Living', price: 899, originalPrice: 1499, rating: 4.4, reviews: 43, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop' },
        { id: '7', name: 'Bluetooth Speaker', category: 'Electronics', price: 1599, originalPrice: 2499, rating: 4.6, reviews: 92, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop' },
        { id: '8', name: 'Leather Wallet', category: 'Accessories', price: 799, originalPrice: 1299, rating: 4.3, reviews: 35, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop' },
        { id: '9', name: 'Yoga Mat Premium', category: 'Sports', price: 999, originalPrice: 1499, rating: 4.7, reviews: 88, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop' },
        { id: '10', name: 'Casual Polo T-Shirt', category: 'Clothing', price: 699, originalPrice: 999, rating: 4.5, reviews: 124, image: 'https://images.unsplash.com/photo-1625910513413-5fc5f97f1703?w=400&h=400&fit=crop' },
        { id: '11', name: 'Wireless Mouse', category: 'Electronics', price: 599, originalPrice: 999, rating: 4.4, reviews: 56, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop' },
        { id: '12', name: 'Sunglasses Classic', category: 'Accessories', price: 1499, originalPrice: 2499, rating: 4.6, reviews: 78, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop' },
    ];

    useEffect(() => {
        const productsRef = ref(database, 'products');
        const unsubscribe = onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const productList = Object.entries(data).map(([id, product]) => ({
                    id,
                    ...product
                }));
                setProducts(productList);
            } else {
                setProducts(demoProducts);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'all' ||
            product.category?.toLowerCase() === selectedCategory.toLowerCase();
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        return matchesCategory && matchesPrice;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            default:
                return 0;
        }
    });

    return (
        <div className="shop-page">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <span>Home</span> / <span>Shop</span>
                {selectedCategory !== 'all' && <> / <span className="current">{selectedCategory}</span></>}
            </div>

            <div className="shop-container">
                {/* Filters Sidebar */}
                <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
                    <div className="filters-header">
                        <h3>Filters</h3>
                        <button className="close-filters hide-desktop" onClick={() => setShowFilters(false)}>
                            <FiX />
                        </button>
                    </div>

                    <div className="filter-section">
                        <h4>Categories</h4>
                        <ul className="category-list">
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <button
                                        className={`category-btn ${selectedCategory === cat.toLowerCase() || (cat === 'All' && selectedCategory === 'all') ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat === 'All' ? 'all' : cat.toLowerCase())}
                                    >
                                        {cat}
                                        <span className="count">
                                            {cat === 'All'
                                                ? products.length
                                                : products.filter(p => p.category?.toLowerCase() === cat.toLowerCase()).length}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="filter-section">
                        <h4>Price Range</h4>
                        <div className="price-inputs">
                            <input
                                type="number"
                                placeholder="Min"
                                value={priceRange[0] || ''}
                                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                            />
                            <span>to</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={priceRange[1] || ''}
                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                            />
                        </div>
                    </div>

                    <button className="apply-filters hide-desktop" onClick={() => setShowFilters(false)}>
                        Apply Filters
                    </button>
                </aside>

                {/* Mobile Filter Overlay */}
                {showFilters && (
                    <div className="filter-overlay" onClick={() => setShowFilters(false)}></div>
                )}

                {/* Products Section */}
                <div className="products-section">
                    <div className="products-header">
                        <div className="results-count">
                            <h1>Products</h1>
                            <span>{sortedProducts.length} products found</span>
                        </div>
                        <div className="products-controls">
                            <button className="filter-btn hide-desktop" onClick={() => setShowFilters(true)}>
                                <FiFilter /> Filters
                            </button>
                            <div className="sort-select">
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="popularity">Popular</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                                <FiChevronDown className="select-icon" />
                            </div>
                            <div className="view-toggle hide-mobile">
                                <button
                                    className={viewMode === 'grid' ? 'active' : ''}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <FiGrid />
                                </button>
                                <button
                                    className={viewMode === 'list' ? 'active' : ''}
                                    onClick={() => setViewMode('list')}
                                >
                                    <FiList />
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className={`products-grid ${viewMode}`}>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="product-card-skeleton skeleton"></div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            className={`products-grid ${viewMode}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {sortedProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    className="product-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    whileHover={{ y: -6 }}
                                >
                                    <div className="product-image">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} />
                                        ) : (
                                            <div className="image-placeholder">📦</div>
                                        )}
                                        {product.originalPrice > product.price && (
                                            <span className="discount-badge">
                                                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                            </span>
                                        )}
                                        <div className="product-actions">
                                            <button
                                                className={`action-btn wishlist ${isInWishlist(product.id) ? 'active' : ''}`}
                                                onClick={() => toggleWishlist(product)}
                                            >
                                                <FiHeart />
                                            </button>
                                            <button
                                                className="action-btn add-to-cart"
                                                onClick={() => addToCart(product)}
                                            >
                                                <FiShoppingCart />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="product-info">
                                        <span className="product-category">{product.category}</span>
                                        <h3 className="product-name">{product.name}</h3>
                                        {product.rating && (
                                            <div className="product-rating">
                                                <span className="stars">{'★'.repeat(Math.floor(product.rating))}</span>
                                                <span className="rating-value">{product.rating}</span>
                                                <span className="reviews">({product.reviews || 0})</span>
                                            </div>
                                        )}
                                        <div className="product-prices">
                                            <span className="current-price">₹{product.price.toLocaleString()}</span>
                                            {product.originalPrice > product.price && (
                                                <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {!loading && sortedProducts.length === 0 && (
                        <div className="no-products">
                            <span className="no-products-icon">📦</span>
                            <h3>No products found</h3>
                            <p>Try adjusting your filters or search criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopPage;
