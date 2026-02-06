import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiHome, FiGrid, FiShoppingCart, FiUser, FiHeart, FiSearch,
    FiMenu, FiX, FiChevronDown, FiLogOut, FiPackage
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import './ShopLayout.css';

const ShopLayout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { currentUser, logout } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    return (
        <div className="shop-layout">
            {/* Header */}
            <header className={`shop-header ${scrolled ? 'scrolled' : ''}`}>
                <div className="header-container">
                    <div className="header-left">
                        <button
                            className="mobile-menu-btn hide-desktop"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <FiMenu />
                        </button>
                        <Link to="/" className="shop-logo">
                            <span className="logo-icon">ST</span>
                            <span className="logo-text">SAMY TRENDS</span>
                        </Link>
                    </div>

                    <nav className="main-nav hide-mobile">
                        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                            Home
                        </NavLink>
                        <NavLink to="/shop" className={({ isActive }) => isActive ? 'active' : ''}>
                            Shop
                        </NavLink>
                        <div className="nav-dropdown">
                            <button className="dropdown-trigger">
                                Categories <FiChevronDown />
                            </button>
                            <div className="dropdown-menu">
                                <Link to="/shop?category=electronics">Electronics</Link>
                                <Link to="/shop?category=clothing">Clothing</Link>
                                <Link to="/shop?category=accessories">Accessories</Link>
                                <Link to="/shop?category=sports">Sports</Link>
                                <Link to="/shop?category=home">Home & Living</Link>
                            </div>
                        </div>
                        <NavLink to="/offers" className={({ isActive }) => isActive ? 'active' : ''}>
                            Offers
                        </NavLink>
                    </nav>

                    <div className="header-right">
                        <button className="icon-btn search-btn" onClick={() => setSearchOpen(!searchOpen)}>
                            <FiSearch />
                        </button>
                        <Link to="/wishlist" className="icon-btn hide-mobile">
                            <FiHeart />
                        </Link>
                        <Link to="/cart" className="icon-btn cart-btn">
                            <FiShoppingCart />
                            {getCartCount() > 0 && (
                                <span className="cart-badge">{getCartCount()}</span>
                            )}
                        </Link>
                        {currentUser ? (
                            <div className="user-dropdown">
                                <button
                                    className="user-trigger"
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                >
                                    <div className="user-avatar">
                                        {currentUser.email?.charAt(0).toUpperCase()}
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <motion.div
                                            className="user-menu"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                        >
                                            <Link to="/profile" onClick={() => setUserMenuOpen(false)}>
                                                <FiUser /> My Profile
                                            </Link>
                                            <Link to="/orders" onClick={() => setUserMenuOpen(false)}>
                                                <FiPackage /> My Orders
                                            </Link>
                                            <button onClick={handleLogout}>
                                                <FiLogOut /> Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link to="/login" className="login-btn hide-mobile">
                                Login
                            </Link>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <AnimatePresence>
                    {searchOpen && (
                        <motion.div
                            className="search-bar"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className="search-container">
                                <FiSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search for products, brands..."
                                    autoFocus
                                />
                                <button className="close-search" onClick={() => setSearchOpen(false)}>
                                    <FiX />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            className="mobile-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            className="mobile-menu"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween' }}
                        >
                            <div className="mobile-menu-header">
                                <span className="logo-icon">ST</span>
                                <button onClick={() => setMobileMenuOpen(false)}>
                                    <FiX />
                                </button>
                            </div>
                            <nav className="mobile-nav">
                                <NavLink to="/" end onClick={() => setMobileMenuOpen(false)}>
                                    <FiHome /> Home
                                </NavLink>
                                <NavLink to="/shop" onClick={() => setMobileMenuOpen(false)}>
                                    <FiGrid /> Shop
                                </NavLink>
                                <NavLink to="/cart" onClick={() => setMobileMenuOpen(false)}>
                                    <FiShoppingCart /> Cart
                                </NavLink>
                                <NavLink to="/wishlist" onClick={() => setMobileMenuOpen(false)}>
                                    <FiHeart /> Wishlist
                                </NavLink>
                                {currentUser ? (
                                    <>
                                        <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)}>
                                            <FiUser /> Profile
                                        </NavLink>
                                        <NavLink to="/orders" onClick={() => setMobileMenuOpen(false)}>
                                            <FiPackage /> Orders
                                        </NavLink>
                                    </>
                                ) : (
                                    <NavLink to="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <FiUser /> Login
                                    </NavLink>
                                )}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="shop-main">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="shop-footer">
                <div className="footer-container">
                    <div className="footer-section">
                        <div className="footer-logo">
                            <span className="logo-icon">ST</span>
                            <span>SAMY TRENDS</span>
                        </div>
                        <p>Your one-stop destination for trendy products at the best prices. Quality you can trust, service you'll love.</p>
                    </div>
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/shop">Shop</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Customer Service</h4>
                        <ul>
                            <li><Link to="/faq">FAQ</Link></li>
                            <li><Link to="/shipping">Shipping Info</Link></li>
                            <li><Link to="/returns">Returns</Link></li>
                            <li><Link to="/track-order">Track Order</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Contact Us</h4>
                        <p>📍 123 Main Street, City</p>
                        <p>📞 +91 98765 43210</p>
                        <p>✉️ support@samytrends.com</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2025 SAMY TRENDS. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default ShopLayout;
