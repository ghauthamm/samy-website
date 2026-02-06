import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiGrid, FiPackage, FiShoppingCart, FiUsers, FiSettings,
    FiLogOut, FiChevronLeft, FiChevronRight, FiBell, FiSearch,
    FiBarChart2, FiFileText, FiMenu, FiX
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    const menuItems = [
        { path: '/admin', icon: FiGrid, label: 'Dashboard', end: true },
        { path: '/admin/products', icon: FiPackage, label: 'Products' },
        { path: '/admin/orders', icon: FiShoppingCart, label: 'Orders' },
        { path: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
        { path: '/admin/users', icon: FiUsers, label: 'Users' },
        { path: '/admin/reports', icon: FiFileText, label: 'Reports' },
        { path: '/admin/settings', icon: FiSettings, label: 'Settings' },
    ];

    return (
        <div className={`admin-layout ${collapsed ? 'collapsed' : ''}`}>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="mobile-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="logo-icon">ST</span>
                        {!collapsed && <span className="logo-text">SAMY TRENDS</span>}
                    </div>
                    <button
                        className="close-mobile hide-desktop"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <FiX />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <item.icon className="nav-icon" />
                            {!collapsed && <span className="nav-label">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="toggle-btn hide-mobile" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut className="nav-icon" />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="admin-main">
                {/* Top Bar */}
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <button className="mobile-menu-btn hide-desktop" onClick={() => setMobileMenuOpen(true)}>
                            <FiMenu />
                        </button>
                        <div className="search-box">
                            <FiSearch className="search-icon" />
                            <input type="text" placeholder="Search products, orders..." />
                        </div>
                    </div>

                    <div className="topbar-right">
                        <button className="topbar-btn notification-btn">
                            <FiBell />
                            <span className="notification-badge">3</span>
                        </button>
                        <div className="user-menu">
                            <div className="user-avatar">
                                {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="user-info hide-mobile">
                                <span className="user-name">Admin</span>
                                <span className="user-role">Administrator</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
