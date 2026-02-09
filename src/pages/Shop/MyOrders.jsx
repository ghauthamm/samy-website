import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiPackage, FiClock, FiCheck, FiTruck, FiMapPin,
    FiCalendar, FiCreditCard, FiX, FiChevronRight, FiShoppingBag
} from 'react-icons/fi';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import './MyOrders.css';

const MyOrders = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        if (!currentUser) {
            // If user not logged in, show all orders (for demo purposes)
            // In production, you might want to redirect to login
            loadAllOrders();
        } else {
            loadUserOrders();
        }
    }, [currentUser, filterStatus]);

    const loadAllOrders = () => {
        const ordersRef = ref(database, 'orders');

        const unsubscribe = onValue(ordersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const ordersList = Object.entries(data).map(([id, order]) => ({
                    id,
                    ...order
                })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setOrders(ordersList);
            } else {
                setOrders([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    };

    const loadUserOrders = () => {
        const ordersRef = ref(database, 'orders');
        const userOrdersQuery = query(ordersRef, orderByChild('userId'), equalTo(currentUser.uid));

        const unsubscribe = onValue(userOrdersQuery, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const ordersList = Object.entries(data).map(([id, order]) => ({
                    id,
                    ...order
                })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setOrders(ordersList);
            } else {
                setOrders([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            pending: { label: 'Pending', color: '#f59e0b', icon: FiClock },
            paid: { label: 'Paid', color: '#10b981', icon: FiCheck },
            processing: { label: 'Processing', color: '#3b82f6', icon: FiPackage },
            shipped: { label: 'Shipped', color: '#8b5cf6', icon: FiTruck },
            delivered: { label: 'Delivered', color: '#10b981', icon: FiCheck },
            cancelled: { label: 'Cancelled', color: '#ef4444', icon: FiX }
        };

        return statusMap[status?.toLowerCase()] || { label: status || 'Unknown', color: '#6b7280', icon: FiPackage };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredOrders = orders.filter(order => {
        if (filterStatus === 'all') return true;
        return order.status?.toLowerCase() === filterStatus;
    });

    if (loading) {
        return (
            <div className="my-orders-page">
                <div className="orders-container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading your orders...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-orders-page">
            <div className="orders-container">
                {/* Header */}
                <div className="orders-header">
                    <div className="header-content">
                        <h1><FiShoppingBag /> My Orders</h1>
                        <p>View and track all your orders</p>
                    </div>
                    <div className="header-stats">
                        <div className="stat-card">
                            <span className="stat-value">{orders.length}</span>
                            <span className="stat-label">Total Orders</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">
                                {orders.filter(o => o.status === 'paid').length}
                            </span>
                            <span className="stat-label">Completed</span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="orders-filters">
                    {['all', 'paid', 'pending', 'processing', 'shipped', 'delivered'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <motion.div
                        className="empty-orders"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="empty-icon">
                            <FiPackage />
                        </div>
                        <h2>No orders found</h2>
                        <p>You haven't placed any orders yet. Start shopping now!</p>
                        <motion.button
                            className="shop-now-btn"
                            onClick={() => navigate('/shop')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Start Shopping
                        </motion.button>
                    </motion.div>
                ) : (
                    <div className="orders-grid">
                        {filteredOrders.map((order, index) => {
                            const statusInfo = getStatusInfo(order.status);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <motion.div
                                    key={order.id}
                                    className="order-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -4 }}
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <div className="order-header">
                                        <div className="order-id">
                                            <FiPackage />
                                            <span>{order.orderId}</span>
                                        </div>
                                        <div
                                            className="order-status"
                                            style={{
                                                backgroundColor: `${statusInfo.color}20`,
                                                color: statusInfo.color
                                            }}
                                        >
                                            <StatusIcon />
                                            {statusInfo.label}
                                        </div>
                                    </div>

                                    <div className="order-date">
                                        <FiCalendar />
                                        <span>{formatDate(order.createdAt)}</span>
                                    </div>

                                    <div className="order-items-preview">
                                        <div className="items-images">
                                            {order.items?.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className="item-image">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} />
                                                    ) : (
                                                        <div className="image-placeholder">📦</div>
                                                    )}
                                                </div>
                                            ))}
                                            {order.items?.length > 3 && (
                                                <div className="more-items">
                                                    +{order.items.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <span className="items-count">
                                            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    <div className="order-footer">
                                        <div className="order-amount">
                                            <span className="amount-label">Total Amount</span>
                                            <span className="amount-value">
                                                ₹{order.amount?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0'}
                                            </span>
                                        </div>
                                        <div className="payment-method">
                                            <FiCreditCard />
                                            {order.paymentMethod === 'razorpay' ? 'Online' : 'COD'}
                                        </div>
                                    </div>

                                    <button className="view-details-btn">
                                        View Details <FiChevronRight />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <motion.div
                        className="order-modal"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Order Details</h2>
                            <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="modal-content">
                            {/* Order Info */}
                            <div className="order-info-section">
                                <div className="info-row">
                                    <span className="label">Order ID:</span>
                                    <span className="value">{selectedOrder.orderId}</span>
                                </div>
                                {selectedOrder.paymentId && (
                                    <div className="info-row">
                                        <span className="label">Payment ID:</span>
                                        <span className="value">{selectedOrder.paymentId}</span>
                                    </div>
                                )}
                                <div className="info-row">
                                    <span className="label">Order Date:</span>
                                    <span className="value">{formatDate(selectedOrder.createdAt)}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Status:</span>
                                    <span className="value status-badge" style={{
                                        backgroundColor: `${getStatusInfo(selectedOrder.status).color}20`,
                                        color: getStatusInfo(selectedOrder.status).color
                                    }}>
                                        {getStatusInfo(selectedOrder.status).label}
                                    </span>
                                </div>
                            </div>

                            {/* Customer Details */}
                            {selectedOrder.customerDetails && (
                                <div className="customer-details-section">
                                    <h3><FiMapPin /> Delivery Address</h3>
                                    <div className="address-card">
                                        <p className="customer-name">{selectedOrder.customerDetails.fullName}</p>
                                        <p>{selectedOrder.customerDetails.address}</p>
                                        <p>{selectedOrder.customerDetails.city}, {selectedOrder.customerDetails.state} - {selectedOrder.customerDetails.pincode}</p>
                                        <p>Phone: {selectedOrder.customerDetails.phone}</p>
                                        <p>Email: {selectedOrder.customerDetails.email}</p>
                                    </div>
                                </div>
                            )}

                            {/* Ordered Items */}
                            <div className="ordered-items-section">
                                <h3><FiPackage /> Ordered Items</h3>
                                <div className="items-list">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="modal-item">
                                            <div className="item-image">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} />
                                                ) : (
                                                    <div className="image-placeholder">📦</div>
                                                )}
                                            </div>
                                            <div className="item-details">
                                                <h4>{item.name}</h4>
                                                <p>Qty: {item.quantity}</p>
                                                <span className="item-price">₹{item.price?.toLocaleString()}</span>
                                            </div>
                                            <div className="item-total">
                                                ₹{(item.price * item.quantity)?.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="payment-summary-section">
                                <h3><FiCreditCard /> Payment Summary</h3>
                                <div className="summary-rows">
                                    <div className="summary-row">
                                        <span>Payment Method:</span>
                                        <span>{selectedOrder.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Total Amount:</span>
                                        <span className="total-amount">
                                            ₹{selectedOrder.amount?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;
