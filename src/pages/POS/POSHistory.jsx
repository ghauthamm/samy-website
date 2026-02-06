import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiCalendar, FiFilter, FiDownload, FiEye, FiClock } from 'react-icons/fi';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { database } from '../../config/firebase';
import './POSHistory.css';

const POSHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('today');

    useEffect(() => {
        const ordersRef = ref(database, 'orders');
        const ordersQuery = query(ordersRef, orderByChild('createdAt'));

        const unsubscribe = onValue(ordersQuery, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const ordersList = Object.entries(data).map(([id, order]) => ({
                    id,
                    ...order
                })).reverse(); // Newest first
                setOrders(ordersList);
            } else {
                setOrders([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.paymentMethod && order.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()));

        // Date filtering logic could go here
        return matchesSearch;
    });

    return (
        <div className="pos-history">
            <div className="history-header">
                <div>
                    <h1>Sales History</h1>
                    <p>View and manage past transactions</p>
                </div>
                <div className="history-actions">
                    <button className="export-btn">
                        <FiDownload /> Export Report
                    </button>
                </div>
            </div>

            <div className="history-filters">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by invoice or payment method..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </div>

            <div className="history-table-container">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Invoice ID</th>
                            <th>Date & Time</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            // Loading rows
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="loading-row">
                                    <td colSpan="7"><div className="skeleton-row"></div></td>
                                </tr>
                            ))
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map((order, index) => (
                                <motion.tr
                                    key={order.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <td className="invoice-id">{order.invoiceNumber}</td>
                                    <td>
                                        <div className="date-time">
                                            <FiCalendar /> {new Date(order.createdAt).toLocaleDateString()}
                                            <span className="time"><FiClock /> {new Date(order.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="items-count">{order.items?.length || 0} items</span>
                                    </td>
                                    <td className="amount">₹{order.total?.toLocaleString()}</td>
                                    <td>
                                        <span className={`payment-badge ${order.paymentMethod}`}>
                                            {order.paymentMethod}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="status-badge success">Completed</span>
                                    </td>
                                    <td>
                                        <button className="action-icon" title="View Details">
                                            <FiEye />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    No sales found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default POSHistory;
