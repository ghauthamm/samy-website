import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSearch, FiFilter, FiDownload, FiEye, FiX, FiCheck,
    FiClock, FiTruck, FiPackage, FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const ordersRef = ref(database, 'orders');
        const unsubscribe = onValue(ordersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const orderList = Object.entries(data).map(([id, order]) => ({
                    id,
                    ...order
                }));
                setOrders(orderList.sort((a, b) => new Date(b.date) - new Date(a.date)));
            } else {
                // Demo orders
                setOrders([
                    {
                        id: 'ORD-2847',
                        customer: { name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 98765 43210' },
                        items: [
                            { name: 'Wireless Earbuds Pro', quantity: 2, price: 2999 },
                            { name: 'Phone Case', quantity: 1, price: 499 }
                        ],
                        subtotal: 6497,
                        tax: 1169,
                        total: 7666,
                        status: 'delivered',
                        paymentMethod: 'UPI',
                        date: '2026-02-07T08:30:00',
                        shippingAddress: '123 MG Road, Bangalore, Karnataka 560001'
                    },
                    {
                        id: 'ORD-2846',
                        customer: { name: 'Priya Patel', email: 'priya@example.com', phone: '+91 98765 43211' },
                        items: [
                            { name: 'Smart Watch Elite', quantity: 1, price: 8999 }
                        ],
                        subtotal: 8999,
                        tax: 1620,
                        total: 10619,
                        status: 'shipped',
                        paymentMethod: 'Card',
                        date: '2026-02-07T07:15:00',
                        shippingAddress: '456 Park Street, Mumbai, Maharashtra 400001'
                    },
                    {
                        id: 'ORD-2845',
                        customer: { name: 'Amit Kumar', email: 'amit@example.com', phone: '+91 98765 43212' },
                        items: [
                            { name: 'Designer Handbag', quantity: 1, price: 4599 },
                            { name: 'Sunglasses', quantity: 2, price: 1299 }
                        ],
                        subtotal: 7197,
                        tax: 1295,
                        total: 8492,
                        status: 'processing',
                        paymentMethod: 'Cash',
                        date: '2026-02-07T06:00:00',
                        shippingAddress: '789 Nehru Place, Delhi, Delhi 110019'
                    },
                    {
                        id: 'ORD-2844',
                        customer: { name: 'Sneha Reddy', email: 'sneha@example.com', phone: '+91 98765 43213' },
                        items: [
                            { name: 'Premium Running Shoes', quantity: 1, price: 3499 },
                            { name: 'Sports Bag', quantity: 1, price: 1999 }
                        ],
                        subtotal: 5498,
                        tax: 990,
                        total: 6488,
                        status: 'pending',
                        paymentMethod: 'UPI',
                        date: '2026-02-07T05:45:00',
                        shippingAddress: '321 Tank Bund Road, Hyderabad, Telangana 500001'
                    },
                    {
                        id: 'ORD-2843',
                        customer: { name: 'Vikash Singh', email: 'vikash@example.com', phone: '+91 98765 43214' },
                        items: [
                            { name: 'LED Desk Lamp', quantity: 3, price: 899 }
                        ],
                        subtotal: 2697,
                        tax: 485,
                        total: 3182,
                        status: 'cancelled',
                        paymentMethod: 'Card',
                        date: '2026-02-07T04:30:00',
                        shippingAddress: '654 Gandhi Nagar, Pune, Maharashtra 411001'
                    }
                ]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredOrders = orders.filter(order => {
        const orderId = order.id || '';
        const customerName = order.customer?.name || '';
        const customerEmail = order.customer?.email || '';
        const orderStatus = order.status || '';

        const matchesSearch =
            orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || orderStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return FiClock;
            case 'processing': return FiPackage;
            case 'shipped': return FiTruck;
            case 'delivered': return FiCheckCircle;
            case 'cancelled': return FiXCircle;
            default: return FiClock;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'processing': return 'info';
            case 'shipped': return 'primary';
            case 'delivered': return 'success';
            case 'cancelled': return 'danger';
            default: return 'default';
        }
    };

    const stats = [
        { label: 'Total Orders', value: orders.length, color: 'blue' },
        { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'orange' },
        { label: 'Processing', value: orders.filter(o => o.status === 'processing').length, color: 'purple' },
        { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'green' }
    ];

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    return (
        <div className="admin-orders">
            <div className="orders-header">
                <div>
                    <h1>Orders</h1>
                    <p>Manage and track all customer orders</p>
                </div>
                <motion.button
                    className="export-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <FiDownload />
                    Export Orders
                </motion.button>
            </div>

            <div className="orders-stats">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        className={`stat-item ${stat.color}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <span className="stat-label">{stat.label}</span>
                        <span className="stat-value">{stat.value}</span>
                    </motion.div>
                ))}
            </div>

            <div className="orders-filters">
                <div className="search-filter">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by order ID, customer name, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="status-filter">
                    <FiFilter className="filter-icon" />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-skeleton">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton-row skeleton"></div>
                    ))}
                </div>
            ) : (
                <div className="orders-table-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order, index) => {
                                const StatusIcon = getStatusIcon(order.status);
                                return (
                                    <motion.tr
                                        key={order.id || index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <td className="order-id">{order.id || '-'}</td>
                                        <td>
                                            <div className="customer-info">
                                                <span className="customer-name">{order.customer?.name || 'Unknown'}</span>
                                                <span className="customer-email">{order.customer?.email || '-'}</span>
                                            </div>
                                        </td>
                                        <td>{(order.items?.length || 0)} item(s)</td>
                                        <td className="total">₹{(order.total || 0).toLocaleString()}</td>
                                        <td>
                                            <span className="payment-badge">{order.paymentMethod || '-'}</span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusColor(order.status)}`}>
                                                <StatusIcon />
                                                {order.status || 'unknown'}
                                            </span>
                                        </td>
                                        <td>{order.date ? new Date(order.date).toLocaleDateString() : '-'}</td>
                                        <td>
                                            <button
                                                className="action-btn view"
                                                onClick={() => handleViewOrder(order)}
                                            >
                                                <FiEye />
                                            </button>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredOrders.length === 0 && (
                        <div className="no-results">
                            <p>No orders found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Order Details Modal */}
            <AnimatePresence>
                {showModal && selectedOrder && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            className="modal-content order-modal"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Order Details - {selectedOrder.id || 'N/A'}</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}>
                                    <FiX />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="order-detail-grid">
                                    <div className="detail-section">
                                        <h3>Customer Information</h3>
                                        <p><strong>Name:</strong> {selectedOrder.customer?.name || 'Unknown'}</p>
                                        <p><strong>Email:</strong> {selectedOrder.customer?.email || '-'}</p>
                                        <p><strong>Phone:</strong> {selectedOrder.customer?.phone || '-'}</p>
                                        <p><strong>Address:</strong> {selectedOrder.shippingAddress || '-'}</p>
                                    </div>
                                    <div className="detail-section">
                                        <h3>Order Information</h3>
                                        <p><strong>Order ID:</strong> {selectedOrder.id || '-'}</p>
                                        <p><strong>Date:</strong> {selectedOrder.date ? new Date(selectedOrder.date).toLocaleString() : '-'}</p>
                                        <p><strong>Payment:</strong> {selectedOrder.paymentMethod || '-'}</p>
                                        <p>
                                            <strong>Status:</strong>{' '}
                                            <span className={`status-badge ${getStatusColor(selectedOrder.status)}`}>
                                                {selectedOrder.status || 'unknown'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="detail-section items-section">
                                    <h3>Order Items</h3>
                                    <table className="items-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Quantity</th>
                                                <th>Price</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(selectedOrder.items || []).map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item.name || 'Unknown Item'}</td>
                                                    <td>{item.quantity || 0}</td>
                                                    <td>₹{(item.price || 0).toLocaleString()}</td>
                                                    <td>₹{((item.quantity || 0) * (item.price || 0)).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="order-summary">
                                        <div className="summary-row">
                                            <span>Subtotal:</span>
                                            <span>₹{(selectedOrder.subtotal || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Tax (18%):</span>
                                            <span>₹{(selectedOrder.tax || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="summary-row total">
                                            <span>Total:</span>
                                            <span>₹{(selectedOrder.total || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Orders;
