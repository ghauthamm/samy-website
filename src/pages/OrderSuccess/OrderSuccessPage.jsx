import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiTruck, FiHome } from 'react-icons/fi';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderData = location.state?.orderData;

    if (!orderData) {
        navigate('/shop');
        return null;
    }

    return (
        <div className="order-success-page">
            <motion.div
                className="success-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="success-icon"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    <FiCheckCircle />
                </motion.div>

                <h1>Order Placed Successfully!</h1>
                <p className="success-message">
                    Thank you for your order. We've received your order and will send you a confirmation email shortly.
                </p>

                <div className="order-details">
                    <div className="detail-item">
                        <span className="label">Order ID:</span>
                        <span className="value">{orderData.orderId}</span>
                    </div>
                    {orderData.paymentId && (
                        <div className="detail-item">
                            <span className="label">Payment ID:</span>
                            <span className="value">{orderData.paymentId}</span>
                        </div>
                    )}
                    <div className="detail-item">
                        <span className="label">Total Amount:</span>
                        <span className="value amount">₹{orderData.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="detail-item">
                        <span className="label">Payment Method:</span>
                        <span className="value">{orderData.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}</span>
                    </div>
                </div>

                <div className="order-timeline">
                    <h3>What's Next?</h3>
                    <div className="timeline">
                        <div className="timeline-item active">
                            <div className="timeline-icon">
                                <FiCheckCircle />
                            </div>
                            <div className="timeline-content">
                                <h4>Order Confirmed</h4>
                                <p>Your order has been placed successfully</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-icon">
                                <FiPackage />
                            </div>
                            <div className="timeline-content">
                                <h4>Processing</h4>
                                <p>We're preparing your items</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-icon">
                                <FiTruck />
                            </div>
                            <div className="timeline-content">
                                <h4>Shipped</h4>
                                <p>Your order will be on its way soon</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ordered-items">
                    <h3>Ordered Items ({orderData.items.length})</h3>
                    <div className="items-grid">
                        {orderData.items.map((item) => (
                            <div key={item.id} className="order-item">
                                <img src={item.image || '/placeholder.png'} alt={item.name} />
                                <div className="item-info">
                                    <h4>{item.name}</h4>
                                    <p>Qty: {item.quantity}</p>
                                    <span className="price">₹{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="action-buttons">
                    <motion.button
                        className="btn-primary"
                        onClick={() => navigate('/shop')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Continue Shopping
                    </motion.button>
                    <motion.button
                        className="btn-secondary"
                        onClick={() => navigate('/')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiHome /> Go to Home
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderSuccessPage;
