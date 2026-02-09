import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShoppingCart, FiTruck, FiShield, FiHeadphones } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import './Home.css';

const Home = () => {
    const { addToCart } = useCart();

    const featuredProducts = [
        { id: '1', name: 'Wireless Earbuds Pro', category: 'Electronics', price: 2999, originalPrice: 4999, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop', rating: 4.8 },
        { id: '2', name: 'Smart Watch Elite', category: 'Electronics', price: 8999, originalPrice: 12999, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', rating: 4.6 },
        { id: '3', name: 'Designer Handbag', category: 'Accessories', price: 4599, originalPrice: 6999, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop', rating: 4.9 },
        { id: '4', name: 'Premium Running Shoes', category: 'Sports', price: 3499, originalPrice: 4999, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', rating: 4.7 },
    ];

    const categories = [
        { name: 'Electronics', icon: '📱', count: 120, color: '#3b82f6' },
        { name: 'Clothing', icon: '👕', count: 250, color: '#8b5cf6' },
        { name: 'Accessories', icon: '👜', count: 85, color: '#ec4899' },
        { name: 'Sports', icon: '⚽', count: 65, color: '#22c55e' },
        { name: 'Home & Living', icon: '🏠', count: 95, color: '#f59e0b' },
        { name: 'Beauty', icon: '💄', count: 78, color: '#ef4444' },
    ];

    const offers = [
        { title: 'Flash Sale', subtitle: 'Up to 60% OFF', bg: 'linear-gradient(135deg, #dc2626, #f97316)' },
        { title: 'New Arrivals', subtitle: 'Fresh Collection', bg: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' },
        { title: 'Weekend Special', subtitle: 'Extra 15% OFF', bg: 'linear-gradient(135deg, #22c55e, #14b8a6)' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-bg">
                    <div className="hero-pattern"></div>
                </div>
                <div className="hero-container">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="hero-badge">✨ New Season Collection</span>
                        <h1>Discover Your <span className="highlight">Style</span></h1>
                        <p>Explore our curated collection of premium products. From fashion to electronics, find everything you need with amazing deals.</p>
                        <div className="hero-cta">
                            <Link to="/shop" className="btn-primary">
                                Shop Now <FiArrowRight />
                            </Link>
                            <Link to="/offers" className="btn-secondary">
                                View Offers
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-value">10K+</span>
                                <span className="stat-label">Products</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">50K+</span>
                                <span className="stat-label">Customers</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">4.8★</span>
                                <span className="stat-label">Rating</span>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        className="hero-image"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="image-placeholder">
                            <span>🛍️</span>
                        </div>
                        <div className="floating-card card-1">
                            <span className="card-icon">🎧</span>
                            <span className="card-text">New Arrivals</span>
                        </div>
                        <div className="floating-card card-2">
                            <span className="card-emoji">🔥</span>
                            <span className="card-price">-40% OFF</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Bar */}
            <section className="features-bar">
                <div className="features-container">
                    <div className="feature">
                        <FiTruck className="feature-icon" />
                        <div>
                            <span className="feature-title">Free Shipping</span>
                            <span className="feature-text">On orders over ₹999</span>
                        </div>
                    </div>
                    <div className="feature">
                        <FiShield className="feature-icon" />
                        <div>
                            <span className="feature-title">Secure Payment</span>
                            <span className="feature-text">100% secure transactions</span>
                        </div>
                    </div>
                    <div className="feature">
                        <FiHeadphones className="feature-icon" />
                        <div>
                            <span className="feature-title">24/7 Support</span>
                            <span className="feature-text">Dedicated support team</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <div className="section-container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2>Shop by Category</h2>
                        <p>Explore our wide range of categories</p>
                    </motion.div>
                    <motion.div
                        className="categories-grid"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        {categories.map((category) => (
                            <motion.div
                                key={category.name}
                                variants={itemVariants}
                            >
                                <Link to={`/shop?category=${category.name.toLowerCase()}`} className="category-card">
                                    <div className="category-icon" style={{ background: `${category.color}15` }}>
                                        <span>{category.icon}</span>
                                    </div>
                                    <h3>{category.name}</h3>
                                    <span className="product-count">{category.count} products</span>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Offers Section */}
            <section className="offers-section">
                <div className="section-container">
                    <motion.div
                        className="offers-grid"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        {offers.map((offer, index) => (
                            <motion.div
                                key={offer.title}
                                className="offer-card"
                                style={{ background: offer.bg }}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="offer-content">
                                    <h3>{offer.title}</h3>
                                    <p>{offer.subtitle}</p>
                                    <Link to="/offers" className="offer-link">
                                        Shop Now <FiArrowRight />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="products-section">
                <div className="section-container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2>Featured Products</h2>
                        <Link to="/shop" className="view-all">
                            View All <FiArrowRight />
                        </Link>
                    </motion.div>
                    <motion.div
                        className="products-grid"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        {featuredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                className="product-card"
                                variants={itemVariants}
                                whileHover={{ y: -8 }}
                            >
                                <div className="product-image">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} />
                                    ) : (
                                        <div className="image-placeholder">
                                            <span>📦</span>
                                        </div>
                                    )}
                                    <span className="discount-badge">
                                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                    </span>
                                    <button
                                        className="quick-add"
                                        onClick={() => addToCart(product)}
                                    >
                                        <FiShoppingCart />
                                    </button>
                                </div>
                                <div className="product-info">
                                    <span className="product-category">{product.category}</span>
                                    <h3 className="product-name">{product.name}</h3>
                                    <div className="product-rating">
                                        {'★'.repeat(Math.floor(product.rating))}
                                        <span>{product.rating}</span>
                                    </div>
                                    <div className="product-prices">
                                        <span className="current-price">₹{product.price.toLocaleString()}</span>
                                        <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="newsletter-section">
                <div className="newsletter-container">
                    <motion.div
                        className="newsletter-content"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2>Get 10% Off Your First Order</h2>
                        <p>Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and more!</p>
                        <form className="newsletter-form">
                            <input type="email" placeholder="Enter your email address" />
                            <button type="submit">Subscribe</button>
                        </form>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
