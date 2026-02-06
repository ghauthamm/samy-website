import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiClock, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import './POSLayout.css';

const POSLayout = () => {
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

    const currentTime = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const currentDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
    });

    return (
        <div className="pos-layout">
            {/* Top Bar */}
            <header className="pos-header">
                <div className="header-left">
                    <div className="pos-logo">
                        <span className="logo-icon">ST</span>
                        <div className="logo-text">
                            <span className="brand">SAMY TRENDS</span>
                            <span className="sub">Point of Sale</span>
                        </div>
                    </div>
                </div>

                <nav className="pos-nav">
                    <NavLink to="/pos" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <FiShoppingCart />
                        <span>New Sale</span>
                    </NavLink>
                    <NavLink to="/pos/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <FiClock />
                        <span>History</span>
                    </NavLink>
                </nav>

                <div className="header-right">
                    <div className="time-display">
                        <span className="time">{currentTime}</span>
                        <span className="date">{currentDate}</span>
                    </div>
                    <div className="user-info">
                        <div className="user-avatar">
                            <FiUser />
                        </div>
                        <span className="user-name">Cashier</span>
                    </div>
                    <motion.button
                        className="logout-btn"
                        onClick={handleLogout}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiLogOut />
                    </motion.button>
                </div>
            </header>

            {/* Main Content */}
            <main className="pos-main">
                <Outlet />
            </main>
        </div>
    );
};

export default POSLayout;
